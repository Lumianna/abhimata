var itemStatus = require('../constants/constants.js').itemStatus;
var _ = require('lodash');
var EventActions = require('../actions/EventActions.js');
var alt = require('../alt.js');

//Event data that can be obtained without authenticating.
var _events = {};

function PublicEventStore() {
  this.bindActions(EventActions);

  this.exportPublicMethods({
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
}

PublicEventStore.prototype.onDeleteEventSucceeded = function(payload) {
  delete _events[payload.event_id];
};

PublicEventStore.prototype.onRequestPublicEventListSucceeded = function(payload) {
  _events = {};
  _.each(payload.events, function(event) {
    _events[event.event_id] = event;
  });
};

PublicEventStore.prototype.onRequestPublicEventSucceeded = function(
  payload) {
    _events[payload.event.event_id] = payload.event;
};

PublicEventStore.prototype.onRequestPublicEventFailed = function(payload) {
  _events[payload.event.event_id] = itemStatus.NOT_AVAILABLE;
};


module.exports = alt.createStore(PublicEventStore, 'PublicEventStore');
