(ns abhimata_backend.registration
  (:gen-class)
  (:require [abhimata_backend.schemas :as schemas]
            [abhimata_backend.events :as events]
            [abhimata_backend.config :as config]
            [abhimata_backend.email :as email]
            [abhimata_backend.macros :as macros]
            [clojure.java.jdbc :as jdbc]
            [clojure.data.json :as json]
            [schema.core :as sc]
            [ring.util.response :as resp]
            [ring.util.io :as ring-io]
            [clojure.walk :as walk])
  (:import java.sql.SQLException))

(def max-transaction-attempts 5)

(defn get-registration-form [event-id]
  (json/read-str
   (:registration_form 
    (jdbc/query
     (config/get-db-spec) 
     ["select registration_form from abhimata_event 
        where event_id = ?" event-id]
     :result-set-fn first))))

(defn random-uuid []
  (str (java.util.UUID/randomUUID)))

(defn make-email-verification-url [uuid]
  (str (:url (config/get-config)) "/verify-email/" uuid))

(defn make-cancellation-url [uuid]
  (str (:url (config/get-config)) "/cancel/" uuid))

(defn send-cancellation-email! [user-email event_id uuid]
  (let [event (events/get-event-by-id event_id)]
    (email/send-email! 
     {:to user-email,
      :event_id event_id,
      :subject "If you need to cancel your registration"
      :body (str "Thank you for registering for the event \""
                 (:title event) "\". If you later find that you "
                 "need to cancel your "
                 "registration, you can use this link: "
                 (make-cancellation-url uuid) " . Do not share this link "
                 "with anyone else.")})))

(defn send-verification-email! [user-email event_id email-uuid]
  (email/send-email! 
   {:to user-email,
    :event_id event_id,
    :subject "Please verify your email address"
    :body (str "Please click on the following link to verify your email address: " (make-email-verification-url email-uuid) )}))

(defn insert-registration! [event_id registration]
  "If the event has open slots or room on the waiting list, inserts registration
   with the appropriate waiting list status. Uses a serializable transaction to
   make sure that the event can't be overbooked. The transaction is
   automatically retried a few times if it fails. If the insertion succeeds, 
   returns the data inserted (augmented with primary key and waiting list
   status); otherwise returns nil."

  (macros/try-times
   max-transaction-attempts
   (jdbc/with-db-transaction [tr-con (config/get-db-spec) :isolation :serializable]
     (let [event (events/get-event-by-id event_id :connection tr-con)
           participants (:body (events/get-participants event_id :connection tr-con))
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

(defn register-for-event! [submission-data]
  (try
    (let [{submitted-form "submitted_form"
           event_id "event_id"} submission-data
           registration-form (get-registration-form event_id)
           _ (sc/validate (schemas/make-submitted-application-schema
                           registration-form)
                          submission-data)
           user-email (submitted-form (str schemas/email-key))
           user-name  (submitted-form (str schemas/name-key))
           email-uuid (random-uuid)
           cancellation-code (random-uuid)
           insert-cols {:event_id event_id
                        :submitted_form (json/write-str submitted-form)
                        :email user-email
                        :name user-name
                        :email_verification_code email-uuid
                        :cancellation_code cancellation-code}
           insert-result (insert-registration! event_id insert-cols)]
      (if (not insert-result)
        {:status 403
         :body "The event you tried to sign up for is either fully booked or not accepting registrations."}
        (do 
          (send-verification-email! user-email event_id email-uuid)
          (send-cancellation-email! user-email event_id cancellation-code)
          (email/flush-emails!)
          (resp/response "Your application has been submitted, but you will still need to verify your email address by clicking on the link that we just emailed you."))))
    (catch SQLException e (throw e))
    (catch Exception e
      (.printStackTrace e)
      {:status 403
       :body "Invalid registration form (this is probably a bug in Abhimata)."})))

(defn get-registration-info [uuid]
  "Takes a cancellation code and returns some information about the registration
corresponding to that code (or a 404 if no such registration is found)."
  (if-let [registration
           (jdbc/query
            (config/get-db-spec)
            ["select * from abhimata_registration where cancellation_code = ?"
             uuid]
            :result-set-fn first)]
    (let [event-title
          (:title
           (jdbc/query
            (config/get-db-spec)
            ["select title from abhimata_event where event_id = ?"
             (:event_id registration)]
            :result-set-fn first))]
      (resp/response
       {:eventTitle event-title
        :alreadyCancelled (:cancelled registration)
        :onWaitingList false}))
    {:status 404
     :body "No registration matching that cancellation uuid."}))

(defn send-waiting-list-promotion-email!
  [{:keys [event_id email cancellation_code] :as registration} conn]
  (let [event (events/get-event-by-id event_id :connection conn)]
    (email/send-email! 
     {:to email,
      :event_id event_id,
      :subject
      (str "A place in the event \"" (:title event) "\" is now available")
      :body (str "You signed up for the waiting list of the event \""
                 (:title event) "\". Due to a cancellation, a place in the "
                 "event is now available and reserved for you. If you do not "
                 "wish to participate, please cancel your registration using "
                 "this link so that we can offer your place to someone else: "
                 (make-cancellation-url cancellation_code))})))

(defn promote-first-on-waiting-list! [event_id tr-con]
  "Takes the first person on the waiting list, sets their waiting list 
status to false, and sends them an email informing them about this. If the
event has no waiting list, or the waiting list is empty, the method does
nothing. The db connection parameter tr-con is not optional because this method
is only called from cancel-registration!."
  (if-let [first-on-waitlist
           (jdbc/query
            tr-con
            [(str "select * from abhimata_registration"
                  " where on_waiting_list = true"
                  " order by submission_date, registration_id")]
            :result-set-fn first)]
    (do
      (jdbc/update!
       tr-con
       :abhimata_registration
       {:on_waiting_list false}
       ["registration_id = ?" (:registration_id first-on-waitlist)])
      (send-waiting-list-promotion-email! first-on-waitlist tr-con)
      (email/flush-emails!))
    nil))


(defn cancel-registration! [uuid]
  "Cancels the registration and offers the first person on the waiting list
a place in the event (if the event has a waiting list and there is someone
on it). Everything takes place in a serializable transaction that is retried 
a few times."
  (macros/try-times
   max-transaction-attempts
   (jdbc/with-db-transaction [tr-con (config/get-db-spec) :isolation :serializable]
     (if-let [{:keys [event_id on_waiting_list] :as registration}
              (jdbc/query
               (config/get-db-spec)
               [(str "select * from abhimata_registration"
                     " where cancellation_code = ?"
                     " and cancelled = false")
                uuid]
               :result-set-fn first)]
       (let [changed-entries
             (jdbc/update!
              tr-con
              :abhimata_registration
              {:cancelled true}
              ["cancellation_code = ?" uuid])]
         (if (> (first changed-entries) 0)
           (do
             (when-not on_waiting_list
               (promote-first-on-waiting-list! event_id tr-con))
             (resp/response "cancellation successful"))
           {:status 500
            :body "Cancellation failed (this shouldn't happen)"}))
       {:status 404
        :body "No registration matching that cancellation uuid."}))))


(defn verify-email! [uuid]
  (let [update-res 
        (jdbc/update! (config/get-db-spec) :abhimata_registration
                      {:email_verified true}
                      ["email_verification_code = ? and email_verified = false" uuid])]
    (if (> (first update-res) 0)
      (resp/response
       "Email successfully verified.")
      {:status 404
       :body "No registration corresponding to that verification code."})))

(sc/defschema ParticipantStatus
  "A valid participant status"
  (sc/pred #{"application_screened"
             "registration_fee_paid"
             "full_fee_paid"}))

(sc/defschema ParticipantStatusUpdate
  "A status update should update a single field and set it to true or false"
  { ParticipantStatus sc/Bool })

(defn update-participant-status [id_str status-update]
  (let [_ (sc/validate ParticipantStatusUpdate status-update)
        registration_id (Integer. id_str)
        update-res (jdbc/update!
                    (config/get-db-spec) :abhimata_registration
                    status-update
                    ["registration_id = ?" registration_id])]
    (if (> (first update-res) 0)
      {:status 200}
      {:status 500})))
