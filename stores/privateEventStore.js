var actionTypes = require('../constants/constants.js').actionTypes;
var createStore = require('../utils/createStore.js');
var merge = require('react/lib/merge');
var _ = require('lodash');

//Event data that requires logging in as an admin.
var _events = {};

var actionHandler = function(payload) {
  var act = payload.action;
  switch(act.type) {
    case actionTypes.DELETE_EVENT_SUCCESS:
      delete _events[act.event_id];
      privateEventStore.emitChange(act.event_id);
      break;

    case actionTypes.REQUEST_PRIVATE_EVENT_LIST_SUCCESS:
      _events = {};
      _.each(act.events, function(event) {
        _events[event.event_id] = event;
      });
      privateEventStore.emitChange();
      break;

    case actionTypes.REQUEST_EVENT_DETAILS_SUCCESS:
      _events[act.event.event_id] = act.event;
      privateEventStore.emitChange(act.event.event_id);
      break;
    default:
      //do nothing
      break;
  }
};

var privateEventStore = createStore(actionHandler, {
  getEvents: function() {
    return _events;
  },

  getEvent: function(event_id) {
    return _events[event_id];
  },
});

module.exports = privateEventStore;
