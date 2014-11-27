var EventEmitter = require('events').EventEmitter;
var dispatcher = require('../dispatcher/dispatcher.js');
var merge = require('react/lib/merge');

var CHANGE_EVENT = 'change';

var skeleton = merge(EventEmitter.prototype, {
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
  var store = merge(skeleton, properties);
  
  store.dispatchToken = dispatcher.register(actionHandler);
  return store;
};

 
module.exports = createStore;
