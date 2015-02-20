var React = require('react');
var Router = require('react-router');

var verificationStore = require('../stores/emailVerificationStore.js');
var itemStatus = require('../constants/constants.js').itemStatus;
var Loading = require('./Loading.jsx');
var registrationActionCreators = require('../actions/registrationActionCreators.js');

var EmailVerification = React.createClass({
  mixins: [ Router.State ],
  
  getInitialState: function() {
    return {
      info: verificationStore.getInfo(this.getParams().uuid)
    };
  },

  updateInfo: function() {
    this.setState({
      info: verificationStore.getInfo(this.getParams().uuid)
    });
  },

  componentWillMount: function() {
    verificationStore.addChangeListener(this.updateInfo);
    registrationActionCreators.verifyEmail(this.getParams().uuid);
  },

  componentDidUnmount: function() {
    verificationStore.removeChangeListener(this.updateInfo);
  },

  render: function() {
    if(this.state.info === itemStatus.LOADING) {
      return (<Loading/>);
    }

    if(this.state.info === itemStatus.NOT_AVAILABLE) {
      return (
        <p className="error"> No unverified email corresponding to the code 
          {" " + this.getParams().uuid} found. Either you have already
          validated your email using this code, or the code is invalid, or
          there was a problem with the server. Please try again
          later or contact the event managers. </p>
      );
    }

    if(this.state.info.emailIsVerified) {
      return(
        <p>Your email address has been successfully verified.</p>
      );
    } else {
      return(
        <p className="error">{this.state.info.error}</p>
      );
    }
  }
});

module.exports = EmailVerification;
