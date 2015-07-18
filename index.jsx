/** @jsx React.DOM */
var React = require('react');

var alt = require('./alt.js');

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
var AuthActions = require('./actions/AuthActions.js');
var EditableForm = require('./components/EditableForm.jsx');
var EventRegistration = require('./components/EventRegistration.jsx');
var EventParticipants = require('./components/EventParticipants.jsx');
var es = require('./components/EventSettings.jsx');
var SubmittedForm = require('./components/SubmittedForm.jsx');
var AdminEventList = require('./components/AdminEventList.jsx');
var Cancellation = require('./components/Cancellation.jsx');
var RegistrationStatus = require('./components/RegistrationStatus.jsx');
var UserEventList = require('./components/UserEventList.jsx');
var Login = require('./components/Login.jsx');
var Admin = require('./components/Admin.jsx');

var App = React.createClass({
  render: function() {
    return (
      <div className="abhimata-container">
        <RouteHandler/>
      </div>
    );
  }
});

var routes = (
  <Route name="app" handler={App}>
    <Route path="/" handler={UserEventList}/>
    <Route name="event-registration" path="/register/:eventId" handler={EventRegistration}/>
    <Route name="cancellation" path="/cancel/:uuid" handler={Cancellation}/>
    <Route name="verification" path="/registration-status/:uuid"
           handler={RegistrationStatus}/>
    <Route path="/admin" handler={Admin}>
      <Route name="admin-login" path="login" handler={Login}/>
      <Route path="events" handler={AdminEventList}/>
      <Route name="event" path="events/:eventId" handler={es.EventSettings}>
        <DefaultRoute handler={es.EventGeneral}/>
        <Route name="general" handler={es.EventGeneral}/>
        <Route name="registrationform" handler={es.RegistrationForm}/>
        <Route name="participants" handler={es.EventParticipants}/>
        <Route name="participant-details"
               path="participant-details/:registrationId"
               handler={SubmittedForm}/>
        <Route name="delete" handler={es.DeleteData}/>
      </Route>
      <Redirect to="/admin/events"/>
    </Route>
  </Route>
);

AuthActions.testAuth();

Router.run(routes, function(Handler) {
  React.render(<Handler/>, document.body);
});
