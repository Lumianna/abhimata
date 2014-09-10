(ns abhimata-backend.core
  (:gen-class)
  (:import org.postgresql.util.PGobject)
  (:require [cemerick.friend :as friend :as friend]
            (cemerick.friend [workflows :as workflows]
                             [credentials :as creds])
            [compojure.core :as compojure
             :refer (GET POST ANY defroutes)]
            [clojure.java.jdbc :as jdbc]
            [ring.adapter.jetty :as jetty]
            [ring.middleware.json :as ringjson]
            [clojure.data.json :as json]
            [ring.util.response :as resp]
            (compojure [handler :as handler]
                       [route :as route]))
  )

;Extend jdbc to support PostgreSQL's json data type, as per
;http://hiim.tv/clojure/2014/05/15/clojure-postgres-json/

(defn value-to-json-pgobject [value]
  (doto (PGobject.)
    (.setType "json")
    (.setValue (json/write-str value))))

(defn extend-jdbc-psql-protocols []
  (do
    (extend-protocol jdbc/ISQLValue
      clojure.lang.IPersistentMap
      (sql-value [value] (value-to-json-pgobject value))

      clojure.lang.IPersistentVector
      (sql-value [value] (value-to-json-pgobject value)))

    (extend-protocol jdbc/IResultSetReadColumn
      PGobject
      (result-set-read-column [pgobj metadata idx]
        (let [type (.getType pgobj)
              value (.getValue pgobj)]
          (case type
            "json" (json/read-str value :key-fn keyword)
            :else value))))))



(def users (atom {"admin" { :username "admin"
                           :password (creds/hash-bcrypt "clojure")
                           :roles #{::admin}}}))

(def db-spec {:subprotocol "postgresql",
              :subname "//localhost:5432/knyb",
              :user "knyb"})

(def form (atom "initialform"))

(defn save-form [json-form]
  (do
    (swap! form (fn [_] json-form))
    (jdbc/update! db-spec :abhimata_event
                  {:title "Test event",
                   :signup_form json-form }
                  ["event_id = ?" 1])))

(defn load-form []
  (let [event-db-entry
        (jdbc/query db-spec
                    ["select * from abhimata_event where event_id = 1"])]
    (-> event-db-entry
        first
        :signup_form)))


(defroutes app-routes
  (GET "/" [] "Hello, world!")
  (GET "/logout" [] (friend/logout* (resp/response "logout ok")))
  (GET "/secret" req
       (friend/authorize #{::admin} "Admin's eyes only!"))
  (POST "/form" {json-form :json-params} (save-form json-form) )
  (GET "/form" [] (resp/response @form))
  (GET "/dbform" [] (resp/response (load-form)))
  (route/files "/" {:root (str (System/getProperty "user.dir") "/static/public")} )
  (route/not-found "Not Found"))

(def app
  (->
    (friend/authenticate app-routes
                         {:allow-anon? true
                          :redirect-on-auth? false
                          :login-uri "/login"
                          :default-landing-uri "/"
                          ; :unauthorized-handler #(-> (h/html5 [:h2 "You do not have sufficient privileges to access " (:uri %)]) resp/response (resp/status 401))
                          :credential-fn #(creds/bcrypt-credential-fn @users %)
                          :workflows [(workflows/interactive-form)]})
    (handler/site)
    (ringjson/wrap-json-params)
    (ringjson/wrap-json-response {:pretty true})))

#_(defonce server
 (do
 (extend-jdbc-psql-protocols)
 (jetty/run-jetty #'app {:port 3000 :join? false})))

(defn -main [port]
  (do
    (extend-jdbc-psql-protocols)
    (jetty/run-jetty #'app {:port (Integer. port) :join? false})))
