/* Model layer for Abhimata's simple user-editable registration forms.
   
   A registration form is modeled as an array where each element represents a
   question in the form. A question is just a HTML input element, such
   as a text box or a radio button, accompanied by explanatory text labels
   (e.g. "First name"). The event admin designing the registration form for an
   event can add, delete, edit and reorder questions.
   
   In general questions can be optional or required, but there is currently
   no other form validation or branching: each registrant receives the same 
   set of questions regardless of what they answer, and the questions are
   only checked for being non-empty. 
 */

var _ = require('lodash');

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
  return _.max(form, "key").key + 1;
};

// Factory functions for the special questions that can't be deleted
// from a form.

var makeNameQuestion = function() {
  return {
    type : "text",
    tag : "fullname",
    label : "Full name",
    isDeletable : false,
    isResponseOptional : false,
    key : 0,
  };
};

var makeEmailQuestion = function() {
  return {
    type : "text",
    tag : "email",
    label : "Email address",
    isDeletable : false,
    isResponseOptional : false,
    key : 1,
  };
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
};
