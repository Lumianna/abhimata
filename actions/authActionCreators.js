var dispatcher = require('../dispatcher/dispatcher.js');
var actionTypes = require('../constants/constants.js').actionTypes;
var $ = require('jquery');

module.exports = {
  
  login : function(username, password) {
    dispatcher.handleViewAction({ type : actionTypes.REQUEST_LOGIN });
    $.ajax({ 
      type : "POST",
      url : "login",
      data : JSON.stringify(
        { username : username,
          password : password }),
      success : function() { 
        dispatcher.handleServerAction({ 
          type : actionTypes.REQUEST_LOGIN_SUCCESS });
      },
      error : function() { 
        dispatcher.handleServerAction({ 
          type : actionTypes.REQUEST_LOGIN_FAILURE });
      },
      contentType : "application/json; charset=utf-8"
    });
  },

};
