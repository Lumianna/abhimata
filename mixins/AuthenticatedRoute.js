var authActions = require('../actions/authActionCreators.js');
var authStore = require('../stores/authStore.js');

var AuthenticatedRoute = {
  statics: {
    willTransitionTo: function (transition) {
      if (!authStore.userIsAuthenticated()) {
        transition.redirect('/login');
      }
    }
  }
};


module.exports = AuthenticatedRoute;
