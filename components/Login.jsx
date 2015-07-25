var Router = require('react-router');
var React = require('react');

var Bootstrap = require('react-bootstrap');

var AuthStore = require('../stores/AuthStore.js');
var AuthActions = require('../actions/AuthActions.js');

var Login = React.createClass({
  mixins: [Router.Navigation], 

  getInitialState: function() {
    return { 
             username : "", 
             password : "",
             error : null };
  },
  
  login: function() {
    AuthActions.login(this.state.username, this.state.password);
  },
  
  componentDidMount: function() {
    AuthStore.listen(this._onChange);
    this._onChange();
  },

  componentWillUnmount: function() {
    AuthStore.unlisten(this._onChange);
  },

  _onChange : function() {
    if(AuthStore.getState().userIsAuthenticated) {
      this.transitionTo('/admin/events');
    }
  },
  
  updateUsername: function(event) {
    this.setState({username : event.target.value});
  },

  updatePassword: function(event) {
    this.setState({password : event.target.value});
  },

  preventDefault: function(event) {
    event.preventDefault();
  },

  render : function() {
    var errorMessage = null;
    if(this.state.error) {
      errorMessage = <p className="error-message">{this.state.error}</p>;
    }
    
    return (
      <div>
        <h1>Abhimata</h1>
        <form onSubmit={this.preventDefault}>
          {errorMessage}
          <Bootstrap.Input type="text"
                           placeholder="Username" 
                           value={this.state.username}
                           onChange={this.updateUsername}/>
          <Bootstrap.Input type="password"
                           placeholder="Password" 
                           value={this.state.password}
                           onChange={this.updatePassword}/>
          <Bootstrap.Button type="submit"
                            bsStyle="primary"
                            onClick={this.login}>
            Log in
          </Bootstrap.Button> 
        </form> 
      </div>
    );
    
  }
});

module.exports = Login;
