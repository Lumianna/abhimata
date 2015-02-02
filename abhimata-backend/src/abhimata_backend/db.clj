(ns abhimata_backend.db
  (:gen-class)
  (:require [abhimata_backend.event :as event]
            [abhimata_backend.config :as config]
            [abhimata_backend.macros :as macros]
            [clojure.stacktrace]
            [clojure.java.jdbc :as jdbc]
            [clojure.data.json :as json]
            [clj-time.core :as time]
            [clj-time.coerce :as coercetime]
            [postal.core :as postal]
            [hiccup.core :as hiccup]
            [schema.core :as sc]
            [ring.util.response :as resp]
            [clojure.walk :as walk])
  (:import java.sql.SQLException))

(def max-transaction-attempts 5)

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


(defn get-public-event-list []
  (resp/response
   (map
    unstringify-registration-form 
    (jdbc/query
     (get-db-spec)
     ["select * from abhimata_public_events"]))))

(defn get-event-public [id]
  (if-let
      [event
       (jdbc/query
        (get-db-spec)
        ["select * from abhimata_public_events where event_id = ?"
         (Integer. id)]
        :result-set-fn first)]
    (resp/response (unstringify-registration-form event))
    {:status 404
     :body "Event does not exist."}))


(defn get-events-private []
  (resp/response
   (map
    unstringify-registration-form 
    (jdbc/query (get-db-spec) ["select * from abhimata_event"]))))

(defn get-participants [id & {:keys [connection]
                              :or {connection (get-db-spec)}}]
  (let [applications
        (jdbc/query
         connection 
         ["select * from abhimata_registration where event_id = ?" 
          (Integer. id)])
        {not-cancelled false cancelled true}
        (group-by :cancelled applications)
        {participants false waiting-list true}
        (group-by :on_waiting_list not-cancelled)]
        
  (resp/response
   {:participants participants
    :waitingList waiting-list
    :cancelled cancelled})))

(defn get-event-by-id [id & {:keys [connection]
                              :or {connection (get-db-spec)}}]
  (jdbc/query 
   connection
   ["select * from abhimata_event where event_id = ?" id]
   :result-set-fn first))

(defn get-event [id]
  (let [event (get-event-by-id (Integer. id))]
    (if event
      (resp/response (unstringify-registration-form event))
      {:status 404, 
       :body (str "Event " id " does not exist.")})))


(defn save-event [event-id event-data]
  "Update an event in the database."
  (let [keywordized-data (walk/keywordize-keys event-data)
        db-ready-data (stringify-registration-form
                       (dissoc keywordized-data :event_id))]
       (if (sc/check event/Event db-ready-data)
         {:status 403
          :body "Invalid event data; this is probably a bug in Abhimata."}
         (resp/response
          (jdbc/update! (get-db-spec) :abhimata_event db-ready-data
                        ["event_id = ?" (Integer. event-id)])))))

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
  (str (:backend-url (config/get-config)) "/verify-email/" uuid))

(defn make-cancellation-url [uuid]
  (str (:frontend-url (config/get-config)) "/cancel/" uuid))

(defn queue-cancellation-email [user-email event_id uuid]
  (let [event (get-event-by-id event_id)]
    (queue-email 
     {:to user-email,
      :event_id event_id,
      :subject "If you need to cancel your registration"
      :body (str "Thank you for registering for the event \""
                 (:title event) "\". If you later find that you "
                 "need to cancel your "
                 "registration, you can use this link: "
                 (make-cancellation-url uuid) " . Do not share this link "
                 "with anyone else.")})))

(defn verify-email [uuid]
  (let [update-res 
        (jdbc/update! (get-db-spec) :abhimata_registration
                      {:email_verified true}
                      ["email_verification_code = ? and email_verified = false" uuid])]
    (if (> (first update-res) 0)
      (resp/response
       (hiccup/html
        [:html
         [:head
          [:title "Your email has been verified."]]
         [:body
          [:h1 "Thank you for verifying your email."]
          [:p "We have emailed you another link that you can use if you wish to cancel your application."]]]))

      {:status 404
       :body (hiccup/html
              [:html
               [:head
                [:title "Invalid email verification link"]]
               [:body
                [:h1 "Invalid email verification link"]
                [:p "We could not find an unverified email address corresponding to this link. Either you have already verified your email address, or there is something wrong with the link. Please contact the event managers."]]])})))

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

