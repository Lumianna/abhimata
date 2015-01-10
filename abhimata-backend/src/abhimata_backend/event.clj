(ns abhimata_backend.event
  (:require [clojure.data.json :as json]
            [schema.core :as schema])
  (:gen-class))

(def email-key 0)

(schema/defschema NonNegIntString
  "Schema for a string consisting of a non-zero-padded, non-negative integer."
  (schema/pred
   (fn is-non-neg-int-str [s] (re-matches #"^(0|[1-9]\d+)$" s))))

(schema/defschema PosInt
  "Schema for a positive integer."
  (schema/both
   schema/Int
   (schema/pred (fn is-positive [key] (> key email-key)))))

(schema/defschema RegistrationFormQuestion
  "Schema for a registration form question."
   (schema/if (fn is-email-question [q] (= (:key q) email-key))
     {:type (schema/eq "text")
      :label schema/Str
      :isDeletable (schema/eq false)
      :isResponseOptional (schema/eq false)
      :key (schema/eq email-key)} 

     {:type (schema/enum "text" "textarea" "radio" "checkbox")
      :label schema/Str
      :isDeletable schema/Bool
      :isResponseOptional schema/Bool
      :key PosInt }))

(schema/defschema RegistrationForm
  "Schema for a registration form."
  (schema/both
   {:order [schema/Int]
    :questions {NonNegIntString RegistrationFormQuestion}}

   ;; Each key of :questions should map to a value in :order
   (schema/pred
    (fn questions-keys-match-order-values [form]
      (let [order-vals (:order form)
            questions-keys (map (fn [key] (Integer/parseInt key))
                                (keys (:questions form)))]
        (= (set order-vals) (set questions-keys)))))))

(defn is-json-registration-form [form]
  (schema/validate RegistrationForm (json/read-str form)))
  
(schema/defschema Event
  "Schema for an event."

  {:title schema/Str
   :max_participants PosInt
   :max_waiting_list_length PosInt
   :visible_to_public schema/Bool
   :registration_open schema/Bool
   :registration_form (schema/pred is-json-registration-form)})


(def email-question 
  {:type "text"
   :label "Email address"
   :isDeletable false
   :isResponseOptional false
   :key email-key })

(def default-registration-form
  {:questions  {(str email-key) email-question},
   :order  [email-key] })

(def default-event
  {:title "Untitled event"
   :max_participants 40
   :max_waiting_list_length 40
   :visible_to_public false
   :registration_open false
   :registration_form (json/write-str default-registration-form) })
