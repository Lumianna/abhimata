(ns abhimata_backend.registration
  (:gen-class)
  (:require [abhimata_backend.schemas :as schemas]
            [abhimata_backend.events :as events]
            [abhimata_backend.config :as config]
            [abhimata_backend.email :as email]
            [abhimata_backend.macros :as macros]
            [clojure.java.jdbc :as jdbc]
            [clojure.data.json :as json]
            [clojure.tools.logging :as log]
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

(defn make-registration-status-url [uuid]
  (str (:url (config/get-config)) "/registration-status/" uuid))

(defn make-cancellation-url [uuid]
  (str (:url (config/get-config)) "/cancel/" uuid))

(defn request-cancellation-email! [verification-uuid]
  (let [registration (jdbc/query
                      (config/get-db-spec)
                      [(str "select * from abhimata_registration "
                            "where email_verification_code = ?")
                       verification-uuid]
                      :result-set-fn first)
        event (events/get-event-by-id (:event_id registration))]
    (email/send-email! 
     {:to (:email registration),
      :event_id (:event_id registration)
      :subject "Link for cancelling your registration"
      :body (str "If you wish to cancel your registration for the event \""
                 (:title event) "\", please use this link:"
                 (make-cancellation-url (:cancellation_code registration))
                 " . If you still want to participate, ignore this email. Do not"
                 " share this link with anyone else.")})
    (email/flush-emails!)
    (resp/response "OK")))

(defn send-verification-email! [user-email event_id email-uuid]
  (email/send-email! 
   {:to user-email,
    :event_id event_id,
    :subject "Please verify your email address"
    :body (str "Please click on the following link to verify your email address: " (make-registration-status-url email-uuid) )}))

(defn close-registration! [tr-con event_id]
  "Closes registration for the event"
  (do
    (log/info "Closing registration for event " event_id)
    (jdbc/update! tr-con :abhimata_event
                  {:registration_open false}
                  ["event_id = ?" event_id])))

(defn insert-registration! [event_id registration]
  "If the event has open slots or room on the waiting list, inserts registration.
   Uses a serializable transaction to make sure that the event can't be overbooked. 
   The transaction is automatically retried a few times if it fails. If the 
   insertion succeeds, returns the data inserted (augmented with primary key);
   otherwise returns nil."

  (macros/try-times
   max-transaction-attempts
   (jdbc/with-db-transaction [tr-con (config/get-db-spec) :isolation :serializable]
     (let [event (events/get-event-by-id event_id :connection tr-con)
           participants (:body (events/get-participants event_id :connection tr-con))
           event-places (- (:max_participants event)
                          (count (:participants participants)))
           event-is-full (<= event-places 0)
           waiting-list-places (- (:max_waiting_list_length event)
                                  (count (:waitingList participants)))
           waiting-list-is-full (<= waiting-list-places 0)
           exactly-one-place-left (or (and event-is-full (= waiting-list-places 1))
                                      (and (= event-places 1)
                                           waiting-list-is-full))
           registration (assoc registration :on_waiting_list event-is-full)]
       (if (or (not (:registration_open event))
               (and event-is-full waiting-list-is-full))
         nil
         (if-let [insert-result
                  (first
                   (jdbc/insert! tr-con :abhimata_registration registration))]
           (do
             (when exactly-one-place-left
               (close-registration! tr-con event_id))
             (assoc registration :registration_id insert-result))
           nil))))))

(defn register-for-event! [submission-data]
  (try
    (let [{submitted-form "submitted_form"
           event_id "event_id"} submission-data
           registration-form (get-registration-form event_id)
           ;; Validate the form before doing anything else; if this doesn't work,
           ;; it's probably a bug in Abhimata
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
          (log/info (str "User " user-email " registered for event " event_id))
          (send-verification-email! user-email event_id email-uuid)
          (email/flush-emails!)
          (resp/response "Your application has been successfully submitted, but you will still need to verify your email address by clicking on the link that we just emailed you."))))
    (catch SQLException e (throw e))
    (catch Exception e
      (log/error e (str "Exception while processing submission " submission-data))
      {:status 403
       :body "Invalid registration form (this is probably a bug in Abhimata)."})))

(defn get-registration-info [verification-uuid]
  "Takes an email verification UUID and returns some information about the registration
corresponding to that code (or a 404 if no such registration is found)."
  (if-let [registration
           (jdbc/query
            (config/get-db-spec)
            ["select * from abhimata_registration where email_verification_code = ?"
             verification-uuid]
            :result-set-fn first)]
    (let [event_id (:event_id registration)
          {waiting-list
           :waitingList} (:body (events/get-participants event_id))
          has-uuid (fn [reg] (= (:email_verification_code reg) verification-uuid))
          event (jdbc/query
                 (config/get-db-spec)
                 [(str "select title,"
                       " applications_need_screening,"
                       " has_registration_fee,"
                       " has_deposit "
                       "from abhimata_event where event_id = ?")
                  (:event_id registration)]
                 :result-set-fn first)]
      (resp/response
       {:event event
        :alreadyCancelled (:cancelled registration)
        :applicationScreened (:application_screened registration)
        :depositPaid (:deposit_paid registration)
        :registrationFeePaid (:registration_fee_paid registration)
        :onWaitingList (boolean (first (filter has-uuid waiting-list)))}))
    {:status 404
     :body "No registration matching that verification code was found."}))

(defn get-registration-info-by-cancel-uuid [cancellation-uuid]
(if-let [registration
           (jdbc/query
            (config/get-db-spec)
            ["select * from abhimata_registration where cancellation_code = ?"
             cancellation-uuid]
            :result-set-fn first)]
    (get-registration-info (:email_verification_code registration))
    {:status 404
     :body "No registration matching that cancellation code was found."}))

(defn send-waiting-list-promotion-email!
  [{:keys [event_id email email_verification_code] :as registration} conn]
  (let [event (events/get-event-by-id event_id :connection conn)]
    (email/send-email! 
     {:to email,
      :event_id event_id,
      :subject
      (str "A place in the event \"" (:title event) "\" is now available")
      :body (str "You signed up for the waiting list of the event \""
                 (:title event) "\". Due to a cancellation, a place in the "
                 "event is now available and reserved for you. To see the "
                 "status of your application, or to cancel your registration "
                 "if you are unable to participate, use this link: "
                 (make-registration-status-url email_verification_code))})))

(defn promote-person-on-waiting-list! [participant & {:keys [connection]
                                                :or {connection (config/get-db-spec)}}]
  (jdbc/update!
   connection
   :abhimata_registration
   {:on_waiting_list false}
   ["registration_id = ?" (:registration_id participant)])
  (send-waiting-list-promotion-email! participant connection)
  (email/flush-emails!))

(defn fill-empty-slots-from-waiting-list!
  [event_id & {:keys [connection]
               :or {connection (config/get-db-spec)}}]
  "Promotes people from the waiting list to fill vacant slots in the event and sends them an email to inform them about it. Does nothing if the event is already full."
  (let [sorted-waiting-list (jdbc/query
                             connection
                             [(str "select * from abhimata_registration"
                                   " where on_waiting_list = true"
                                   " order by submission_date, registration_id")])
        { :keys [max_participants automate_waiting_list] } (events/get-event-by-id
                                                            event_id :connection connection)
        participants (:body (events/get-participants event_id :connection connection))
        number-to-be-promoted (- max_participants (count (:participants participants)))]
    (when automate_waiting_list
      (doseq [participant (take number-to-be-promoted sorted-waiting-list)]
        (promote-person-on-waiting-list! participant :connection connection))
      (email/flush-emails!))))

(defn cancel-registration! [uuid]
  "Cancels the registration and fills the open slot from the waiting list (if
the event is configured for automatic waiting list handling)."
  (macros/try-times
   max-transaction-attempts
   (jdbc/with-db-transaction [tr-con (config/get-db-spec) :isolation :serializable]
     (if-let [{:keys [event_id] :as registration}
              (jdbc/query
               (config/get-db-spec)
               [(str "select * from abhimata_registration"
                     " where cancellation_code = ?"
                     " and cancelled = false")
                uuid]
               :result-set-fn first)]
       (let [_ (log/info (str "Cancelling registration with uuid " uuid))
             changed-entries
             (jdbc/update!
              tr-con
              :abhimata_registration
              {:cancelled true}
              ["cancellation_code = ?" uuid])]
         (if (> (first changed-entries) 0)
           (do
             (fill-empty-slots-from-waiting-list! event_id :connection tr-con)
             (resp/response "cancellation successful"))
           {:status 500
            :body "Cancellation failed (this shouldn't happen)"}))
       {:status 404
        :body "No registration matching that cancellation uuid."}))))


(defn verify-email-and-get-registration-info! [uuid]
  (let [update-res 
        (jdbc/update! (config/get-db-spec) :abhimata_registration
                      {:email_verified true}
                      ["email_verification_code = ?" uuid])]
    (if (> (first update-res) 0)
      (get-registration-info uuid)
      {:status 404
       :body "No registration corresponding to that verification code was found."})))

(sc/defschema ParticipantStatus
  "A valid participant status"
  (sc/pred #{"application_screened"
             "registration_fee_paid"
             "deposit_paid"}))

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
