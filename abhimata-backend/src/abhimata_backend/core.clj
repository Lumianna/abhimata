(ns abhimata_backend.core
  (:gen-class)
  (:require 
   [abhimata_backend.events :as events]
   [abhimata_backend.email :as email]
   [abhimata_backend.registration :as registration]
   [abhimata_backend.config :as config]
   [clojure.tools.logging :as log]
   [cemerick.friend :as friend]
   (cemerick.friend [workflows :as workflows]
                    [credentials :as creds])
   [compojure.core :as compojure
    :refer (GET POST DELETE ANY routes defroutes context)]
   [clojure.java.jdbc :as jdbc]
   [clojure.string :as string]
   [ring.adapter.jetty :as jetty]
   [ring.middleware.json :as ringjson]
   [ring.middleware.keyword-params :as keyword-params]
   [clojure.data.json :as json]
   [ring.util.response :as resp]
   [clojure.walk :as walk]
   [schema.core :as sc]
   [abhimata_backend.schemas :as schemas]
   (compojure [handler :as handler]
              [route :as route]))
  (:import java.sql.SQLException))

(defn get-root-roles []
  "The root user gets the roles of every user"
  (let [usernames (jdbc/query (config/get-db-spec)
                              ["select username from abhimata_admin"])
        get-role (fn [x] (keyword (:username x)))]

    (into #{:root :admin} (map get-role usernames))))

(defn fetch-admin-credentials [username]
  "Fetches admin credentials in the form expected by friend's
   bcrypt-credential-fn"
  (let [user (jdbc/query (config/get-db-spec) 
                       ["select * from abhimata_admin where username = ?" 
                        username]
                       :result-set-fn first)]
    (if-not user
      nil
      (if (= username "root")
        (assoc user :roles (get-root-roles))
        (assoc user :roles #{:admin (keyword username)})))))

(defn add-user [username password]
  "Adds user to abhimata_admin"
  (jdbc/insert! (config/get-db-spec) :abhimata_admin
                {:username username
                 :password (creds/hash-bcrypt password)}))

;; TODO: save-event is here to avoid circular module dependencies (calls stuff from
;; events and registration), but that's a bit of a hack
(defn save-event [event_id event-data]
  "Update an event in the database."
  (let [event_id (Integer. event_id)
        current-data (events/get-event-by-id event_id)
        keywordized-data (walk/keywordize-keys event-data)
        db-ready-data (events/stringify-json-field
                       :registration_form
                       (dissoc keywordized-data :event_id :registrations))]
       (if (sc/check schemas/Event db-ready-data)
         {:status 403
          :body "Invalid event data; this is probably a bug in Abhimata."}
         (do
          (jdbc/update! (config/get-db-spec) :abhimata_event db-ready-data
                        ["event_id = ?" event_id])
          ;; If the number of participants was increased, we should notify people
          ;; who just got promoted from the waiting list
          (when (> (:max_participants db-ready-data) (:max_participants current-data))
            (registration/fill-empty-slots-from-waiting-list! event_id))
          (resp/response "event saved")))))

(defn event-id-routes [id]
  (routes
   (GET "/" [] (events/get-full-event-data id) )
   (DELETE "/" [] (friend/authorize #{:root} (events/delete-event id)))
   (POST "/" {event-data :json-params} (save-event id event-data))
   (GET "/participants" [] (events/get-participants id))
   (POST "/participants/:registration_id"
       {{registration_id :registration_id} :params
        status-update :json-params}
     (registration/update-participant-status registration_id status-update))
   (GET "/participants.pdf" [] (events/get-participants-pdf id))))

(defroutes admin-routes
  (GET "/" req (events/get-events-private (friend/current-authentication req)))
  (POST "/" req (events/make-event (friend/current-authentication req)))
  (context "/:id" [id] 
    (friend/wrap-authorize (event-id-routes id)
                           #{ (events/get-event-owner-role id) })))

(defroutes app-routes
  (GET "/logout" [] (friend/logout* (resp/response "logout ok")))
  (POST "/login" [] (resp/response "login ok"))
  (GET "/secret" req
       (friend/authorize #{:admin} (resp/response "auth ok")))
  (GET "/registration-status/:uuid" [uuid] (registration/verify-email-and-get-registration-info! uuid))
  (GET "/request-cancellation-email/:uuid" [uuid] (registration/request-cancellation-email! uuid))
  (GET "/cancel/:uuid" [uuid] (registration/get-registration-info-by-cancel-uuid uuid))
  (POST "/cancel/:uuid" [uuid] (registration/cancel-registration! uuid))
  (context "/events-public" []
    (GET "/" [] (events/get-public-event-list))
    (GET "/:id" [id] (events/get-event-public id))
    (POST "/" {submission-data :json-params} (registration/register-for-event! submission-data)))
  (context "/events-private" []
    (friend/wrap-authorize admin-routes #{:admin}))
  (route/files "/" 
               {:root (str (System/getProperty "user.dir") "/static/public")} )
  (route/not-found "Not Found"))

(defn failed-login-handler [ & _]
  (resp/status (resp/response "") 401))

;Insert in middleware stack for debugging
(def prn-middleware (fn [handler] (fn [req] (prn req) (handler req))))

;Return HTTP status 500 whenever a DB error occurs.
(defn wrap-db-error [handler]
  (fn [request]
    (try (handler request)
         (catch SQLException e
           { :status 500
            :body (str "Database error\n"
                        (.getMessage e)
                        (string/join "\n" (.getStackTrace e))) 
            } ))))




(def app
  (->
    (friend/authenticate 
     app-routes
     {:allow-anon? true
      :redirect-on-auth? false
      :login-uri "/login"
      :login-failure-handler failed-login-handler
      :unauthenticated-handler (fn [& args] {:status 401, :body "Login required"})
      :credential-fn #(creds/bcrypt-credential-fn 
                       fetch-admin-credentials %)
      :workflows [(workflows/interactive-form :redirect-on-auth? false)]})
    (handler/site)
    (wrap-db-error)
    (ringjson/wrap-json-params)
    (ringjson/wrap-json-response {:pretty true})))

(defn -main [cfgfile]
  (do
    (log/info "Starting server")
    (config/update-config-from-file! cfgfile)
    (email/start-processing-email-action-queue!)
    (email/flush-emails!)
    (jetty/run-jetty #'app {:port (:port (config/get-config)) :join? false})))
