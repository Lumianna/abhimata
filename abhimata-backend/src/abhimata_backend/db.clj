(ns abhimata_backend.db
  (:gen-class)
  (:require [clojure.java.jdbc :as jdbc]
            [clojure.data.json :as json]))

(def db-spec {:subprotocol "postgresql",
              :subname "//localhost:5432/knyb",
              :user "knyb"})

(def form (atom "initialform"))

(defn save-form [json-form]
  (do
    (swap! form (fn [_] json-form))
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
