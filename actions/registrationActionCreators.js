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

function getCancellationInfo(uuid) {
  dispatcher.handleViewAction({
    type: actionTypes.GET_CANCELLATION_INFO_REQUEST
  });

  $.ajax({ 
    type: "GET",
    url: "cancel/" + uuid,
    success: function(data) { 
      dispatcher.handleServerAction(
        { 
          type: actionTypes.GET_CANCELLATION_INFO_SUCCESS,
          uuid: uuid,
          info: data,
        });
    },
    error: function(data, textStatus) { 
      dispatcher.handleServerAction(
        { 
          type: actionTypes.GET_CANCELLATION_INFO_FAIL,
          uuid: uuid,
          errorMessage: data,
          statusCode: textStatus, 
        });
    },
    dataType: "json",
    contentType: "application/json; charset=utf-8",
  });
}

function cancel(uuid) {
   dispatcher.handleViewAction({type: actionTypes.CANCEL_REGISTRATION_REQUEST});
  $.ajax({ 
    type: "POST",
    url: "cancel/" + uuid,
    success: function() { 
      dispatcher.handleServerAction(
        { 
          type: actionTypes.CANCEL_REGISTRATION_SUCCESS,
          uuid: uuid,
        });
    },
    error: function(data, textStatus) { 
      dispatcher.handleServerAction(
        { 
          type: actionTypes.CANCEL_REGISTRATION_FAIL,
          uuid: uuid,
          errorMessage: data,
          statusCode: textStatus, 
        });
    },
    dataType: "text",
    contentType: "application/json; charset=utf-8",
  });
}

function verifyEmail(uuid) {
  $.ajax({ 
    type: "GET",
    url: "verify-email/" + uuid,
    success: function() { 
      dispatcher.handleServerAction(
        { 
          type: actionTypes.VERIFY_EMAIL_SUCCESS,
          uuid: uuid,
        });
    },
    error: function(data, textStatus) { 
      dispatcher.handleServerAction(
        { 
          type: actionTypes.VERIFY_EMAIL_FAIL,
          uuid: uuid,
          errorMessage: data,
          statusCode: textStatus, 
        });
    },
    dataType: "text",
    contentType: "application/json; charset=utf-8",
  });
}

module.exports = {
  cancel: cancel,
  getCancellationInfo: getCancellationInfo,
  submit: submit,
  updateApplicationAnswer: updateApplicationAnswer,
  verifyEmail: verifyEmail,
};
