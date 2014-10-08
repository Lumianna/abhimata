(ns abhimata_backend.db
  (:gen-class)
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.data.json :as json]
            [clojure.walk :as walk]))

(def db-spec {:subprotocol "postgresql",
              :subname "//localhost:5432/knyb",
              :user "knyb"})

(defn save-form [json-form]
  (do
    (jdbc/update! db-spec :abhimata_event
                  {:title "Test event",
                   :signup_form (json/write-str json-form) }
                  ["event_id = ?" 1])))

(defn load-form []
  (let [event-db-entry
        (jdbc/query db-spec
                    ["select * from abhimata_event where event_id = 1"])]
    (-> event-db-entry
        first
        :signup_form
        json/read-str)))

;The PostgreSQL version we're using doesn't support JSON values, so
;the sign-up form needs to be turned into a string before it's
;stored into the database.

(defn stringify-signup-form [event-data]
  (let [stringified-form (json/write-str (:signup_form event-data))]
    (assoc event-data :signup_form stringified-form)))

(defn unstringify-signup-form [db-event-query]
  (let [unstringified-form (json/read-str (:signup_form db-event-query))]
    (assoc db-event-query :signup_form unstringified-form)))


(defn get-events-public []
  (map unstringify-signup-form (jdbc/query db-spec ["select * from abhimata_event"])))

(defn get-event [id]
  (let [result 
        (jdbc/query 
         db-spec ["select * from abhimata_event where event_id = ?" 
                  (Integer. id)])]
    (if (empty? result)
      {:status 404, 
       :body (str "Event " id " does not exist.")}
      {:status 200, :body (unstringify-signup-form (first result))})))


(defn save-event [event-data params]
  (do
    (let [keywordized-data (walk/keywordize-keys event-data)]
    (jdbc/update! db-spec :abhimata_event
                  (stringify-signup-form keywordized-data)
                  ["event_id = ?" (:event_id keywordized-data)]))))

(defn make-event []
  (jdbc/insert! db-spec :abhimata_event 
                {:title "New event", 
                 :signup_form "[]"} ))

(defn fetch-admin-credentials [username]
  "Fetches admin credentials in the form expected by friend's
   bcrypt-credential-fn"
  (let [query-results (jdbc/query db-spec 
                       ["select * from abhimata_admin where username = ?" 
                        username])]
    (if (empty? query-results) 
      nil
      (assoc (into {} query-results) :roles #{:admin}))))
  

