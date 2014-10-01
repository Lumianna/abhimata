var EventEmitter = require('events').EventEmitter;
var dispatcher = require('../dispatcher/dispatcher.js');
var merge = require('react/lib/merge');
var actionTypes = require('../constants/constants.js').actionTypes;

var CHANGE_EVENT = 'change';

//Event data that can be obtained without authenticating.
var _eventsPublic = [];

//Event data that requires logging in as an admin.
var _eventsPrivate = [];

var eventStore = merge(EventEmitter.prototype, {
  addChangeListener : function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener : function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },
  
  emitChange : function() {
    this.emit(CHANGE_EVENT);
  },
  
  getEventsPublic : function() {
    return _eventsPublic;
  },

  getEvent : function(event_id) {
    return merge(_eventsPublic[event_id], 
                 _eventsPrivate[event_id]);
  }
  
});
                       
eventStore.dispatchToken = dispatcher.register(function(payload) {
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
});

module.exports = eventStore;
