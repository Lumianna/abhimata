/** @jsx React.DOM */
var React = require('react');
var $ = require('jquery');
var pkg = require('./package.json');

var events = require('events');

//react-router
var Router = require('react-router');
var Route = Router.Route;
var Redirect = Router.Redirect;
var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var RouteHandler = Router.RouteHandler;

//my modules
require('./main.less');
var authActions = require('./actions/authActionCreators.js');
var EditableForm = require('./components/EditableForm.jsx');
var EventRegistration = require('./components/EventRegistration.jsx');
var EventParticipants = require('./components/EventParticipants.jsx');
var es = require('./components/EventSettings.jsx');
var AdminEventList = require('./components/AdminEventList.jsx');
var Cancellation = require('./components/Cancellation.jsx');
var EmailVerification = require('./components/EmailVerification.jsx');
var UserEventList = require('./components/UserEventList.jsx');
var Login = require('./components/Login.jsx');
var Admin = require('./components/Admin.jsx');

var App = React.createClass({
  render: function() {
    return (
      <RouteHandler/>
    );
  }
});

var routes = (
  <Route name="app" handler={App}>
    <Route path="/" handler={UserEventList}/>
    <Route name="event-registration" path="/register/:eventId" handler={EventRegistration}/>
    <Route name="cancellation" path="/cancel/:uuid" handler={Cancellation}/>
    <Route name="verification" path="/verify-email/:uuid"
           handler={EmailVerification}/>
    <Route path="/admin" handler={Admin}>
      <Route name="admin-login" path="login" handler={Login}/>
      <Route path="events" handler={AdminEventList}/>
      <Route name="event" path="events/:eventId" handler={es.EventSettings}>
        <DefaultRoute handler={es.EventGeneral}/>
        <Route name="general" handler={es.EventGeneral}/>
        <Route name="registrationform" handler={es.RegistrationForm}/>
        <Route name="participants" handler={es.EventParticipants}/>
        <Route name="delete" handler={es.DeleteData}/>
      </Route>
      <Redirect to="/admin/events"/>
    </Route>
  </Route>
);

authActions.testAuth();

Router.run(routes, function(Handler) {
  React.render(<Handler/>, document.body);
});
