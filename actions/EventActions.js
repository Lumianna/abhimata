var AuthActions = require('./AuthActions.js');

var alt = require('../alt.js');
var $ = require('jquery');

function EventActions() {
  this.generateActions(
    'updateEventProperty',
    'validateEventProperty',
    'updateQuestionProperty',
    'addQuestion',
    'moveQuestion',
    'deleteQuestion',
    'requestEventDetailsSucceeded',
    'requestEventDetailsFailed',
    'requestPrivateEventListSucceeded',
    'requestPrivateEventListFailed',
    'requestPublicEventSucceeded',
    'requestPublicEventFailed',
    'requestPublicEventListSucceeded',
    'requestPublicEventListFailed',
    'createEventSucceeded',
    'createEventFailed',
    'deleteEventSucceeded',
    'deleteEventFailed',
    'saveEventSucceeded',
    'saveEventFailed'
  );
}


EventActions.prototype.requestPublicEventList = function() {
  this.dispatch();
  var that = this;

  $.ajax({ 
    type: "GET",
    url: "events-public",
    success: function(data) { 
      that.actions.requestPublicEventListSucceeded({
        events: data
      });
    },
    error: function(data, textStatus) { 
      that.actions.requestPublicEventListFailed({
          errorData: data,
        statusCode: textStatus
      });
    },
    dataType: "json"
  });
};

EventActions.prototype.requestPublicEvent = function (event_id) {
  this.dispatch(event_id);
  var that = this;

  $.ajax({
    type: "GET",
    url: "events-public/" + event_id,
    success: function(data) { 
      that.actions.requestPublicEventSucceeded({
        event_id: event_id,
        event: data
      });
    },
    error: function(data, textStatus) { 
      that.actions.requestPublicEventFailed({
        event_id: event_id,
        errorData: data,
        statusCode: textStatus
      });
    },
    dataType: "json"
  });
};


EventActions.prototype.requestPrivateEventList = function () {
  this.dispatch();
  var that = this;

  $.ajax({ 
    type: "GET",
    url: "events-private",
    success: function(data) { 
      that.actions.requestPrivateEventListSucceeded({ 
        events: data 
      });
    },
    error: function(data, textStatus) { 
      if(data.status === 401) {
        AuthActions.loginExpired();
      }

      that.actions.requestPrivateEventListFailed({ 
        errorData: data,
        statusCode: textStatus 
      });
    },
    dataType: "json"
  });
};

EventActions.prototype.requestEventDetails = function(event_id) {
  this.dispatch(event_id);
  var that = this;

  var url = "events-private/" + event_id;
  $.ajax({ 
    type: "GET",
    url: url,
    success: function(data) { 
      that.actions.requestEventDetailsSucceeded({
        event: data
      });
    },
    error: function(data, textStatus) { 
      that.actions.requestEventDetailsFailed({
        event: data
      });
      
      if(data.status === 401) {
        AuthActions.loginExpired();
      }
    },
    dataType: "json"
  });
};

EventActions.prototype.createEvent = function () {
  this.dispatch();
  var that = this;

  $.ajax({ 
    type: "POST",
    url: "events-private",
    data: JSON.stringify(
      { }),
    success: function(data) { 
      that.actions.createEventSucceeded();
      that.actions.requestPrivateEventList();
    },
    error: function(data, textStatus) { 
      that.actions.createEventFailed();
    },
    contentType: "application/json; charset=utf-8"
  });
};

EventActions.prototype.saveEvent = function(event_id) {
  this.dispatch(event_id);
  var that = this;

  var url = "events-private/" + event_id;

  var eventDraftStore = require('../stores/eventDraftStore.js');
  var eventData = eventDraftStore.validateEventDraft(event_id);

  var failureHandler = function(errorMessage) {
    that.actions.saveEventFailed({ 
      errorMessage: errorMessage,
    });
  };

  console.log(eventData);

  if(!eventData) {
    failureHandler("Invalid event data; this is probably a bug.");
  } else {
    $.ajax({ 
      type: "POST",
      url: url,
      data: JSON.stringify(eventData),
      dataType: "json",
      success: function() { 
        that.actions.saveEventSucceeded({ 
          event_id: event_id,
        });

        that.actions.requestEventDetails(event_id);
      },
      error: failureHandler.bind(null, "Saving to server failed."),
      contentType: "application/json; charset=utf-8"
    });
  }
};

EventActions.prototype.deleteEvent = function(event_id) {
  this.dispatch(event_id);
  var that = this;
  
  var url = "events-private/" + event_id;
  $.ajax({ 
    type: "DELETE",
    url: url,
    data: JSON.stringify({}),
    dataType: "json",
    success: function() { 
      that.actions.deleteEventSucceeded({ 
        event_id: event_id,
      });
    },
    error: function() { 
      that.actions.deleteEventFailed();
    },
    contentType: "application/json; charset=utf-8"
  });
};

module.exports = alt.createActions(EventActions);
