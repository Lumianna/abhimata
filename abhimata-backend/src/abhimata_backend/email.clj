(ns abhimata_backend.email
  (:gen-class)
  (:require [abhimata_backend.config :as config]
            [abhimata_backend.macros :as macros]
            [clojure.stacktrace]
            [clojure.java.jdbc :as jdbc]
            [clojure.data.json :as json]
            [clj-pdf.core :as pdf]
            [clj-time.core :as time]
            [clj-time.coerce :as coercetime]
            [postal.core :as postal])
  (:import java.util.concurrent.LinkedBlockingQueue))

(defn- send-email-now! [{:keys [email body subject email_id]}]
  (try
    (let [send-result 
          (postal/send-message 
            (:smtp-conf (config/get-config))
            {:from (:email-from (config/get-config))
             :to email
             :body body
             :subject subject})]
      (if (= (:error send-result) :SUCCESS)
        (jdbc/update! (config/get-db-spec) :abhimata_email
          {:sent true}
          ["email_id = ?" email_id])
        send-result))
    ;This should only fail if the SMTP server is down or something like that.
    ;In that case sending the message will just be retried later.
    (catch Exception e (clojure.stacktrace/print-stack-trace e))))


;; To make sure that no email gets sent twice, emails are sent by a dedicated
;; thread (see start-processing-email-queue! below). Other threads can request
;; unsent emails to be sent now by calling flush-emails!.
(def ^:private email-action-queue (LinkedBlockingQueue.))

(defn send-email! [{:keys [to body subject event_id]}]
  (let [{:keys [registration_id email]} 
        (first 
          (jdbc/query (config/get-db-spec) 
            ["select * from abhimata_registration where 
                    event_id = ? and email = ?" event_id to]))]
    (jdbc/insert! (config/get-db-spec) :abhimata_email 
      {:registration_id registration_id,
       :event_id event_id
       :send_time (coercetime/to-timestamp (time/now))
       :body body
       :subject subject
       :sent false})))

(defn flush-emails! []
  (do
    (.put email-action-queue :plz-send)))

(defn- send-unsent-emails! []
  (let [emails (jdbc/query (config/get-db-spec) 
                [(str "select e.*, r.email"
                   " from abhimata_email e, abhimata_registration r"
                   " where e.sent = false"
                   " and e.send_time < current_timestamp"
                   " and e.registration_id = r.registration_id")])]
    (doall (map send-email-now! emails))))

;; LinkedBlockingQueue.take waits until an item is available in the queue,
;; so this function will basically call send-unsent-emails! as soon as
;; someone calls flush-emails!.
(defn start-processing-email-action-queue! []
  (future
    (doseq [_ (repeatedly #(.take email-action-queue))]
      (send-unsent-emails!))))
