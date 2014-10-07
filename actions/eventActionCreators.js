var dispatcher = require('../dispatcher/dispatcher.js');
var actionTypes = require('../constants/constants.js').actionTypes;
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

module.exports = {
  requestEventsPublic: requestEventsPublic,
  requestEventPrivate: requestEventPrivate,
  createEvent: createEvent,
}
