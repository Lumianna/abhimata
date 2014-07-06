(ns abhimata-backend.core
  (:require [cemerick.friend :as friend :as friend]
            (cemerick.friend [workflows :as workflows]
                             [credentials :as creds])
            [compojure.core :as compojure :refer (GET POST ANY defroutes)]
            (compojure [handler :as handler]
                       [route :as route])))

(def users (atom {"admin" { :username "admin"
                           :password (creds/hash-bcrypt "clojure")
                           :roles #{::user}}}))

(defn handler [request]
  {:status 200
   :header {"Content-Type" "text/html"}
   :body "Hello, World!" })
