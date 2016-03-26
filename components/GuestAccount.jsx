var React = require('react');

var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var Link = Router.Link;

var Bootstrap = require('react-bootstrap');

var RRBootstrap = require('react-router-bootstrap');

var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.js');
var EventActions = require('../actions/EventActions.js');

var Loading = require('./Loading.jsx');

module.exports = React.createClass({
  render: function () {
    if (!this.props.event) {
      return (<Loading/>);
    }

    var password1 = this.props.event.uiState.guestAccountSettings.password1;
    var password2 = this.props.event.uiState.guestAccountSettings.password2;

    return (
      <div>
        <h2>Guest account <span className={this.getGuestAccountStatusColor()}>{this.getGuestAccountStatus()}</span></h2>

        <p>{this.getDescription()}</p>

        <p>Username: {this.getGuestUserName()}</p>

        <form>
          <Bootstrap.Input type="password"
                           label="New password"
                           value={password1}
                           onChange={this._onChange.bind(this, "guestAccountSettings.password1")}/>
          <Bootstrap.Input type="password"
                           label="New password again"
                           value={password2}
                           onChange={this._onChange.bind(this, "guestAccountSettings.password2")}/>
          <Bootstrap.Button onClick={this.resetPassword}
                            bsStyle='primary'
                            disabled={!this.isPasswordValid(password1, password2)}>
            Reset password
          </Bootstrap.Button>
        </form>
      </div>
    );
  },

  _onChange: function (propertyName, event) {
    EventActions.updateUiStateProperty({
      event_id: this.props.event.event_id,
      property: propertyName,
      value: event.target.value
    });
  },

  resetPassword: function () {
    console.log("Reset password. " + this.props.event.uiState.guestAccountSettings.password1);
    console.log("Reset password. " + this.props.event.uiState.guestAccountSettings.password2);
  },

  isPasswordValid(password1, password2) {
    return (password1.length > 0) && (password1 === password2);
  },

  getGuestAccountStatus() {
    return "Enabled";
    //return this.props.event.guestAccountEnabled ? "Enabled" : "Disabled";
  },

  getGuestAccountStatusColor() {
    return "guest-account-enabled";
    //return this.props.event.guestAccountEnabled ? "guest-account-enabled" : "guest-account-disabled";
  },

  getDescription() {
    return "To grant someone read-only access to this event, give them the guest username and password. " +
      "They will be able to read but not modify event settings and participant information.";

    /*if (!this.props.event.isGuestAccountPasswordSet) {
      return "To enable guest account, set a password.";
    }
    else if (!this.props.event.guestAccountEnabled) {
      return "Guest account is currently disabled. To enable guest account, click the button below.";
    }
    else {
      return "To grant someone read-only access to this event, give them the guest username and password. " +
        "They will be able to read but not modify event settings and participant information.";
    }*/
  },

  getGuestUserName() {
    return "guest12345";
    // return this.props.event.guestUserName;
  }

});