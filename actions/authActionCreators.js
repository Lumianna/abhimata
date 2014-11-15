var actionTypes = require('../constants/constants.js').actionTypes;
var dispatcher = require('../dispatcher/dispatcher.js');
var $ = require('jquery');

module.exports = {
  
  login: function(username, password) {
    dispatcher.handleViewAction({ type: actionTypes.REQUEST_LOGIN });
    $.ajax({ 
      type: "POST",
      url: "login",
      data: JSON.stringify(
        { username: username,
          password: password }),
      success: function() { 
        dispatcher.handleServerAction({ 
          type: actionTypes.REQUEST_LOGIN_SUCCESS });
      },
      error: function() { 
        dispatcher.handleServerAction({ 
          type: actionTypes.REQUEST_LOGIN_FAIL });
      },
      contentType: "application/json; charset=utf-8"
    });
  },
  
  // See whether we have valid authentication credentials;
  // this is useful for avoiding needing to log in after a 
  // full page reload
  testAuth: function() {
    $.ajax({ 
      type: "GET",
      url: "secret",
      success: function() { 
        dispatcher.handleServerAction({ 
          type: actionTypes.REQUEST_LOGIN_SUCCESS });
      },
    });
  },
  
  loginExpired: function() {
    dispatcher.handleServerAction(
        { type: actionTypes.LOGIN_EXPIRED });
  }  

};
