var alt = require('../alt.js');
var $ = require('jquery');

function ExportActions() {
  this.generateActions(
    'setQuestions'
  );
}
  
ExportActions.prototype.login = function (username, password) {
  this.dispatch();
  var that = this;
  $.ajax({ 
    type: "POST",
    url: "login",
    data: JSON.stringify(
      { username: username,
        password: password }),
    success: function() { 
      that.actions.loginSucceeded();
    },
    error: function(info) { 
      that.actions.loginFailed(info.status);
    },
    contentType: "application/json; charset=utf-8"
  });
};

ExportActions.prototype.logout = function () {
  this.dispatch();
  var that = this;
  $.ajax({ 
    type: "GET",
    url: "logout",
    success: function() { 
      that.actions.loginExpired();
    },
    error: function() { 
    },
    contentType: "application/json; charset=utf-8"
  });
};
  
// See whether we have valid authentication credentials;
// this is useful for avoiding needing to log in after a 
// full page reload
ExportActions.prototype.testAuth = function () {
  this.dispatch();
  var that = this;
  $.ajax({ 
    type: "GET",
    url: "secret",
    success: function() { 
      that.actions.loginSucceeded();
    },
    error: function() {
      that.actions.loginExpired();
    },
  });
};
  
module.exports = alt.createActions(ExportActions);

