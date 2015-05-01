var $ = require('jquery');
var _ = require('lodash');

var alt = require('../alt.js');

function RegistrationActions() {
  this.generateActions(
    'updateApplicationAnswer',
    'submitSucceeded',
    'submitFailed',
    'requestCancellationInfoSucceeded',
    'requestCancellationInfoFailed',
    'cancelRegistrationSucceeded',
    'cancelRegistrationFailed',
    'verifyEmailSucceeded',
    'verifyEmailFailed'
  );
}

RegistrationActions.prototype.submit = function (event_id, draft) {
  this.dispatch(draft);
  
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

RegistrationActions.prototype.requestCancellationInfo = function (uuid) {
  this.dispatch(uuid);
  var that = this;

  $.ajax({ 
    type: "GET",
    url: "cancel/" + uuid,
    success: function(data) { 
      that.actions.requestCancellationInfoSucceeded({ 
          uuid: uuid,
          info: data,
      });
    },
    error: function(data, textStatus) { 
      that.actions.requestCancellationInfoFailed({ 
          uuid: uuid,
          errorMessage: data,
          statusCode: textStatus, 
      });
    },
    dataType: "json",
    contentType: "application/json; charset=utf-8",
  });
};

RegistrationActions.prototype.cancel = function(uuid) {
  this.dispatch(uuid);
  var that = this;
  
  $.ajax({ 
    type: "POST",
    url: "cancel/" + uuid,
    success: function() { 
      that.actions.cancelRegistrationSucceeded({
        uuid: uuid,
      });
    },
    error: function(data, textStatus) { 
      that.actions.cancelRegistrationFailed({
        uuid: uuid,
        errorMessage: data,
        statusCode: textStatus, 
      });
    },
    dataType: "text",
    contentType: "application/json; charset=utf-8",
  });
};

RegistrationActions.prototype.verifyEmail = function (uuid) {
  var that = this;
  $.ajax({ 
    type: "GET",
    url: "verify-email/" + uuid,
    success: function() { 
      that.actions.verifyEmailSucceeded({
        uuid: uuid,
      });
    },
    error: function(data, textStatus) { 
      that.actions.verifyEmailFailed({
        uuid: uuid,
        errorMessage: data,
        statusCode: textStatus, 
      });
    },
    dataType: "text",
    contentType: "application/json; charset=utf-8",
  });
};

module.exports = alt.createActions(RegistrationActions);