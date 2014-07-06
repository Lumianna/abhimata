(ns abhimata_backend.core
  (:require [cemerick.friend :as friend :as friend]
            (cemerick.friend [workflows :as workflows]
                             [credentials :as creds])
            [compojure.core :as compojure :refer (GET POST ANY defroutes)]
            [ring.adapter.jetty :as jetty]
            (compojure [handler :as handler]
                       [route :as route])))

(def users (atom {"admin" { :username "admin"
                           :password (creds/hash-bcrypt "clojure")
                           :roles #{::user}}}))

(defn handler [request]
  {:status 200
   :header {"Content-Type" "text/html"}
   :body "Hello, World!" })

(defroutes app-routes
  (GET "/" [] "Hello, world!")
  (route/resources "/")
  (route/not-found "Not Found"))

(def app
  (handler/site app-routes))

(defn start []
  (jetty/run-jetty (var app) {:port 3000 :join? false}))
