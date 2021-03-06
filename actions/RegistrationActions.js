var $ = require('jquery');
var _ = require('lodash');

var alt = require('../alt.js');
var EventActions = require('./EventActions.js');

function RegistrationActions() {
  this.generateActions(
    'updateAnswer',
    'validateAnswer',
    'clearAnswerError',
    'submitSucceeded',
    'submitFailed',
    'requestCancellationInfoSucceeded',
    'requestCancellationInfoFailed',
    'requestCancellationEmailSucceeded',
    'requestCancellationEmailFailed',
    'cancelRegistrationSucceeded',
    'cancelRegistrationFailed',
    'updateParticipantStatusSucceeded',
    'updateParticipantStatusFailed',
    'getRegistrationStatusSucceeded',
    'getRegistrationStatusFailed'
  );
}

RegistrationActions.prototype.submit = function(event_id) {
  this.dispatch(event_id);

  var EventApplicationStore = require('../stores/EventApplicationStore.js');
  var draft = EventApplicationStore.getDraft(event_id);

  // Don't submit if the store says there are still errors
  if(!draft.submitting) {
    return;
  }
  
  var answers = _.mapValues(draft.questions, function(question) {
    return question.value;
  });

  var data = { 
    event_id: event_id,
    submitted_form: answers,
  };

  var that = this;

  $.ajax({ 
    type: "POST",
    url: "events-public",
    success: function() { 
      that.actions.submitSucceeded({ 
          event_id: event_id,
      });
    },
    error: function(data, textStatus) { 
      that.actions.submitFailed({
          event_id: event_id,
          errorMessage: data,
          statusCode: textStatus, 
      });
    },
    dataType: "text",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(data),
  });
};

RegistrationActions.prototype.requestCancellationEmail = function (uuid) {
  this.dispatch(uuid);
  var that = this;

  $.ajax({ 
    type: "GET",
    url: "request-cancellation-email/" + uuid,
    success: function(data) { 
      that.actions.requestCancellationEmailSucceeded({ 
        uuid: uuid,
        info: data,
      });
    },
    error: function(data, textStatus) { 
      that.actions.requestCancellationEmailFailed({ 
        uuid: uuid,
        errorMessage: data,
        statusCode: textStatus, 
      });
    },
    dataType: "text",
    contentType: "application/json; charset=utf-8",
  });
};


RegistrationActions.prototype.cancel = function(uuid, eventId) {
  this.dispatch({ uuid: uuid, eventId: eventId });
  var that = this;
  
  $.ajax({ 
    type: "POST",
    url: "cancel/" + uuid,
    success: function() { 
      that.actions.cancelRegistrationSucceeded({
        uuid: uuid,
        eventId: eventId,
      });

      that.actions.getRegistrationStatusByCancellationUUID(uuid);
    },
    error: function(data, textStatus) { 
      that.actions.cancelRegistrationFailed({
        uuid: uuid,
        eventId: eventId,
        errorMessage: data,
        statusCode: textStatus, 
      });
    },
    dataType: "text",
    contentType: "application/json; charset=utf-8",
  });
};

RegistrationActions.prototype.getRegistrationStatus = function (uuid) {
  var that = this;
  $.ajax({ 
    type: "GET",
    url: "registration-status/" + uuid,
    success: function(data) { 
      that.actions.getRegistrationStatusSucceeded({
        uuid: uuid,
        statusData: data,
      });
    },
    error: function(data, textStatus) { 
      that.actions.getRegistrationStatusFailed({
        uuid: uuid,
        errorMessage: data,
        statusCode: textStatus, 
      });
    },
    dataType: "json",
    contentType: "application/json; charset=utf-8",
  });
};

RegistrationActions.prototype.getRegistrationStatusByCancellationUUID = function (uuid) {
  var that = this;
  $.ajax({ 
    type: "GET",
    url: "cancel/" + uuid,
    success: function(data) { 
      that.actions.getRegistrationStatusSucceeded({
        uuid: uuid,
        statusData: data,
      });
    },
    error: function(data, textStatus) { 
      that.actions.getRegistrationStatusFailed({
        uuid: uuid,
        errorMessage: data,
        statusCode: textStatus, 
      });
    },
    dataType: "json",
    contentType: "application/json; charset=utf-8",
  });
};

module.exports = alt.createActions(RegistrationActions);
