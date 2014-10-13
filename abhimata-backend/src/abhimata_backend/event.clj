(ns abhimata_backend.event
  (:require [clojure.data.json :as json])
  (:gen-class))

(def email-question 
  { 
   :type "text"
   :tag "email"
   :label "Email address"
   :isDeletable false
   :isResponseOptional false
   :key 0 })
   
   

(def default-registration-form
  (json/write-str { :questions  {0 email-question},
                    :order  [0] }))

(def default-event
  {
   :title "Untitled event"
   :registration_form default-registration-form })
   
