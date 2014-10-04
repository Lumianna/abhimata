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

var authActions = require('./actions/authActionCreators.js');
var authStore = require('./stores/authStore.js');


var routes = (
  <Routes location="hash">
    <Route path="/events" handler={EventList}/>
    <Route name="event" path="/events/:eventId" handler={es.EventSettings}>
      <DefaultRoute handler={es.EventGeneral}/>
      <Route name="general" path="general" handler={es.EventGeneral}/>
      {/*<Route name="signupform" path="signupform" handler={es.SignUpForm}/>*/}
    </Route>
    <Redirect to="/events"/>
  </Routes>
);


var App = React.createClass({
  getInitialState : function() {
    return { userIsAuthenticated : this.getAuthStatusFromStore(), 
             username : "", 
             password : "",
             error : null };
  },
  
  login : function() {
    authActions.login(this.state.username, this.state.password);
  },
  
  componentDidMount : function() {
    authStore.addChangeListener(this._onChange);
  },

  componentWillUnmount : function() {
    authStore.removeChangeListener(this._onChange);
  },

  _onChange : function() {
    this.setState(getAuthStatusFromStore());
  },
  
  getAuthStatusFromStore : function() {
    return {userIsAuthenticated : authStore.getAuthStatus()};
  },
  
  
  updateUsername : function(event) {
    this.setState({username : event.target.value});
  },

  updatePassword : function(event) {
    this.setState({password : event.target.value});
  },

  render : function() {
    if(this.state.userIsAuthenticated) {
      return routes;
    }
    else {
      var errorMessage = null;
      if(this.state.error) {
        errorMessage = <p className="error-message">{this.state.error}</p>
      }
        
      return (
      <form>
        {errorMessage}
        <input type="text" placeholder="Username" 
               value={this.state.username} onChange={this.updateUsername}/>
        <input type="password" placeholder="Password" 
               value={this.state.password} onChange={this.updatePassword}/>
        <button type="submit" onClick={this.login}>Log in</button> 
      </form> );
    }
  }
});
       

React.renderComponent(
<App/>
, document.body);
