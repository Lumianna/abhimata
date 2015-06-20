(ns abhimata_backend.config
  (:gen-class)
  (:require [clojure.edn :as edn]))

(def config (atom nil))

(defn get-config [] (deref config))

(defn get-db-spec []
  (:db-spec (get-config)))

(defn update-config-from-file! [filename] 
  (reset! config (edn/read-string (slurp filename))))
