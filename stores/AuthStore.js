var alt = require('../alt.js');
var AuthActions = require('../actions/AuthActions.js');

function AuthStore() {
  this.bindAction(AuthActions.loginSucceeded, this.loginSucceeded);
  this.bindAction(AuthActions.loginFailed, this.loginFailed);
  this.bindAction(AuthActions.authenticationFailed, this.authenticationFailed);
  this.bindAction(AuthActions.loginExpired,
                  this.loginExpired);

  this.exportPublicMethods({
    isUserAuthenticated: function() {
      return this.userIsAuthenticated;
    }
  });

  this.userIsAuthenticated = true;
}

AuthStore.prototype.loginSucceeded = function() {
  this.userIsAuthenticated = true;
};

AuthStore.prototype.loginFailed = function() {
  this.userIsAuthenticated = false;
};

AuthStore.prototype.authenticationFailed = function() {
  this.userIsAuthenticated = false;
};

AuthStore.prototype.loginExpired = function() {
  this.userIsAuthenticated = false;
};

module.exports = alt.createStore(AuthStore, 'AuthStore');
