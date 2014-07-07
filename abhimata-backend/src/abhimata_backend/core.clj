(ns abhimata_backend.core
  (:require [cemerick.friend :as friend :as friend]
            (cemerick.friend [workflows :as workflows]
                             [credentials :as creds])
            [compojure.core :as compojure :refer (GET POST ANY defroutes)]
            [ring.adapter.jetty :as jetty]
            [ring.middleware.json :as json]
            [ring.util.response :as resp]
            (compojure [handler :as handler]
                       [route :as route])))

(def users (atom {"admin" { :username "admin"
                           :password (creds/hash-bcrypt "clojure")
                           :roles #{::admin}}}))

(defroutes app-routes
  (GET "/" [] "Hello, world!")
  (GET "/secret" req
       (friend/authorize #{::admin} "Admin's eyes only!"))
  (route/resources "/")
  (route/not-found "Not Found"))

(def app
  (-> 
   (friend/authenticate app-routes
    {:allow-anon? true
     :redirect-on-auth? false
     :login-uri "/login"
     :default-landing-uri "/"
;     :unauthorized-handler #(-> (h/html5 [:h2 "You do not have sufficient privileges to access " (:uri %)]) resp/response (resp/status 401))
     :credential-fn #(creds/bcrypt-credential-fn @users %)
     :workflows [(workflows/interactive-form)]})
   (handler/site)
   (json/wrap-json-params)
   (json/wrap-json-response {:pretty true})))

(defn start []
  (jetty/run-jetty (var app) {:port 3000 :join? false}))
