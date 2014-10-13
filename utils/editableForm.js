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

var nextAvailableKey = function(form) {
  return _.max(_.keys(form.questions)) + 1;
};


// EXPOSED FUNCTIONS 


var addQuestion = function(form, type) {
  var newQuestion = makeQuestion(type);
  var newkey = nextAvailableKey(form);
  
  form.questions[newkey] = newQuestion;
  form.order.push(newkey);
};


var deleteQuestion = function(form, key) {
  delete form.questions[key];
  var index = _.find(form.order, key);
  form.order = form.order.splice(index, 1);
};


var moveQuestion =  function(form, fromIndex, toIndex) {
  form.order = form.order.splice(toIndex, 0, form.splice(fromIndex, 1));
};
  
  
module.exports = {
  makeForm: makeForm,
  addQuestion: addQuestion,
  deleteQuestion: deleteQuestion,
  moveQuestion: moveQuestion,
};
