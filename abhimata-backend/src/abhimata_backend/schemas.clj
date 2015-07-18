(ns abhimata_backend.schemas
  (:require [clojure.data.json :as json]
            [schema.core :as sc])
  (:gen-class))

(def name-key 0)
(def email-key 1)

(def no-radio-selected -1)

(sc/defschema NonNegIntString
  "Schema for a string consisting of a non-zero-padded, non-negative integer."
  (sc/pred
   (fn is-non-neg-int-str [s] (re-matches #"^(0|[1-9]\d*)$" s))))

(sc/defschema NonNegInt
  "Schema for a non-negative integer."
  (sc/both
   sc/Int
   (sc/pred (fn is-non-negative [key] (>= key 0)))))

(sc/defschema PosInt
  "Schema for a positive integer."
  (sc/both
   sc/Int
   (sc/pred (fn is-positive [key] (> key 0)))))

(sc/defschema EmailField
  "Schema for the email question (which is special in that every form always
   has one and the key is always email-key)."
  {(sc/required-key "key") (sc/eq email-key)
   (sc/required-key "type") (sc/eq "text")
   (sc/required-key "index") NonNegInt
   (sc/required-key "label") sc/Str
   (sc/required-key "isDeletable") (sc/eq false)
   (sc/required-key "isResponseOptional") (sc/eq false)})

(sc/defschema NameField
  "Schema for the name question (which is special in that every form always
   has one and the key is always name-key)."
  {(sc/required-key "key") (sc/eq name-key)
   (sc/required-key "type") (sc/eq "text")
   (sc/required-key "index") NonNegInt
   (sc/required-key "label") sc/Str
   (sc/required-key "isDeletable") (sc/eq false)
   (sc/required-key "isResponseOptional") (sc/eq false)})

(sc/defschema GenericField
  "All fields have these keys, and 'text' and 'textarea' fields
   currently have no other keys."
  {(sc/required-key "key") PosInt
   (sc/required-key "type") sc/Str
   (sc/required-key "index") NonNegInt
   (sc/required-key "label") sc/Str
   (sc/required-key "isDeletable") sc/Bool
   (sc/required-key "isResponseOptional") sc/Bool})

(sc/defschema EnumField
  "Field whose values come from a certain set of strings
   (currently radio groups and checkbox groups)"
  (assoc GenericField
    (sc/required-key "alternatives") [sc/Str]))


(sc/defschema RegistrationFormField
  "Schema for a registration form field."
  (sc/conditional
    (fn [f] (= (f "type") "text")) GenericField
    (fn [f] (= (f "type") "textarea")) GenericField
    (fn [f] (= (f "type") "radio")) EnumField
    (fn [f] (= (f "type") "checkbox")) EnumField))

(sc/defschema RegistrationForm
  "Schema for an event registration form."
  (sc/both
   {(sc/required-key "order") [sc/Int]
    (sc/required-key "questions")
    {(sc/required-key (str email-key)) EmailField
     (sc/required-key (str name-key)) NameField
     NonNegIntString RegistrationFormField}}

   ;; Each key of :questions should map to a value in :order
   (sc/pred
    (fn questions-keys-match-order-values [form]
      (let [order-vals (form "order")
            questions-keys (map (fn [key] (Integer/parseInt key))
                                (keys (form "questions")))]
        (= (set order-vals) (set questions-keys)))))))

(defn make-checkbox-answer-schema [alternatives]
  (sc/both
   [sc/Bool]
   (sc/pred (fn [v] (= (count v) (count alternatives))))))

(defn make-radio-answer-schema [alternatives]
  (apply sc/enum no-radio-selected (range (count alternatives))))
         
(defn make-answer-schema [{type "type"
                           alternatives "alternatives"
                           is-optional "isResponseOptional"}]
  (sc/both
   (cond
     (= type "checkbox") (make-checkbox-answer-schema alternatives)
     (= type "radio") (make-radio-answer-schema alternatives)
     :else sc/Str)
   (if is-optional
     sc/Any
     (cond
       (= type "radio") (sc/pred (fn [a] (not (= a no-radio-selected))))
       :else (sc/pred (comp not empty?))))))
  
(defn make-submitted-form-schema [registration-form]
  (reduce
   (fn [answers-schema [q-key question]]
     (assoc answers-schema
            (sc/required-key q-key)
            (make-answer-schema question)))
   {}
   (seq (registration-form "questions"))))

(defn make-submitted-application-schema [registration-form]
  "Generates a schema for the data submitted when a user registers for an event (essentially a filled-in form). The parameter registration-form is the registration form for the event: what the filled-in form should look like naturally depends on the registration form."
  {(sc/required-key "event_id")
   sc/Int
   (sc/required-key "submitted_form")
   (make-submitted-form-schema registration-form)})
  

(defn is-json-registration-form [form]
  (not (sc/check RegistrationForm (json/read-str form))))
  
(sc/defschema Event
  "Schema for an event."

  {:title sc/Str
   :max_participants PosInt
   :max_waiting_list_length PosInt
   :visible_to_public sc/Bool
   :registration_open sc/Bool
   :has_registration_fee sc/Bool
   :has_deposit sc/Bool
   :applications_need_screening sc/Bool
   :registration_form
   (sc/either
    RegistrationForm
    (sc/pred is-json-registration-form))})


(def default-email-field
  {"type" "text"
   "label" "Email address"
   "isDeletable" false
   "isResponseOptional" false
   "key" email-key
   "index" 1})

(def default-name-field
  {"type" "text"
   "label" "Name"
   "isDeletable" false
   "isResponseOptional" false
   "key" name-key
   "index" 0})


(def default-registration-form
  {"questions"  {(str email-key) default-email-field
                 (str name-key) default-name-field},
   "order"  [name-key email-key] })

(def default-event
  {:title "Untitled event"
   :max_participants 40
   :max_waiting_list_length 40
   :visible_to_public false
   :has_deposit false
   :has_registration_fee false
   :applications_need_screening false
   :registration_open false
   :registration_form (json/write-str default-registration-form) })
