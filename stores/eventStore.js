var EventEmitter = require('events').EventEmitter;
var dispatcher = require('dispatcher.js');
var merge = require('react/lib/merge');

var CHANGE_EVENT = 'change';

var _events = [];

var eventStore = merge(EventEmitter.prototype, {
  addChangeListener : function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener : function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },
};
  
