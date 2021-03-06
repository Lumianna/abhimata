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

var makeParagraph = function() {
  var elem = {};
  elem.type = "paragraph";
  elem.content = "Content";
  elem.isDeletable = true;

  return elem;
};


// Generates a unique key.

var nextAvailableKey = function(form) {
  return _.max(form.questions, "key").key + 1;
};


var findIndexByKey = function(form, key) {
  return _.findIndex(form.order, 
                     function(x) { return x === key; });
};


// EXPOSED FUNCTIONS 


var addElement = function(form, type, index) {
  var make = type === "paragraph" ? makeParagraph : makeQuestion;
  var newElement = make(type);
  var key = nextAvailableKey(form);
  newElement.key = key;
  
  form.questions[key] = newElement;
  form.order.push(key);

  if(_.isNumber(index)) {
    moveElement(form, key, index);
  }
};


var deleteElement = function(form, key) {
  delete form.questions[key];
  var index = findIndexByKey(form, key);
  form.order.splice(index, 1);
};


var moveElement = function(form, key, toIndex) {
  var fromIndex = findIndexByKey(form, key);
  
  if(toIndex !== fromIndex && toIndex >= 0 && toIndex < form.order.length)
  {
    form.order.splice(toIndex, 0, form.order.splice(fromIndex, 1)[0]);
  }
};
  
  
module.exports = {
  addElement: addElement,
  deleteElement: deleteElement,
  moveElement: moveElement,
};