(defn queue-verification-email [user-email event_id email-uuid]
  (queue-email 
   {:to user-email,
    :event_id event_id,
    :subject "Please verify your email address"
    :body (str "Please click on the following link to verify your email address: " (make-email-verification-url email-uuid) )}))

(defn get-registration-form [event-id]
  (json/read-str
   (:registration_form 
    (jdbc/query
     (get-db-spec) 
     ["select registration_form from abhimata_event 
        where event_id = ?" event-id]
     :result-set-fn first))))

(defn insert-registration! [event_id registration]
  "If the event has open slots or room on the waiting list, inserts registration
   with the appropriate waiting list status. Uses a serializable transaction to
   make sure that the event can't be overbooked. The transaction is
   automatically retried a few times if it fails. If the insertion succeeds, 
   returns the data inserted (augmented with primary key and waiting list
   status); otherwise returns nil."

  (macros/try-times
   max-transaction-attempts
   (jdbc/with-db-transaction [tr-con (get-db-spec) :isolation :serializable]
     (let [event (get-event-by-id event_id :connection tr-con)
           participants (:body (get-participants event_id :connection tr-con))
           event-full (>= (count (:participants participants))
                             (:max_participants event))
           waiting-list-full (>= (count (:waitingList participants))
                                 (:max_waiting_list_length event))
           registration (assoc registration :on_waiting_list event-full)]
       (if (or (not (:registration_open event))
               (and event-full waiting-list-full))
         nil
         (if-let [insert-result
                  (first
                   (jdbc/insert! tr-con :abhimata_registration registration))]
           (assoc registration :registration_id insert-result)
           nil))))))
               
(defn register-for-event [submission-data]
  (try
    (let [{submitted-form "submitted_form"
           event_id "event_id"} submission-data
           registration-form (get-registration-form event_id)
           _ (sc/validate (event/make-submitted-application-schema
                           registration-form)
                          submission-data)
           user-email (submitted-form (str event/email-key))
           email-uuid (random-uuid)
           cancellation-code (random-uuid)
           insert-cols {:event_id event_id
                        :submitted_form (json/write-str submitted-form)
                        :cancelled false
                        :email user-email
                        :email_verification_code email-uuid
                        :cancellation_code cancellation-code}
           insert-result (insert-registration! event_id insert-cols)]
      (if (not insert-result)
        {:status 403
         :body "The event you tried to sign up for is either fully booked or not accepting registrations."}
        (do 
          (queue-verification-email user-email event_id email-uuid)
          (queue-cancellation-email user-email event_id cancellation-code)
          (future (flush-email-queue))
          (resp/response "Your application has been submitted, but you will still need to verify your email address by clicking on the link that we just emailed you."))))
    (catch SQLException e (throw e))
    (catch Exception e
      (.printStackTrace e)
      {:status 403
       :body "Invalid registration form (this is probably a bug in Abhimata)."})))

(defn get-registration-info [uuid]
  (if-let [registration
           (jdbc/query
            (get-db-spec)
            ["select * from abhimata_registration where cancellation_code = ?"
             uuid]
            :result-set-fn first)]
    (let [event-title
          (:title
           (jdbc/query
            (get-db-spec)
            ["select title from abhimata_event where event_id = ?"
             (:event_id registration)]
            :result-set-fn first))]
      (resp/response
       {:eventTitle event-title
        :alreadyCancelled (:cancelled registration)
        :onWaitingList false}))
    {:status 404
     :body "No registration matching that cancellation uuid."}))

(defn cancel-registration! [uuid]
  (if-let [registration
           (jdbc/query
            (get-db-spec)
            ["select * from abhimata_registration where cancellation_code = ?"
             uuid]
            :result-set-fn first)]
    (let [changed-entries
          (jdbc/update!
           (get-db-spec)
           :abhimata_registration
           {:cancelled true}
           ["cancellation_code = ?" uuid])]
      (if (> (first changed-entries) 0)
        (resp/response "cancellation successful")
        {:status 500
         :body "Cancellation failed (this shouldn't happen)"}))
    {:status 404
     :body "No registration matching that cancellation uuid."}))


(defn fetch-admin-credentials [username]
  "Fetches admin credentials in the form expected by friend's
   bcrypt-credential-fn"
  (let [query-results (jdbc/query (get-db-spec) 
                       ["select * from abhimata_admin where username = ?" 
                        username])]
    (if (empty? query-results) 
      nil
      (assoc (into {} query-results) :roles #{:admin}))))
