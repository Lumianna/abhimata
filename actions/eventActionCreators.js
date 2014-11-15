var dispatcher = require('../dispatcher/dispatcher.js');
var actionTypes = require('../constants/constants.js').actionTypes;
var publicEventStore = require('../stores/publicEventStore.js');
var privateEventStore = require('../stores/privateEventStore.js');
var eventDraftStore = require('../stores/eventDraftStore.js');
var authActions = require('./authActionCreators.js');
var $ = require('jquery');

function requestPublicEventList () {
  dispatcher.handleViewAction({type: actionTypes.REQUEST_PUBLIC_EVENT_LIST});
  $.ajax({ 
    type: "GET",
    url: "events-public",
    success: function(data) { 
      dispatcher.handleServerAction(
        { type: actionTypes.REQUEST_PUBLIC_EVENT_LIST_SUCCESS,
          events: data });
    },
    error: function(data, textStatus) { 
      dispatcher.handleServerAction(
        { type: actionTypes.REQUEST_PUBLIC_EVENT_LIST_FAILURE,
          errorData: data,
          statusCode: textStatus });
    },
    dataType: "json"
  });
}

function requestPrivateEventList () {
  dispatcher.handleViewAction({type: actionTypes.REQUEST_PRIVATE_EVENT_LIST});
  $.ajax({ 
    type: "GET",
    url: "events-private",
    success: function(data) { 
      dispatcher.handleServerAction(
        { type: actionTypes.REQUEST_PRIVATE_EVENT_LIST_SUCCESS,
          events: data });
    },
    error: function(data, textStatus) { 
      dispatcher.handleServerAction(
        { type: actionTypes.REQUEST_PRIVATE_EVENT_LIST_FAILURE,
          errorData: data,
          statusCode: textStatus });
    },
    dataType: "json"
  });
}

function requestEventDetails (event_id) {
  dispatcher.handleViewAction({type: actionTypes.REQUEST_EVENT_DETAILS});

  var url = "events-private/" + event_id;
  $.ajax({ 
    type: "GET",
    url: url,
    success: function(data) { 
      console.log(data);
      dispatcher.handleServerAction(
        { type: actionTypes.REQUEST_EVENT_DETAILS_SUCCESS,
          event: data });
    },
    error: function(data, textStatus) { 
      dispatcher.handleServerAction(
        { type: actionTypes.REQUEST_EVENT_DETAILS_FAIL,
          event: data });
      
      if(data.status === 401) {
        authActions.loginExpired();
      }
      console.log(data);
    },
    dataType: "json"
  });
}

function createEvent () {
  dispatcher.handleViewAction( { type: actionTypes.CREATE_EVENT } );
  $.ajax({ 
    type: "POST",
    url: "events-private",
    data: JSON.stringify(
      { }),
    success: function(data) { 
      dispatcher.handleServerAction(
        { type: actionTypes.CREATE_EVENT_SUCCESS } );
      requestPrivateEventList();
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
  var url = "events-private/" + event_id;
  var eventData = eventDraftStore.validateEventDraft(event_id);
  var failureHandler = function(errorMessage) {
    dispatcher.handleServerAction({ 
      type: actionTypes.SAVE_EVENT_FAIL,
      errorMessage: errorMessage,
    });
  }

  if(!eventData) {
    failureHandler("Invalid event data; this is probably a bug.");
  } else {
    $.ajax({ 
      type: "POST",
      url: url,
      data: JSON.stringify(eventData),
      dataType: "json",
      success: function() { 
        dispatcher.handleServerAction({ 
          type: actionTypes.SAVE_EVENT_SUCCESS,
          event_id: event_id,
        });
      },
      error: failureHandler.bind(null, "Saving to server failed."),
      contentType: "application/json; charset=utf-8"
    });
  }
}

function deleteEvent (event_id) {
  var url = "events-private/" + event_id;
  var eventData = privateEventStore.getEvent(event_id);
  $.ajax({ 
    type: "DELETE",
    url: url,
    data: JSON.stringify(eventData),
    dataType: "json",
    success: function() { 
      dispatcher.handleServerAction({ 
        type: actionTypes.DELETE_EVENT_SUCCESS,
        event_id: event_id,
      });
    },
    error: function() { 
      dispatcher.handleServerAction({ 
        type: actionTypes.DELETE_EVENT_FAIL });
    },
    contentType: "application/json; charset=utf-8"
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


function moveQuestion(opts) {
  opts.type = actionTypes.MOVE_REGISTRATION_FORM_QUESTION;
  dispatcher.handleViewAction(opts);
}


function deleteQuestion(opts) {
  opts.type = actionTypes.DELETE_REGISTRATION_FORM_QUESTION;
  dispatcher.handleViewAction(opts);
}

module.exports = {
  requestPublicEventList: requestPublicEventList,
  requestPrivateEventList: requestPrivateEventList,
  requestEventDetails: requestEventDetails,
  createEvent: createEvent,
  updateEventProperty: updateEventProperty,
  saveEvent: saveEvent,
  deleteEvent: deleteEvent,
  addQuestion: addQuestion,
  moveQuestion: moveQuestion,
  updateQuestionProperty: updateQuestionProperty,
  deleteQuestion: deleteQuestion,
}
