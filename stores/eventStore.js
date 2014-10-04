var actionTypes = require('../constants/constants.js').actionTypes;
var createStore = require('../utils/createStore.js');
var merge = require('react/lib/merge');


//Event data that can be obtained without authenticating.
var _eventsPublic = [];

//Event data that requires logging in as an admin.
var _eventsPrivate = [];

var actionHandler = function(payload) {
  switch(payload.action.type) {
  case actionTypes.REQUEST_EVENTS_PUBLIC_SUCCESS:
    _eventsPublic = payload.action.events;
    eventStore.emitChange();
    break;
  case actionTypes.REQUEST_EVENT_PRIVATE_SUCCESS:
    _eventsPrivate[payload.action.event.event_id] = payload.action.event;
    eventStore.emitChange();
    break;
  default:
    //do nothing
    break;
  }
};

var eventStore = createStore(actionHandler, {
  getEventsPublic : function() {
    return _eventsPublic;
  },

  getEvent : function(event_id) {
    return merge(_eventsPublic[event_id], 
                 _eventsPrivate[event_id]);
  },
});

module.exports = eventStore;
