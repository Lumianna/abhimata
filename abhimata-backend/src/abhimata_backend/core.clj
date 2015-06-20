(ns abhimata_backend.core
  (:gen-class)
  (:require 
   [abhimata_backend.events :as events]
   [abhimata_backend.email :as email]
   [abhimata_backend.registration :as registration]
   [abhimata_backend.config :as config]
   [cemerick.friend :as friend]
   (cemerick.friend [workflows :as workflows]
                    [credentials :as creds])
   [compojure.core :as compojure
    :refer (GET POST DELETE ANY defroutes context)]
   [clojure.java.jdbc :as jdbc]
   [clojure.string :as string]
   [ring.adapter.jetty :as jetty]
   [ring.middleware.json :as ringjson]
   [ring.middleware.keyword-params :as keyword-params]
   [clojure.data.json :as json]
   [ring.util.response :as resp]
   (compojure [handler :as handler]
              [route :as route]))
  (:import java.sql.SQLException))

(defroutes admin-routes
  (GET "/" [] (events/get-events-private))
  (POST "/" [] (events/make-event))
  (context "/:id" [id] 
    (GET "/" [] (events/get-full-event-data id) )
    (DELETE "/" [] (events/delete-event id) )
    (POST "/" {event-data :json-params} (events/save-event id event-data))
    (GET "/participants" [] (events/get-participants id))
    (GET "/participants.pdf" [] (events/get-participants-pdf id))))

(defroutes app-routes
  (GET "/logout" [] (friend/logout* (resp/response "logout ok")))
  (POST "/login" [] (resp/response "login ok"))
  (GET "/secret" req
       (friend/authorize #{:admin} (resp/response "auth ok")))
  (GET "/verify-email/:uuid" [uuid] (registration/verify-email! uuid))
  (GET "/cancel/:uuid" [uuid] (registration/get-registration-info uuid))
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
                       events/fetch-admin-credentials %)
      :workflows [(workflows/interactive-form :redirect-on-auth? false)]})
    (handler/site)
    (wrap-db-error)
    (ringjson/wrap-json-params)
    (ringjson/wrap-json-response {:pretty true})))

(defn -main [cfgfile]
  (do
    (config/update-config-from-file! cfgfile)
    (email/start-processing-email-action-queue!)
    (email/flush-emails!)
    (jetty/run-jetty #'app {:port (:port (config/get-config)) :join? false})))
