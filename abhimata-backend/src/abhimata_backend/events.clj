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
            [ring.util.io :as ring-io]
            [clojure.walk :as walk]))

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


(defn get-events-private []
  (resp/response
   (map (partial unstringify-json-field :registration_form)
    (jdbc/query (config/get-db-spec) ["select * from abhimata_event"]))))

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
   {:participants (vec participants)
    :waitingList (vec waiting-list)
    :cancelled (vec cancelled)})))

(defn get-event-by-id [id & {:keys [connection]
                              :or {connection (config/get-db-spec)}}]
  (jdbc/query 
   connection
   ["select * from abhimata_event where event_id = ?" id]
   :result-set-fn first))


(defn get-participants-pdf [id]
  (let [participants (:participants (:body (get-participants id)))
        submitted-forms (map :submitted_form participants)
        event (unstringify-json-field :registration_form
                                      (get-event-by-id (Integer. id)))
        registration-form (:registration_form event)
        pdf-doc (export/make-participant-pdf registration-form submitted-forms)
        _ (prn pdf-doc)]
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
              :registrations registrations))
      {:status 404, 
       :body (str "Event " id " does not exist.")})))


(defn save-event [event-id event-data]
  "Update an event in the database."
  (let [keywordized-data (walk/keywordize-keys event-data)
        db-ready-data (stringify-json-field
                       :registration_form
                       (dissoc keywordized-data :event_id :registrations))]
       (if (sc/check schemas/Event db-ready-data)
         {:status 403
          :body "Invalid event data; this is probably a bug in Abhimata."}
         (resp/response
          (jdbc/update! (config/get-db-spec) :abhimata_event db-ready-data
                        ["event_id = ?" (Integer. event-id)])))))

(defn delete-event [event-id]
  (macros/try-times
   max-transaction-attempts
   (jdbc/with-db-transaction [tr-con (config/get-db-spec) :isolation :serializable]
     (let [event_id (Integer. event-id)]
       (jdbc/delete! tr-con :abhimata_email ["event_id = ?" event_id])
       (jdbc/delete! tr-con :abhimata_registration ["event_id = ?" event_id])
       (resp/response
        (jdbc/delete! tr-con :abhimata_event ["event_id = ?" event_id]))))))

(defn make-event []
  (resp/response (jdbc/insert! (config/get-db-spec) :abhimata_event schemas/default-event)))

(defn fetch-admin-credentials [username]
  "Fetches admin credentials in the form expected by friend's
   bcrypt-credential-fn"
  (let [query-results (jdbc/query (config/get-db-spec) 
                       ["select * from abhimata_admin where username = ?" 
                        username])]
    (if (empty? query-results) 
      nil
      (assoc (into {} query-results) :roles #{:admin}))))
