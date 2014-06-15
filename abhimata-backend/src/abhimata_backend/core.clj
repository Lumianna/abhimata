(ns abhimata-backend.core)

(defn hanndler [request]
  {:status 200
   :header {"Content-Type" "text/html"}
   :body "Hello, World!" })
