var actionTypes = require('../constants/constants.js').actionTypes;
var createStore = require('../utils/createStore.js');
var merge = require('react/lib/merge');


//Event data that can be obtained without authenticating.
var _eventsPublic = [];

//Event data that requires logging in as an admin.
var _eventsPrivate = [];

var actionHandler = function(payload) {
  var act = payload.action;
  switch(act.type) {
    case actionTypes.UPDATE_EVENT_PROPERTY:
      _eventsPrivate[act.event_id][act.property] = act.value;
      eventStore.emitChange(act.event_id);
      break;
    case actionTypes.REQUEST_EVENTS_PUBLIC_SUCCESS:
      _eventsPublic = payload.action.events;
      eventStore.emitChange();
      break;
    case actionTypes.REQUEST_EVENT_PRIVATE_SUCCESS:
      _eventsPrivate[payload.action.event.event_id] = payload.action.event;
      eventStore.emitChange(payload.action.event.event_id);
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

  getEventPrivate : function(event_id) {
    return merge(_eventsPublic[event_id], 
                 _eventsPrivate[event_id]);
  },
});

module.exports = eventStore;
