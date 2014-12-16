var React = require('react');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var authStore = require('../stores/authStore.js');

// A top-level component for the admin interface; it exists only to
// initiate a transition to the login screen if the admin's login expires
// at some point. In react-router 0.8-0.10, transitions can only be initiated
// cleanly from components.

var Admin = React.createClass({
  mixins: [Router.Navigation], 
  
  _onAuthChange: function() {
    if(!authStore.userIsAuthenticated()) {
      this.transitionTo('/admin/login');
    }
  },
  
  componentDidMount: function() {
    authStore.addChangeListener(this._onAuthChange);
  },

  componentWillUnmount: function() {
    authStore.removeChangeListener(this._onAuthChange);
  },

  render: function() {
    return (<RouteHandler/>);
  }
});

module.exports = Admin;
