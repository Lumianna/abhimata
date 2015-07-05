(defproject abhimata_backend "0.1.0-SNAPSHOT"
  :description "Backend for abhimata"
  :url "https://github/kryft/abhimata"
  :license {:name "GPL3" }
  :plugins [[cider/cider-nrepl "0.7.0-SNAPSHOT"]]
  :dependencies [[org.clojure/clojure "1.6.0"]
                 [org.clojure/data.json "0.2.5"]
                 [clj-pdf "2.0.6"]
                 [org.clojure/java.jdbc "0.3.6"]
                 [prismatic/schema "0.3.3"]
                 [clj-time "0.8.0"]
                 [hiccup "1.0.5"]
                 [postgresql/postgresql "9.1-901.jdbc4"]
                 [com.cemerick/friend "0.2.1"]
                 [com.draines/postal "1.11.3"]
                 [ring/ring-core "1.3.0"]
                 [ring/ring-json "0.3.1"]
                 [compojure "1.1.8"]
                 [ring/ring-jetty-adapter "1.3.0"]]
  :aot [abhimata_backend.core]
  :jvm-opts ["-Djava.net.preferIPv4Stack=true"]
  :main abhimata_backend.core
  :target-path "target/%s"
  :profiles {:uberjar {:aot :all}})
