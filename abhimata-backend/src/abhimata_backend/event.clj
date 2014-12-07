(ns abhimata_backend.event
  (:require [clojure.data.json :as json])
  (:gen-class))

(def email-key 0)

(def email-question 
  { 
   :type "text"
   :label "Email address"
   :isDeletable false
   :isResponseOptional false
   :key email-key })
   
   

(def default-registration-form
  (json/write-str { :questions  {email-key email-question},
                    :order  [0] }))

(def default-event
  {
   :title "Untitled event"
   :max_participants 40
   :max_waiting_list_length 40
   :visible_to_public false
   :registration_open false
   :registration_form default-registration-form })
