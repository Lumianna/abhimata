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

(def form (atom "initialform"))

(defroutes app-routes
  (GET "/" [] "Hello, world!")
  (GET "/logout" [] (friend/logout* (resp/response "logout ok")))
  (GET "/secret" req
       (friend/authorize #{::admin} "Admin's eyes only!"))
  (POST "/form" {json :json-params} (swap! form (fn [_] json)))
  (GET "/form" [] (resp/response @form))
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

(defonce server (jetty/run-jetty #'app {:port 3000 :join? false}))
