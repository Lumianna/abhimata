var React = require('react');
var Router = require('react-router');

var EmailVerificationStore = require('../stores/EmailVerificationStore.js');
var itemStatus = require('../constants/constants.js').itemStatus;
var Loading = require('./Loading.jsx');
var RegistrationActions = require('../actions/RegistrationActions.js');

var EmailVerification = React.createClass({
  mixins: [ Router.State ],
  
  getInitialState: function() {
    return {
      info: EmailVerificationStore.getInfo(this.getParams().uuid)
    };
  },

  updateInfo: function() {
    this.setState({
      info: EmailVerificationStore.getInfo(this.getParams().uuid)
    });
  },

  componentWillMount: function() {
    EmailVerificationStore.listen(this.updateInfo);
    RegistrationActions.verifyEmail(this.getParams().uuid);
  },

  componentDidUnmount: function() {
    EmailVerificationStore.unlisten(this.updateInfo);
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
