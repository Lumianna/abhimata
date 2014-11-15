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
var Routes = Router.Routes;
var Link = Router.Link;

//my modules
require('./main.less');
var EditableForm = require('./components/EditableForm.jsx');
var EventRegistration = require('./components/EventRegistration.jsx');
var es = require('./components/EventSettings.jsx');
var AdminEventList = require('./components/AdminEventList.jsx');
var UserEventList = require('./components/UserEventList.jsx');
var Login = require('./components/Login.jsx');
var Admin = require('./components/Admin.jsx');


var routes = (
  <Routes location="hash">
    <Route path="/" handler={UserEventList}/>
    <Route name="event-registration" path="/register/:eventId" handler={EventRegistration}/>
    <Route path="/admin" handler={Admin}>
      <Route name="admin-login" path="login" handler={Login}/>
      <Route path="events" handler={AdminEventList}/>
      <Route name="event" path="events/:eventId" handler={es.EventSettings}>
        <DefaultRoute handler={es.EventGeneral}/>
        <Route name="general" handler={es.EventGeneral}/>
        <Route name="registrationform" handler={es.RegistrationForm}/>
        <Route name="delete" handler={es.DeleteData}/>
      </Route>
      <Redirect to="/admin/events"/>
    </Route>
  </Routes>
);


React.renderComponent(
  routes
, document.body);
