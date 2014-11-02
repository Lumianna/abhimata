var authActions = require('../actions/authActionCreators.js');
var authStore = require('../stores/authStore.js');
var Router = require('react-router');

var AuthenticatedRoute = {
  statics: {
    willTransitionTo: function (transition) {
      if (!authStore.userIsAuthenticated()) {
        transition.redirect('/admin/login');
      }
    }
  }
};


module.exports = AuthenticatedRoute;
