(ns abhimata_backend.core
  (:gen-class)
  (:require 
   [abhimata_backend.db :as db]
   [cemerick.friend :as friend :as friend]
   (cemerick.friend [workflows :as workflows]
                    [credentials :as creds])
   [compojure.core :as compojure
    :refer (GET POST ANY defroutes context)]
   [clojure.java.jdbc :as jdbc]
   [ring.adapter.jetty :as jetty]
   [ring.middleware.json :as ringjson]
   [clojure.data.json :as json]
   [ring.util.response :as resp]
   (compojure [handler :as handler]
              [route :as route])))

(defroutes admin-routes
  (POST "/" [] (resp/response (db/make-event)))
  (context "/:id" [id] 
    (GET "/" [] (db/get-event id) )
    ;;(GET "/registrants")
    ))

(defroutes app-routes
  (GET "/welcome" [] "Hi there")
  (GET "/logout" [] (friend/logout* (resp/response "logout ok")))
  (GET "/secret" req
       (friend/authorize #{:admin} (resp/response "auth ok"))
  (POST "/form" {json-form :json-params} (db/save-form json-form) )
  (GET "/form" [] (resp/response (db/load-form)))
  (context "/events" []
    (GET "/" [] (resp/response (db/get-events-public)))
    (friend/wrap-authorize admin-routes #{:admin}))
  (route/files "/" 
               {:root (str (System/getProperty "user.dir") "/static/public")} )
  (route/not-found "Not Found")))

(defn failed-login-handler [ & _]
  (resp/status (resp/response "") 401))

(def app
  (->
    (friend/authenticate app-routes
                         {:allow-anon? true
                          :redirect-on-auth? false
                          :login-uri "/login"
                          :default-landing-uri "/welcome"
                          :login-failure-handler failed-login-handler
                          ;:unauthorized-handler #(-> (h/html5 [:h2 "You do not have sufficient privileges to access " (:uri %)]) resp/response (resp/status 401))
                          :credential-fn #(creds/bcrypt-credential-fn 
                                           db/fetch-admin-credentials %)
                          :workflows [(workflows/interactive-form)]})
    (handler/site)
    (ringjson/wrap-json-params)
    (ringjson/wrap-json-response {:pretty true})))

#_(defonce server
 (do
 (jetty/run-jetty #'app {:port 3000 :join? false})))

(defn -main [port]
  (do
    (jetty/run-jetty #'app {:port (Integer. port) :join? false})))
