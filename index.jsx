/** @jsx React.DOM */
var React = require('react');
var $ = require('jquery');
var pkg = require('./package.json');

var EditableForm = require('./editableform.jsx');

var Router = require('react-router');
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var Routes = Router.Routes;
var Link = Router.Link;


var EventList = React.createClass({
  getInitialState : function() {
    return { events : [] };
  },
  
  componentDidMount : function() {
    this.fetchEvents();
  },
  
  fetchEvents : function() {
    $.ajax({ 
      type : "GET",
      url : "events",
      success : function(data) { 
        console.log(data);
        this.setState( {events : data} );
      }.bind(this),
      error : function(data, textStatus) { 
        console.log(data);
        console.log(textStatus);
        //this.setState({ error : "Invalid user name or password."});
      }.bind(this),
      dataType : "json"
    });
  },

  render : function() {
    var eventTitles = this.state.events.map(function(event) {
      return ( <li> {event.title} </li> );
    });
    return ( 
      <div>
        <h1>Events</h1>
        <ul>{eventTitles}</ul> 
        <button>Create new</button>
      </div>);
  }
});

var App = React.createClass({
  render : function() {
    return (
      <div>
        <header>
          <ul>
            <li> <Link to="events">List of events </Link> </li>
            <li> <Link to="formeditor">Form editor </Link> </li>
          </ul>
        </header>

        <this.props.activeRouteHandler/>
      </div>
    );
  }
});

var routes = (
  <Routes location="hash">
    <Route name="eventlist" path="/" handler={EventList}>
      <Route name="new" handler={EditableForm}/>
      <DefaultRoute handler={EventList}/>
      </Route>
  </Routes>
);

var AppWithLogin = React.createClass({
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
<AppWithLogin/>
, document.body);
