(defproject abhimata-backend "0.1.0-SNAPSHOT"
  :description "Backend for abhimata"
  :url "https://github/kryft/abhimata"
  :license {:name "GPL3" }
  :plugins [[cider/cider-nrepl "0.7.0-SNAPSHOT"]]
  :dependencies [[org.clojure/clojure "1.6.0"]
                 [com.cemerick/friend "0.2.1"]
                 [ring/ring-core "1.3.0"]
                 [compojure "1.1.8"]
                 [ring/ring-jetty-adapter "1.3.0"]])
