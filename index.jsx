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


var RetreatList = React.createClass({
  render : function() {
    return ( <p>A list of retreats!</p> );
  }
});

var App = React.createClass({
  render : function() {
    return (
      <div>
        <header>
          <ul>
            <li> <Link to="retreats">List of retreats </Link> </li>
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
    <Route name="app" path="/" handler={App}>
      <Route name="retreats" handler={RetreatList}/>
      <Route name="formeditor" handler={EditableForm}/>
      <DefaultRoute handler={RetreatList}/>
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
