var dispatcher = require('../dispatcher/dispatcher.js');
var actionTypes = require('../constants/constants.js').actionTypes;
var $ = require('jquery');

module.exports = {
  requestEventsPublic : function() {
    dispatcher.handleViewAction({type : actionTypes.REQUEST_EVENTS_PUBLIC});
    $.ajax({ 
      type : "GET",
      url : "events",
      success : function(data) { 
        dispatcher.handleServerAction(
          { type : actionTypes.REQUEST_EVENTS_PUBLIC_SUCCESS,
            events : data });
      },
      error : function(data, textStatus) { 
        dispatcher.handleServerAction(
          { type : actionTypes.REQUEST_EVENTS_PUBLIC_FAILURE,
            errorData : data,
            statusCode : textStatus });
      },
      dataType : "json"
    });
  },
}
