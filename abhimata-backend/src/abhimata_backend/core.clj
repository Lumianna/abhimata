(ns abhimata_backend.core
  (:gen-class)
  (:require 
   [abhimata_backend.db :as db]
   [cemerick.friend :as friend :as friend]
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
  (GET "/" [] (db/get-events-private))
  (POST "/" [] (db/make-event))
  (context "/:id" [id] 
    (GET "/" [] (db/get-event id) )
    (DELETE "/" [] (db/delete-event id) )
    (POST "/" {event-data :json-params} (db/save-event event-data))
    (GET "/participants" [] (db/get-participants id))
    ))

(defroutes app-routes
  (GET "/welcome" [] "Hi there")
  (GET "/logout" [] (friend/logout* (resp/response "logout ok")))
  (GET "/secret" req
       (friend/authorize #{:admin} (resp/response "auth ok")))
  (GET "/events-public" [] (db/get-events-public))
  (POST "/events-public" {submission-data :json-params} (db/register-for-event submission-data))
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
      :default-landing-uri "/welcome"
      :login-failure-handler failed-login-handler
      :unauthenticated-handler (fn [& args] {:status 401, :body "Login required"})
      :credential-fn #(creds/bcrypt-credential-fn 
                       db/fetch-admin-credentials %)
      :workflows [(workflows/interactive-form)]})
    (handler/site)
    (wrap-db-error)
    (ringjson/wrap-json-params)
    (ringjson/wrap-json-response {:pretty true})))


#_(defonce server
 (do
 (jetty/run-jetty #'app {:port 3000 :join? false})))

(defn -main [port]
  (do
    (jetty/run-jetty #'app {:port (Integer. port) :join? false})))
