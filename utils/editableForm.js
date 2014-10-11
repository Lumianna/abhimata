/* Model layer for Abhimata's simple user-editable sign-up forms.
   
   A sign-up form is modeled as an array where each element represents a
   question in the form. A question is just a HTML input element, such
   as a text box or a radio button, accompanied by explanatory text labels
   (e.g. "First name"). The event admin designing the sign-up form for an
   event can add, delete, edit and reorder questions.
   
   An empty form starts with two special questions that cannot be deleted
   or made optional: these questions are meant for the registrant's full
   name and email address. Abhimata currently requires every registrant to
   have a functioning email address, and each registrant should furthermore
   be uniquely identifiable by the combination of full name and email 
   address.
   
   In general questions can be optional or required, but there is currently
   no other form validation or branching: each registrant receives the same 
   set of questions regardless of what they answer, and the questions are
   only checked for being non-empty. 
 */

var _ = require('lodash');


var recognizedQuestionTypes = [
  { type: "text", 
    description: "Small textbox"},
  { type: "textarea", 
    description: "Big textbox"},
  { type: "radio", 
    description: "Radio button" },
  { type: "checkbox", 
    description: "Checkbox" }
]; 

/* INTERNAL FUNCTIONS */

// Factory function for question objects. 
var makeQuestion = function(type) {
  var elem = {};
  elem.type = type;
  elem.label = "?";
  elem.isResponseOptional = false;
  elem.isDeletable = true;
  if (type === "radio" || type === "checkbox") {
    elem.alternatives = ["a", "b"]; 
  }
  
  return elem;
};


// Generates a unique key.
// This key currently only matters in React rendering.

var nextAvailableKey = function(form) {
  return _.max(form, "key") + 1;
};

// Factory functions for the special questions that can't be deleted
// from a form.

makeNameQuestion() {
  return {
    type : "text",
    tag : "fullname",
    label : "Full name",
    isDeletable : false,
    isResponseOptional : false,
    key : 0,
};

makeEmailQuestion = function() {
  return {
    type : "text",
    tag : "email",
    label : "Email address",
    isDeletable : false,
    isResponseOptional : false,
    key : 1,
};


// EXPOSED FUNCTIONS 

var makeForm = function() {
  return [
    makeNameQuestion(),
    makeEmailQuestion()
    ];
};


var addQuestion = function(form, type) {
  var newQuestion = makeQuestion(type);
  newQuestion.key = nextAvailableKey(form);
  
  return form.concat([newQuestion]);
};


var deleteQuestion = function(form, index) {
  return form.splice(index, 1);
};


var moveQuestion =  function(form, fromIndex, toIndex) {
  return form.splice(toIndex, 0, form.splice(fromIndex, 1));
};
  
  
module.exports = {
  makeForm: makeForm,
  addQuestion: addQuestion,
  deleteQuestion: deleteQuestion,
  moveQuestion: moveQuestion,
  recognizedQuestionTypes: recognizedQuestionTypes,
};
