(ns abhimata_backend.db
  (:gen-class)
  (:require [abhimata_backend.event :as event]
            [clojure.java.jdbc :as jdbc]
            [clojure.data.json :as json]
            [ring.util.response :as resp]
            [clojure.walk :as walk]))

(def db-spec {:subprotocol "postgresql",
              :subname "//localhost:5432/knyb",
              :user "knyb"})

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
       (jdbc/query db-spec ["select * from abhimata_public_events"]))))

(defn get-events-private []
  (resp/response (map unstringify-registration-form 
       (jdbc/query db-spec ["select * from abhimata_event"]))))

(defn get-event [id]
  (let [result 
        (jdbc/query 
         db-spec ["select * from abhimata_event where event_id = ?" 
                  (Integer. id)])]
    (if (empty? result)
      {:status 404, 
       :body (str "Event " id " does not exist.")}
      (resp/response (unstringify-registration-form (first result))))))


(defn save-event [event-data]
  (resp/response 
   (let [keywordized-data (walk/keywordize-keys event-data)]
     (jdbc/update! db-spec :abhimata_event
                  (stringify-registration-form (dissoc keywordized-data :event_id))
                  ["event_id = ?" (:event_id keywordized-data)]))))

(defn delete-event [event-id]
  (resp/response (jdbc/delete! db-spec :abhimata_event
                               ["event_id = ?" (Integer. event-id)])))


(defn make-event []
  (resp/response (jdbc/insert! db-spec :abhimata_event event/default-event)))

(defn register-for-event [submission-data]
  (let [submitted-form (submission-data "submitted_form")
        insert-cols {:event_id (submission-data "event_id")
                     :submitted_form (json/write-str submitted-form)
                     :email ((submitted-form (str event/email-key)) "value")}
        insert-result (jdbc/insert! db-spec :abhimata_registration
                                    insert-cols)]
    (if (nil? (first insert-result))
      { :status 403
       :body "The event you tried to sign up for is fully booked." }
      (resp/response "The application was successfully submitted."))))

(defn fetch-admin-credentials [username]
  "Fetches admin credentials in the form expected by friend's
   bcrypt-credential-fn"
  (let [query-results (jdbc/query db-spec 
                       ["select * from abhimata_admin where username = ?" 
                        username])]
    (if (empty? query-results) 
      nil
      (assoc (into {} query-results) :roles #{:admin}))))
