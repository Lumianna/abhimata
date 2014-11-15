var actionTypes = require('../constants/constants.js').actionTypes;
var createStore = require('../utils/createStore.js');
var merge = require('react/lib/merge');
var _ = require('lodash');


//Event data that can be obtained without authenticating.
var _events = [];


var actionHandler = function(payload) {
  var act = payload.action;

  switch(act.type) {
    case actionTypes.DELETE_EVENT_SUCCESS:
      delete _events[act.event_id];
      eventStore.emitChange(act.event_id);
      break;

    case actionTypes.REQUEST_PUBLIC_EVENT_LIST_SUCCESS:
      _events = act.events;
      eventStore.emitChange();
      break;

    default:
      //do nothing
      break;
  }
};

var eventStore = createStore(actionHandler, {
  getEvents: function() {
    return _events;
  },
});

module.exports = eventStore;
