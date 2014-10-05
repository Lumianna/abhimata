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
var EditableForm = require('./components/editableform.jsx');
var es = require('./components/eventsettings.jsx');
var EventList = require('./components/eventlist.jsx');
var Login = require('./components/Login.jsx');


var routes = (
  <Routes location="hash">
    <Route path="/login" handler={Login}/>
    <Route path="/events" handler={EventList}/>
    <Route name="event" path="/events/:eventId" handler={es.EventSettings}>
      <DefaultRoute handler={es.EventGeneral}/>
      <Route name="general" path="general" handler={es.EventGeneral}/>
      {/*<Route name="signupform" path="signupform" handler={es.SignUpForm}/>*/}
    </Route>
    <Redirect to="/events"/>
  </Routes>
);


React.renderComponent(
  routes
, document.body);
