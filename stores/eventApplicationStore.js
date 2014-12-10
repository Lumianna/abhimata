var actionTypes = require('../constants/constants.js').actionTypes;
var createStore = require('../utils/createStore.js');
var publicEventStore = require('./publicEventStore.js');

var _ = require('lodash');

var _applications = {};

var ERR_ANSWER_REQUIRED = "This question must be answered.";
var NO_RADIO_SELECTED = -1;


function makeDraft(event) {
  var draft = {};
  
  _.each(event.registration_form.questions, function(question) {
    var response;
    switch(question.type) {
      case "radio":
        response = NO_RADIO_SELECTED;
        break;
      case "checkbox":
        response = _.map(question.alternatives, function() { return false; });
        break;
      default:
        response = "";
        break;
    }

    draft[question.key] = {
      value: response,
      error: question.isResponseOptional ? null : ERR_ANSWER_REQUIRED,
      question: question,
    };
  });
  
  return draft;
}

// Currently only checks whether required questions have been answered,
// but could in principle check something else as well.

function getAnswerErrorState(answer) {
  if(answer.question.isResponseOptional) {
    return null;
  }

  var answered = false;
  switch(answer.question.type) {
    case "text":
    case "textarea":
      answered = answer.value.length > 0;
      break;
    case "radio":
      answered = answer.value !== NO_RADIO_SELECTED;
      break;
    case "checkbox":
      answered = _.contains(answer.value, true);
      break;
  }
  
  return answered ? null : ERR_ANSWER_REQUIRED;
}

var actionHandler = function(payload) {
  var act = payload.action;
  var draft = _applications[act.event_id];

  switch(act.type) {
    case actionTypes.UPDATE_APPLICATION_ANSWER:
      draft[act.key].value = act.value;
      draft[act.key].error = getAnswerErrorState(draft[act.key]);
      eventApplicationStore.emitChange();
      break;

    case actionTypes.REQUEST_PUBLIC_EVENT_LIST_SUCCESS:
      var events = publicEventStore.getEvents();
      _.each(events, function(event) {
        if(!_applications[event.event_id]) {
          _applications[event.event_id] = makeDraft(event);
        }
      });
      eventApplicationStore.emitChange();
      break;

    default:
      //do nothing
      break;
  }
};

var eventApplicationStore = createStore(actionHandler, {
  getDraft: function(event_id) {
    if(!_applications[event_id]) {
      return undefined;
    }
    return _applications[event_id];
  },
});

module.exports = eventApplicationStore;
