var _ = require('lodash');
var alt = require('../alt.js');

var EventActions = require('../actions/EventActions.js');

//Event data that requires logging in as an admin.
var _events = {};

function PrivateEventStore () {
  this.bindActions(EventActions);

  this.exportPublicMethods({
    getEvents: function() {
      return _events;
    },

    getEvent: function(event_id) {
      return _events[event_id];
    },
  });
}

PrivateEventStore.prototype.onDeleteEventSucceeded = function(payload) {
  delete _events[payload.event_id];
};

PrivateEventStore.prototype.onRequestPrivateEventListSucceeded = function(payload) {
  _events = {};

  _.each(payload.events, function(event) {
    _events[event.event_id] = event;
  });
};

PrivateEventStore.prototype.onRequestEventDetailsSucceeded = function(payload) {
  _events[payload.event.event_id] = payload.event;
};

module.exports = alt.createStore(PrivateEventStore, 'PrivateEventStore');
