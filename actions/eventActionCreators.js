var dispatcher = require('../dispatcher/dispatcher.js');
var actionTypes = require('../constants/constants.js').actionTypes;
var eventStore = require('../stores/eventStore.js');
var $ = require('jquery');

function requestEventsPublic () {
  dispatcher.handleViewAction({type: actionTypes.REQUEST_EVENTS_PUBLIC});
  $.ajax({ 
    type: "GET",
    url: "events",
    success: function(data) { 
      dispatcher.handleServerAction(
        { type: actionTypes.REQUEST_EVENTS_PUBLIC_SUCCESS,
          events: data });
    },
    error: function(data, textStatus) { 
      dispatcher.handleServerAction(
        { type: actionTypes.REQUEST_EVENTS_PUBLIC_FAILURE,
          errorData: data,
          statusCode: textStatus });
    },
    dataType: "json"
  });
}

function requestEventPrivate (event_id) {
  dispatcher.handleViewAction({type: actionTypes.REQUEST_EVENT_PRIVATE});

  var url = "events/" + event_id;
  $.ajax({ 
    type: "GET",
    url: url,
    success: function(data) { 
      console.log(data);
      dispatcher.handleServerAction(
        { type: actionTypes.REQUEST_EVENT_PRIVATE_SUCCESS,
          event: data });
    },
    error: function(data, textStatus) { 
      dispatcher.handleServerAction(
        { type: actionTypes.REQUEST_EVENT_PRIVATE_FAIL,
          event: data });
      console.log(data);
    },
    dataType: "json"
  });
}

function createEvent () {
  dispatcher.handleViewAction( { type: actionTypes.CREATE_EVENT } );
  $.ajax({ 
    type: "POST",
    url: "events",
    data: JSON.stringify(
      { }),
    success: function(data) { 
      dispatcher.handleServerAction(
        { type: actionTypes.CREATE_EVENT_SUCCESS } );
      requestEventsPublic();
    },
    error: function(data, textStatus) { 
      dispatcher.handleServerAction( 
        { type: actionTypes.CREATE_EVENT_FAIL } );
    },
    contentType: "application/json; charset=utf-8"
  });
}

function updateEventProperty (event_id, propertyName, value) {
  dispatcher.handleViewAction( 
    { type: actionTypes.UPDATE_EVENT_PROPERTY,
      event_id: event_id,
      property: propertyName,
      value: value,
    });
}

function saveEvent (event_id) {
  var url = "events/" + event_id;
  var eventData = eventStore.getEventPrivate(event_id);
  $.ajax({ 
    type : "POST",
    url : url,
    data : JSON.stringify(eventData),
    dataType : "json",
    success : function() { 
      dispatcher.handleServerAction({ 
        type : actionTypes.SAVE_EVENT_SUCCESS,
        event_id : event_id,
      });
    },
    error : function() { 
      dispatcher.handleServerAction({ 
        type : actionTypes.SAVE_EVENT_FAIL });
    },
    contentType : "application/json; charset=utf-8"
  });
}

function deleteEvent (event_id) {
  var url = "events/" + event_id;
  var eventData = eventStore.getEventPrivate(event_id);
  $.ajax({ 
    type : "DELETE",
    url : url,
    data : JSON.stringify(eventData),
    dataType : "json",
    success : function() { 
      dispatcher.handleServerAction({ 
        type : actionTypes.DELETE_EVENT_SUCCESS,
        event_id : event_id,
      });
    },
    error : function() { 
      dispatcher.handleServerAction({ 
        type : actionTypes.DELETE_EVENT_FAIL });
    },
    contentType : "application/json; charset=utf-8"
  });
}


function addQuestion(opts) {
  dispatcher.handleViewAction({
    questionType: opts.questionType,
    event_id: event_id,
  });
}


function updateQuestionProperty(opts) {
  opts.type = actionTypes.UPDATE_REGISTRATION_FORM_QUESTION_PROPERTY;
  dispatcher.handleViewAction(opts);
}


function addQuestion(opts) {
  opts.type = actionTypes.ADD_REGISTRATION_FORM_QUESTION;
  dispatcher.handleViewAction(opts);
}


function deleteQuestion(opts) {
  opts.type = actionTypes.DELETE_REGISTRATION_FORM_QUESTION;
  dispatcher.handleViewAction(opts);
}

module.exports = {
  requestEventsPublic: requestEventsPublic,
  requestEventPrivate: requestEventPrivate,
  createEvent: createEvent,
  updateEventProperty: updateEventProperty,
  saveEvent: saveEvent,
  deleteEvent: deleteEvent,
  addQuestion: addQuestion,
  updateQuestionProperty: updateQuestionProperty,
  deleteQuestion: deleteQuestion,
}
