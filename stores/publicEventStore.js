var actionTypes = require('../constants/constants.js').actionTypes;
var itemStatus = require('../constants/constants.js').itemStatus;
var createStore = require('../utils/createStore.js');
var _ = require('lodash');


//Event data that can be obtained without authenticating.
var _events = {};

var actionHandler = function(payload) {
  var act = payload.action;

  switch(act.type) {
    case actionTypes.DELETE_EVENT_SUCCESS:
      delete _events[act.event_id];
      publicEventStore.emitChange(act.event_id);
      break;

    case actionTypes.REQUEST_PUBLIC_EVENT_LIST_SUCCESS:
      _events = {};
      _.each(act.events, function(event) {
        _events[event.event_id] = event;
      });

      publicEventStore.emitChange();
      break;

    case actionTypes.REQUEST_PUBLIC_EVENT_SUCCESS:
      _events[act.event.event_id] = act.event;
      publicEventStore.emitChange();
      break;

    case actionTypes.REQUEST_PUBLIC_EVENT_FAIL:
      _events[act.event.event_id] = itemStatus.NOT_AVAILABLE;
      publicEventStore.emitChange();
      break;

    default:
      //do nothing
      break;
  }
};

var publicEventStore = createStore(actionHandler, {
  getEvents: function() {
    return _events;
  },

  getEvent: function(event_id) {
    if(!_events[event_id]) {
      return itemStatus.LOADING;
    }

    return _events[event_id];
  }
});

module.exports = publicEventStore;
