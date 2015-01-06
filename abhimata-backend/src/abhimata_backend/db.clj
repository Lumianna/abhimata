(ns abhimata_backend.db
  (:gen-class)
  (:require [abhimata_backend.event :as event]
            [abhimata_backend.config :as config]
            [clojure.stacktrace]
            [clojure.java.jdbc :as jdbc]
            [clojure.data.json :as json]
            [clj-time.core :as time]
            [clj-time.coerce :as coercetime]
            [postal.core :as postal]
            [ring.util.response :as resp]
            [clojure.walk :as walk]))

(defn get-db-spec []
  (:db-spec (config/get-config)))

;The PostgreSQL version we're using doesn't support JSON values, so
;the registration form needs to be turned into a string before it's
;stored into the database.

(defn stringify-registration-form [event-data]
  (let [stringified-form (json/write-str (:registration_form event-data))]
    (assoc event-data :registration_form stringified-form)))

(defn unstringify-registration-form [db-event-query]
  (let [unstringified-form (json/read-str (:registration_form db-event-query))]
    (assoc db-event-query :registration_form unstringified-form)))


(defn get-events-public []
  (resp/response (map unstringify-registration-form 
       (jdbc/query (get-db-spec) ["select * from abhimata_public_events"]))))

(defn get-events-private []
  (resp/response (map unstringify-registration-form 
       (jdbc/query (get-db-spec) ["select * from abhimata_event"]))))

(defn get-participants [id]
  (resp/response
   (jdbc/query (get-db-spec) 
               ["select * from abhimata_registration where event_id = ?"
                (Integer. id)])))

(defn get-event [id]
  (let [result 
        (jdbc/query 
         (get-db-spec) ["select * from abhimata_event where event_id = ?" 
                  (Integer. id)])]
    (if (empty? result)
      {:status 404, 
       :body (str "Event " id " does not exist.")}
      (resp/response (unstringify-registration-form (first result))))))


(defn save-event [event-data]
  (resp/response 
   (let [keywordized-data (walk/keywordize-keys event-data)]
     (jdbc/update! (get-db-spec) :abhimata_event
                  (stringify-registration-form (dissoc keywordized-data :event_id))
                  ["event_id = ?" (:event_id keywordized-data)]))))

(defn delete-event [event-id]
  (resp/response (jdbc/delete! (get-db-spec) :abhimata_event
                               ["event_id = ?" (Integer. event-id)])))


(defn make-event []
  (resp/response (jdbc/insert! (get-db-spec) :abhimata_event event/default-event)))

(defn random-uuid []
  (str (java.util.UUID/randomUUID)))

(defn queue-email [{:keys [to body subject event_id]}]
  (let [{:keys [registration_id email]} 
        (first 
          (jdbc/query (get-db-spec) 
            ["select * from abhimata_registration where 
                    event_id = ? and email = ?" event_id to]))]
    (jdbc/insert! (get-db-spec) :abhimata_email 
      {:registration_id registration_id,
       :event_id event_id
       :send_time (coercetime/to-timestamp (time/now))
       :body body
       :subject subject
       :sent false})))

(defn make-email-verification-url [uuid]
  (str (:url (config/get-config)) "/verify-email/" uuid))

(defn verify-email [uuid]
  (let [update-res 
        (jdbc/update! (get-db-spec) :abhimata_registration
          {:email_verified true} ["email_verification_code = ?" uuid])]
    (if (> (first update-res) 0)
      (resp/response "Thank you for verifying your email address. We have emailed you another link that you can use if you wish to cancel your application.")
      {:status 403 :body "There was a problem with verifying your email address."})))

(defn send-email [{:keys [email body subject email_id]}]
  (try
    (let [send-result 
          (postal/send-message 
            (:smtp-conf (config/get-config))
            {:from (:email-from (config/get-config))
             :to email
             :body body
             :subject subject})]
      (if (= (:error send-result) :SUCCESS)
        (jdbc/update! (get-db-spec) :abhimata_email
          {:sent true}
          ["email_id = ?" email_id])
        send-result))
    ;This should only fail if the SMTP server is down or something like that.
    ;In that case sending the message will just be retried later.
    (catch Exception e (clojure.stacktrace/print-stack-trace e))))

(defn flush-email-queue []
  (let [emails (jdbc/query (get-db-spec) 
                [(str "select e.*, r.email"
                   " from abhimata_email e, abhimata_registration r"
                   " where e.sent = false"
                   " and e.send_time < current_timestamp"
                   " and e.registration_id = r.registration_id")])]
    (doall (map send-email emails))))

(defn register-for-event [submission-data]
  (let [{submitted-form "submitted_form"
         event_id "event_id"} submission-data
        user-email ((submitted-form (str event/email-key)) "value")
        email-uuid (random-uuid)
        insert-cols {:event_id event_id
                     :submitted_form (json/write-str submitted-form)
                     :email user-email
                     :email_verification_code email-uuid
                     :cancellation_code (random-uuid)}
        insert-result (jdbc/insert! (get-db-spec) :abhimata_registration
                        insert-cols :result-set-fn first)]
    (if (nil? insert-result)
      { :status 403
       :body "The event you tried to sign up for is fully booked." }
      (do 
        (queue-email 
          {:to user-email,
           :event_id event_id,
           :subject "Please verify your email address"
           :body (str "Please click on the following link to verify your email address: " (make-email-verification-url email-uuid) )})
        (future (flush-email-queue))
        (resp/response "Your application has been submitted, but you will still need to verify your email address by clicking on the link that we just emailed you.")))))

(defn fetch-admin-credentials [username]
  "Fetches admin credentials in the form expected by friend's
   bcrypt-credential-fn"
  (let [query-results (jdbc/query (get-db-spec) 
                       ["select * from abhimata_admin where username = ?" 
                        username])]
    (if (empty? query-results) 
      nil
      (assoc (into {} query-results) :roles #{:admin}))))
