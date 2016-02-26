(ns abhimata_backend.pdfexport
  (:gen-class))

(defn pdf-checkbox-response [question response]
  (reduce
   (fn [checked-alternatives [alternative checked]]
     (if checked
       (conj checked-alternatives alternative)
       checked-alternatives))
   [:list]
   (zipmap (question "alternatives") response)))

(defn pdf-radio-response [question response]
  (get (question "alternatives") response))


(defn pdf-response [question response]
  (let [type (question "type")]
    (cond
      (= type "paragraph") nil
      (= type "checkbox") (pdf-checkbox-response question response)
      (= type "radio") (pdf-radio-response question response)
      :else [:paragraph response])))

(defn pdf-question [question]
  (if (= (question "type") "paragraph")
    [:paragraph {:style :bold} (question "content")]
    [:heading (question "label")]))

(defn pdf-submitted-form [registration-form submitted-form]
  (let [order (registration-form "order")
        questions (registration-form "questions")]
    (vector
     (apply
      concat
      (map
       (fn [question-key]
         (let [str-key (str question-key)
               question (questions str-key)
               response (submitted-form str-key)]
           [(pdf-question question)
            (pdf-response question response)
            [:spacer 2]]))
       order)))))

(defn make-participant-pdf [registration-form submissions]
  (apply
   concat
   (interpose
    [[:clear-double-page]]
    (map
     (partial pdf-submitted-form registration-form)
     submissions))))

(defn make-csv-header-row [registration-form]
  (let [order (registration-form "order")
        questions (registration-form "questions")]
    (vec
      (map
       (fn [question-key]
         (let [str-key (str question-key)
               question (questions str-key)]
           (question "label")))
       order))))

(defn make-csv-row [registration-form submission]
  (let [order (registration-form "order")]
    (vec
      (map
       (fn [question-key]
         (let [str-key (str question-key)
               response (submission str-key)]
           response))
       order))))

(defn make-participant-csv [registration-form submissions]
  (vec
    (concat
      [(make-csv-header-row registration-form)]
      (map (partial make-csv-row registration-form) submissions))))

