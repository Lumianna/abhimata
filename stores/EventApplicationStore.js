var itemStatus = require('../constants/constants.js').itemStatus;
var PublicEventStore = require('./PublicEventStore.js');
var RegistrationActions = require('../actions/RegistrationActions.js');
var EventActions = require('../actions/EventActions.js');
var alt = require('../alt.js');

var _ = require('lodash');

var _applications = {};

var ERR_ANSWER_REQUIRED = "This question must be answered.";
var NO_RADIO_SELECTED = -1;


function makeDraft(event) {
  var draft = {
    submissionCompleted: false,
    waitingForResponse: false,
    serverError: null,
    questions: {},
  };
  
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

    draft.questions[question.key] = {
      value: response,
      error: null,
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

function EventApplicationStore() {
  this.bindActions(RegistrationActions);
  this.bindActions(EventActions);

  this.exportPublicMethods({
    getDraft: function(event_id) {
      if(!_applications[event_id]) {
        return itemStatus.LOADING;
      }
      return _applications[event_id];
    },
  });
}

EventApplicationStore.prototype.onUpdateAnswer = function(payload) {
  var draft = _applications[payload.event_id];

  var question = draft.questions[payload.key];
  question.value = payload.value;
};

EventApplicationStore.prototype.onValidateAnswer = function(payload) {
  var draft = _applications[payload.event_id];

  var question = draft.questions[payload.key];
  question.error = getAnswerErrorState(question);
};

EventApplicationStore.prototype.onClearAnswerError = function(payload) {
  var draft = _applications[payload.event_id];

  var question = draft.questions[payload.key];
  question.error = null;
};

EventApplicationStore.prototype.onRequestPublicEventListSucceeded = function(payload) {
  var events = PublicEventStore.getEvents();
  _.each(events, function(event) {
    if(!_applications[event.event_id]) {
      _applications[event.event_id] = makeDraft(event);
    }
  });
};

EventApplicationStore.prototype.onRequestPublicEventSucceeded = function(payload) {
  if(!_applications[payload.event.event_id]) {
    _applications[payload.event.event_id] = makeDraft(payload.event);
  }
};


EventApplicationStore.prototype.onSubmit = function(event_id) {
  var draft = _applications[event_id];

  _.each(draft.questions, function(question) {
    question.error = getAnswerErrorState(question);
  });

  if(!_.any(draft.questions, "error")) {
    draft.submitting = true;
  }
};


EventApplicationStore.prototype.onSubmitSucceeded = function(payload) {
  var draft = _applications[payload.event_id];

  draft.submitting = false;
  draft.submissionComplete = true;
  draft.serverError = null;
};

EventApplicationStore.prototype.onSubmitFailed = function(payload) {
  var draft = _applications[payload.event_id];

  draft.submitting = false;
  var message = payload.errorMessage;
  if(message.responseText) {
    draft.serverError = message.responseText +
      " (" + message.status + " " + message.statusText + ")";
  } else {
    draft.serverError = "Could not connect to the server. If your internet connection is working, the server might be down. You can try to press the submit button again later.";
  }
};


module.exports = alt.createStore(EventApplicationStore, 'EventApplicationStore');
