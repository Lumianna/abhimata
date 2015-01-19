var actionTypes = require('../constants/constants.js').actionTypes;
var dispatcher = require('../dispatcher/dispatcher.js');
var eventApplicationStore = require('../stores/eventApplicationStore.js');
var $ = require('jquery');
var _ = require('lodash');

function updateApplicationAnswer(event_id, key, value) {
  var payload = {
    event_id: event_id,
    key: key,
    value: value,
    type: actionTypes.UPDATE_APPLICATION_ANSWER,
  };
  dispatcher.handleViewAction(payload);
}

function submit(event_id) {
  var draft = eventApplicationStore.getDraft(event_id);
  var answers = _.mapValues(draft.questions, function(question) {
    return question.value;
  });
  var data = { 
    event_id: event_id,
    submitted_form: answers,
  };

   dispatcher.handleViewAction({type: actionTypes.SUBMIT_APPLICATION_REQUEST});
  $.ajax({ 
    type: "POST",
    url: "events-public",
    success: function() { 
      dispatcher.handleServerAction(
        { 
          type: actionTypes.SUBMIT_APPLICATION_SUCCESS,
          event_id: event_id,
        });
    },
    error: function(data, textStatus) { 
      dispatcher.handleServerAction(
        { 
          type: actionTypes.SUBMIT_APPLICATION_FAIL,
          event_id: event_id,
          errorMessage: data,
          statusCode: textStatus, 
        });
    },
    dataType: "text",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(data),
  });
}

module.exports = {
  updateApplicationAnswer: updateApplicationAnswer,
  submit: submit,
};
