/** @jsx React.DOM */
var React = require('react');
var pkg = require('./package.json');

var EditableForm = require('./editableform.jsx');

var Router = require('react-router');
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var Routes = Router.Routes;
var Link = Router.Link;

var appState = require('./appState.js');


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
    return { userIsAuthenticated : false };
  },
  
  login : function() {
    this.setState( { userIsAuthenticated : true });
  },

  render : function() {
    if(this.state.userIsAuthenticated) {
      return routes;
    }
    else {
      return <button onClick={this.login}> LOGIN </button>
    }
  }
});
       

React.renderComponent(
<AppWithLogin userIsAuthenticated={appState.userIsAuthenticated()} 
              login={appState.login}/>
, document.body);
