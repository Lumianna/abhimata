var actionTypes = require('../constants/constants.js').actionTypes;
var createStore = require('../utils/createStore.js');

var CHANGE_EVENT = 'change';

var actionHandler = function(payload) {
};

var isAuthenticated = false;

function handleActions (payload) {
  switch(payload.action.type) {
    case REQUEST_LOGIN_SUCCESS:
      isAuthenticated = true;
      authStore.emitChange();
    case REQUEST_LOGIN_FAIL:
      isAuthenticated = false;
      authStore.emitChange();
    case AUTHENTICATION_FAILED:
      isAuthenticated = false;
      authStore.emitChange();
  }
} 

var authStore = createStore(actionHandler, {
  getAuthStatus : function() {
    return isAuthenticated;
  }
});


module.exports = authStore;
