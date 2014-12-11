(ns abhimata_backend.db
  (:gen-class)
  (:require [abhimata_backend.event :as event]
            [clojure.java.jdbc :as jdbc]
            [clojure.data.json :as json]
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
  (map unstringify-registration-form 
       (jdbc/query db-spec ["select * from abhimata_public_events"])))

(defn get-events-private []
  (map unstringify-registration-form 
       (jdbc/query db-spec ["select * from abhimata_event"])))

(defn get-event [id]
  (let [result 
        (jdbc/query 
         db-spec ["select * from abhimata_event where event_id = ?" 
                  (Integer. id)])]
    (if (empty? result)
      {:status 404, 
       :body (str "Event " id " does not exist.")}
      {:status 200, :body (unstringify-registration-form (first result))})))


(defn save-event [event-data]
  (do
    (let [keywordized-data (walk/keywordize-keys event-data)]
    (jdbc/update! db-spec :abhimata_event
                  (stringify-registration-form (dissoc keywordized-data :event_id))
                  ["event_id = ?" (:event_id keywordized-data)]))))

(defn delete-event [event-id]
  (jdbc/delete! db-spec :abhimata_event
                  ["event_id = ?" (Integer. event-id)]))


(defn make-event []
  (jdbc/insert! db-spec :abhimata_event event/default-event))

(defn register-for-event [submission-data]
  (jdbc/insert! 
   db-spec :abhimata_registration
   (let [submitted-form (submission-data "submitted_form")]
         {:event_id (submission-data "event_id")
          :submitted_form (json/write-str submitted-form)
          :email ((submitted-form (str event/email-key)) "value")})))

(defn fetch-admin-credentials [username]
  "Fetches admin credentials in the form expected by friend's
   bcrypt-credential-fn"
  (let [query-results (jdbc/query db-spec 
                       ["select * from abhimata_admin where username = ?" 
                        username])]
    (if (empty? query-results) 
      nil
      (assoc (into {} query-results) :roles #{:admin}))))
