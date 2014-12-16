var EventEmitter = require('events').EventEmitter;
var dispatcher = require('../dispatcher/dispatcher.js');
var _ = require('lodash');

var CHANGE_EVENT = 'change';

var skeleton = _.extend({}, EventEmitter.prototype, {
  addChangeListener : function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  removeChangeListener : function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  },
  
  emitChange : function(params) {
    if(params) {
      this.emit(CHANGE_EVENT, params);
    } else {
      this.emit(CHANGE_EVENT);
    }
  },
});


var createStore = function (actionHandler, properties) {
  var store = _.extend({}, skeleton, properties);
  
  store.dispatchToken = dispatcher.register(actionHandler);
  return store;
};

 
module.exports = createStore;
