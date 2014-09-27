/** @jsx React.DOM */
var React = require('react');
var $ = require('jquery');
var pkg = require('./package.json');

//react-router
var Router = require('react-router');
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var Routes = Router.Routes;
var Link = Router.Link;

//my modules
var EditableForm = require('./editableform.jsx');
var EventSettings = require('./eventsettings.jsx');
var EventList = require('./eventlist.jsx');


var routes = (
  <Routes location="hash">
    <DefaultRoute handler={EventList}/>
    <Route name="eventlist" path="/events" handler={EventList}/>
    <Route name="event" path="/events/:eventId" handler={EventSettings}/>
  </Routes>
);


var App = React.createClass({
  getInitialState : function() {
    return { userIsAuthenticated : false, 
             username : "", 
             password : "",
             error : null };
  },
  
  login : function() {
    $.ajax({ 
      type : "POST",
      url : "login",
      data : JSON.stringify(
        { username : this.state.username,
          password : this.state.password }),
      success : function(data) { 
        this.setState( {userIsAuthenticated : true, 
                        error : null});
      }.bind(this),
      error : function(data, textStatus) { 
        this.setState({ error : "Invalid user name or password."});
      }.bind(this),
      contentType : "application/json; charset=utf-8"
    });
    this.setState({password : ""});
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
