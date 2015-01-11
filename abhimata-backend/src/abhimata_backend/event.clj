(ns abhimata_backend.event
  (:require [clojure.data.json :as json]
            [schema.core :as sc])
  (:gen-class))

(def email-key 0)

(sc/defschema NonNegIntString
  "Schema for a string consisting of a non-zero-padded, non-negative integer."
  (sc/pred
   (fn is-non-neg-int-str [s] (re-matches #"^(0|[1-9]\d+)$" s))))

(sc/defschema PosInt
  "Schema for a positive integer."
  (sc/both
   sc/Int
   (sc/pred (fn is-positive [key] (> key email-key)))))

(sc/defschema RegistrationFormQuestion
  "Schema for a registration form question."
   (sc/if (fn is-email-question [q] (= (q "key") email-key))
     {(sc/required-key "type") (sc/eq "text")
      (sc/required-key "label") sc/Str
      (sc/required-key "isDeletable") (sc/eq false)
      (sc/required-key "isResponseOptional") (sc/eq false)
      (sc/required-key "key") (sc/eq email-key)} 

     {(sc/required-key "type") (sc/enum "text" "textarea" "radio" "checkbox")
      (sc/required-key "label") sc/Str
      (sc/required-key "isDeletable") sc/Bool
      (sc/required-key "isResponseOptional") sc/Bool
      (sc/required-key "key") PosInt }))

(sc/defschema RegistrationForm
  "Schema for a registration form."
  (sc/both
   {(sc/required-key "order") [sc/Int]
    (sc/required-key "questions") {NonNegIntString RegistrationFormQuestion}}

   ;; Each key of :questions should map to a value in :order
   (sc/pred
    (fn questions-keys-match-order-values [form]
      (let [order-vals (form "order")
            questions-keys (map (fn [key] (Integer/parseInt key))
                                (keys (form "questions")))]
        (= (set order-vals) (set questions-keys)))))))

(defn is-json-registration-form [form]
  (sc/validate RegistrationForm (json/read-str form)))
  
(sc/defschema Event
  "Schema for an event."

  {:title sc/Str
   :max_participants PosInt
   :max_waiting_list_length PosInt
   :visible_to_public sc/Bool
   :registration_open sc/Bool
   :registration_form (sc/or
                       (sc/RegistrationForm)
                       (sc/pred is-json-registration-form))})


(def email-question 
  {"type" "text"
   "label" "Email address"
   "isDeletable" false
   "isResponseOptional" false
   "key" email-key })

(def default-registration-form
  {"questions"  {(str email-key) email-question},
   "order"  [email-key] })

(def default-event
  {:title "Untitled event"
   :max_participants 40
   :max_waiting_list_length 40
   :visible_to_public false
   :registration_open false
   :registration_form (json/write-str default-registration-form) })
