var Router = require('react-router');
var React = require('react');

var authStore = require('../stores/authStore.js');
var authActions = require('../actions/authActionCreators.js');

var Login = React.createClass({
  mixins : [Router.Transitions],

  getInitialState : function() {
    return { 
             username : "", 
             password : "",
             error : null };
  },
  
  login : function() {
    authActions.login(this.state.username, this.state.password);
  },
  
  componentDidMount : function() {
    authStore.addChangeListener(this._onChange);
    this._onChange();
  },

  componentWillUnmount : function() {
    authStore.removeChangeListener(this._onChange);
  },

  _onChange : function() {
    if(authStore.userIsAuthenticated()) {
      this.transitionTo('/events');
    }
  },
  
  updateUsername : function(event) {
    this.setState({username : event.target.value});
  },

  updatePassword : function(event) {
    this.setState({password : event.target.value});
  },

  render : function() {
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
});

module.exports = Login;
