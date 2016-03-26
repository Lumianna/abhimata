(ns abhimata_backend.core
  (:gen-class)
  (:require 
   [abhimata_backend.events :as events]
   [abhimata_backend.email :as email]
   [abhimata_backend.macros :as macros]
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

(defn make-event-id-role [event_id]
  (keyword (str event_id)))

(defn get-event-auth-roles [event_id]
  (let [owner (:owner (jdbc/query (config/get-db-spec)
                ["select owner from abhimata_event where event_id = ?" (Integer. event_id)]
                :result-set-fn first))
        event-id-role (make-event-id-role event_id)]
    #{(keyword owner) event-id-role}))

(defn get-root-roles []
  "The root user gets admin access to every event"
  (let [username-roles (map (comp keyword :username)
                    (jdbc/query (config/get-db-spec)
                      ["select username from abhimata_admin"]))]

    (into #{:root :admin} username-roles)))


(defn fetch-admin-credentials [username]
  "Tries to retrieve admin credentials (an admin has write access to all events
  that they own.)"
  (let [creds (jdbc/query (config/get-db-spec)
                ["select username, password from abhimata_admin where username = ?"
                 username]
                :result-set-fn first)
        owned-event-ids (map :event_id (jdbc/query (config/get-db-spec)
                          ["select event_id from abhimata_event where owner = ?"
                           username]))]
    (if-not creds
      nil
      (if (= username "root")
        (assoc creds :roles (get-root-roles))
        (assoc creds :roles (into #{:admin (keyword username)}
                              (map make-event-id-role owned-event-ids)))))))

(defn fetch-guest-credentials [username]
  "Tries to retrieve guest credentials (a guest has read access to a single event)"
  (if-let [guest (jdbc/query (config/get-db-spec)
                ["select event_id, guest_password from abhimata_event where guest_user = ?"
                 username]
                :result-set-fn first)]
    {:username username
     :password (:guest_password guest)
     :roles #{ :guest (make-event-id-role (:event_id guest)) }
     }
    nil))

(defn fetch-credentials [username]
  "Fetches credentials in the form expected by friend's
   bcrypt-credential-fn"
  (or (fetch-admin-credentials username)
    (fetch-guest-credentials username)))

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
                       (dissoc keywordized-data :event_id :registrations :guest_user :guest_password))]
    (if (sc/check schemas/Event db-ready-data)
      {:status 403
       :body "Invalid event data; this is probably a bug in Abhimata."}
      (do
        (jdbc/update! (config/get-db-spec) :abhimata_event db-ready-data
                      ["event_id = ?" event_id])
        (macros/try-times
         3
         (jdbc/with-db-transaction [tr-con (config/get-db-spec) :isolation :serializable]
           (registration/fill-empty-slots-from-waiting-list! event_id :connection tr-con)))
        (resp/response "event saved")))))

(defn event-id-routes [event_id]
  (routes
    (GET "/" [] (events/get-full-event-data event_id) )
    (DELETE "/" [] (friend/authorize #{:root} (events/delete-event event_id)))
    (POST "/" {event-data :json-params}
      (friend/authorize #{:admin} (save-event event_id event-data)))
    (POST "/guest-password" {params :json-params}
      (friend/authorize #{:admin} (events/set-guest-password event_id (params "password"))))
    (POST "/clear-guest-password" []
      (friend/authorize #{:admin} (events/clear-guest-password event_id)))
    (GET "/participants" [] (events/get-participants event_id))
    (POST "/participants/:registration_id"
      {{registration_id :registration_id} :params
       status-update :json-params}
      (friend/authorize #{:admin}
        (registration/update-participant-status event_id registration_id status-update)))
    (GET "/participants.pdf" {selected-questions :query-params}
      (events/get-participants-pdf event_id selected-questions))
    (GET "/participants.csv" {selected-questions :query-params}
      (events/get-participants-csv event_id selected-questions))))

(defroutes app-routes
  (GET "/logout" [] (friend/logout* (resp/response "logout ok")))
  (GET "/query-test" {params :query-params} (do (prn params) (resp/response params)))
  (POST "/login" [] (resp/response "login ok"))
  (GET "/secret" req
       (friend/authorize #{:admin :guest} (resp/response "auth ok")))
  (GET "/registration-status/:uuid" [uuid] (registration/verify-email-and-get-registration-info! uuid))
  (GET "/request-cancellation-email/:uuid" [uuid] (registration/request-cancellation-email! uuid))
  (GET "/cancel/:uuid" [uuid] (registration/get-registration-info-by-cancel-uuid uuid))
  (POST "/cancel/:uuid" [uuid] (registration/cancel-registration! uuid))
  (context "/events-public" []
    (GET "/" [] (events/get-public-event-list))
    (GET "/:id" [id] (events/get-event-public id))
    (POST "/" {submission-data :json-params} (registration/register-for-event! submission-data)))
  (context "/events-private" []
    (GET "/" req (events/get-events-private (friend/current-authentication req)))
    (POST "/" req (friend/authorize #{:admin}
                    (events/make-event (friend/current-authentication req))))
    (context "/:id" [id]
      (friend/wrap-authorize (event-id-routes id)
        (get-event-auth-roles id) )))
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
                       fetch-credentials %)
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
