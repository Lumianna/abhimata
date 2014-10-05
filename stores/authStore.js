var actionTypes = require('../constants/constants.js').actionTypes;
var createStore = require('../utils/createStore.js');

var CHANGE_EVENT = 'change';

var isAuthenticated = false;

function handleActions (payload) {
  switch(payload.action.type) {
    case actionTypes.REQUEST_LOGIN_SUCCESS:
      isAuthenticated = true;
      authStore.emitChange();
      break;
    case actionTypes.REQUEST_LOGIN_FAIL:
      isAuthenticated = false;
      authStore.emitChange();
      break;
    case actionTypes.AUTHENTICATION_FAILED:
      isAuthenticated = false;
      authStore.emitChange();
      break;
  }
} 

var authStore = createStore(handleActions, {
  userIsAuthenticated : function() {
    console.log(isAuthenticated);
    return isAuthenticated;
  }
});


module.exports = authStore;
