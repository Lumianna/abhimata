var AuthActions = require('../actions/AuthActions.js');
var authStore = require('../stores/authStore.js');
var Router = require('react-router');

var AuthenticatedRoute = {
  statics: {
    willTransitionTo: function (transition) {
      if (!authStore.getState().userIsAuthenticated) {
        transition.redirect('/admin/login');
      }
    }
  }
};


module.exports = AuthenticatedRoute;
