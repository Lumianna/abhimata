(ns abhimata_backend.events
  (:gen-class)
  (:require [abhimata_backend.schemas :as schemas]
            [abhimata_backend.config :as config]
            [abhimata_backend.macros :as macros]
            [abhimata_backend.pdfexport :as export]
            [clojure.stacktrace]
            [clojure.java.jdbc :as jdbc]
            [clojure.data.json :as json]
            [clj-pdf.core :as pdf]
            [schema.core :as sc]
            [ring.util.response :as resp]
            [ring.util.io :as ring-io]))

(def max-transaction-attempts 5)

;The PostgreSQL version we're using doesn't support JSON values, so
;the registration form needs to be turned into a string before it's
;stored into the database.

(defn stringify-json-field [field-key event-data]
  (let [stringified-form (json/write-str (field-key event-data))]
    (assoc event-data field-key stringified-form)))

(defn unstringify-json-field [field-key db-event-query]
  (let [unstringified-form (json/read-str (field-key db-event-query))]
    (assoc db-event-query field-key unstringified-form)))

(defn get-event-by-id [id & {:keys [connection]
                              :or {connection (config/get-db-spec)}}]
  (jdbc/query 
   connection
   ["select * from abhimata_event where event_id = ?" id]
   :result-set-fn first))

(defn get-event-owner [event-id]
  (:owner (get-event-by-id (Integer. event-id))))

(defn get-event-owner-role [event-id]
  (keyword (get-event-owner event-id)))


(defn get-public-event-list []
  (resp/response
   (map (partial unstringify-json-field :registration_form)
    (jdbc/query
     (config/get-db-spec)
     ["select * from abhimata_public_events"]))))

(defn get-event-public [id]
  (if-let
      [event
       (jdbc/query
        (config/get-db-spec)
        ["select * from abhimata_public_events where event_id = ?"
         (Integer. id)]
        :result-set-fn first)]
    (resp/response (unstringify-json-field :registration_form event))
    {:status 404
     :body "Event does not exist."}))


(defn get-events-private [current-auth]
  (let [owner (:username current-auth)
        query-str (if (= owner "root")
                    ["select * from abhimata_event"]
                    [(str "select * from abhimata_event "
                          "where owner = ?") owner])]
    (resp/response
     (map (partial unstringify-json-field :registration_form)
          (jdbc/query (config/get-db-spec)
                      query-str)))))

(defn get-participants [id & {:keys [connection]
                              :or {connection (config/get-db-spec)}}]
  (let [applications
        (map (partial unstringify-json-field :submitted_form)
             (jdbc/query
              connection 
              ["select * from abhimata_registration where event_id = ?" 
               (Integer. id)]))
        {not-cancelled false cancelled true}
        (group-by :cancelled applications)
        {participants false waiting-list true}
        (group-by :on_waiting_list not-cancelled)]
        
  (resp/response
   {:applications applications
    :participants (vec participants)
    :waitingList (vec waiting-list)
    :cancelled (vec cancelled)})))

(defn filter-answers [selected-questions submitted-form]
  (into {} (filter (fn [[key val]] (selected-questions key)) submitted-form)))

(defn filter-registration-form [selected-questions form]
  (let [filtered-questions (into {}
                             (filter (fn [[key val]] (selected-questions key))
                               (form "questions")))
        filtered-order (filter (fn [key] (selected-questions (str key)))
                               (form "order"))]
    {"questions" filtered-questions
     "order"     filtered-order}))

(defn get-participants-pdf [id selected-questions]
  (let [participants (:participants (:body (get-participants id)))
        ;; An empty selected-questions is equivalent to selecting all questions
        answer-map-fn (if (empty? selected-questions)
                        :submitted_form
                        (comp (partial filter-answers selected-questions)
                          :submitted_form))
        submitted-forms (map answer-map-fn participants)
        event (unstringify-json-field :registration_form
                                      (get-event-by-id (Integer. id)))
        registration-form (:registration_form event)
        registration-form (if (empty? selected-questions)
                            registration-form
                            (filter-registration-form selected-questions registration-form))
        pdf-doc (export/make-participant-pdf registration-form submitted-forms)]
    {:headers {"Content-Type" "application/pdf",
               "Content-Disposition" "attachment"}
     :body
     (ring-io/piped-input-stream
      (fn [out-stream]
        (pdf/pdf (vec (concat [{}] pdf-doc))
                 out-stream)))})) 

(defn get-full-event-data [id]
  (let [event_id (Integer. id)
        event (get-event-by-id event_id)
        {registrations :body} (get-participants event_id)]
    (if event
      (resp/response
       (assoc (unstringify-json-field :registration_form event)
              :registrations (:applications registrations)))
      {:status 404, 
       :body (str "Event " id " does not exist.")})))

(defn delete-event [event-id]
  (macros/try-times
   max-transaction-attempts
   (jdbc/with-db-transaction [tr-con (config/get-db-spec) :isolation :serializable]
     (let [event_id (Integer. event-id)]
       (jdbc/delete! tr-con :abhimata_email ["event_id = ?" event_id])
       (jdbc/delete! tr-con :abhimata_registration ["event_id = ?" event_id])
       (resp/response
        (jdbc/delete! tr-con :abhimata_event ["event_id = ?" event_id]))))))

(defn make-event [current-auth]
  (let [owner (:username current-auth)
        event (assoc schemas/default-event :owner owner)]
  (resp/response (jdbc/insert! (config/get-db-spec) :abhimata_event event))))
