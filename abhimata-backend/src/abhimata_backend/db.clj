(ns abhimata_backend.db
  (:gen-class)
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.data.json :as json]))

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

(defn get-events-public []
  (jdbc/query db-spec ["select * from abhimata_event"]))

(defn get-event [id]
  (let [result 
        (jdbc/query 
         db-spec ["select * from abhimata_event where event_id = ?" 
                  (Integer. id)])]
    (if (empty? result)
      {:status 404, 
       :body (str "Event " id " does not exist.")}
      {:status 200, :body (first result)})))

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
  

