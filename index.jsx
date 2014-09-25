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
  
  createNewEvent : function() {
    $.ajax({ 
      type : "POST",
      url : "events",
      data : JSON.stringify(
        { }),
      success : function(data) { 
        this.fetchEvents();
      }.bind(this),
      error : function(data, textStatus) { 
        this.setState({ error : "Could not access database."});
      }.bind(this),
      contentType : "application/json; charset=utf-8"
    });
  },

  render : function() {
    var eventTitles = this.state.events.map(function(event) {
      return ( 
        <li> 
          <Link to="event" 
                params={{eventId : event.event_id}}> 
          {event.title} 
          </Link> 
        </li> );
    });

    return ( 
      <div>
        <h1>Events</h1>
        <ul>{eventTitles}</ul> 
        <button onClick={this.createNewEvent}>Create new event</button>
      </div>);
  }
});

var EventSettings = React.createClass({
  getInitialState : function() {
    return {
      title : "",
      signup_form : [],
    };
  },
  
  componentDidMount : function() {
    var url = "events/" + this.props.params.eventId;
    $.ajax({ 
      type : "GET",
      url : url,
      success : function(data) { 
        this.setState( data );
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
    return (<h1>{this.state.title}</h1>);
  }
});


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
