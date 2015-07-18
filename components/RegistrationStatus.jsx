var React = require('react');
var Router = require('react-router');
var _ = require('lodash');

var RegistrationStatusStore = require('../stores/RegistrationStatusStore.js');
var itemStatus = require('../constants/constants.js').itemStatus;
var Loading = require('./Loading.jsx');
var RegistrationActions = require('../actions/RegistrationActions.js');

var STATUSES = {
  applicationScreened: {
    showIf: 'applications_need_screening',
    done: 'We have read and approved your application.',
    pending: 'We have not read your application yet.',
  },

  registrationFeePaid: {
    showIf: 'has_registration_fee',
    done: 'You have paid the registration fee',
    pending: 'You have not paid the registration fee (or your payment has not been processed yet).',
  },

  depositPaid: {
    showIf: 'has_deposit',
    done: 'You have paid the deposit.',
    pending: 'You have not paid the deposit (or your payment has not been processed yet). Note that we will not reserve a place in the event for you until you have paid the deposit.',
  },
};

function renderStatuses(statusData) {
  console.log(statusData);
  var statusItems = _.map(statusData, function(statusIsOk, status) {
    var statusConfig = STATUSES[status];
    if(!statusConfig || !statusData.event[statusConfig.showIf]) {
      return null;
    }

    var statusText = statusIsOk ? statusConfig.done : statusConfig.pending;
    return (
      <li key={status}>
        {statusText}
      </li>
    );
  });

  return (
    <ul>
      {statusItems}
    </ul>
  );
}
  

var RegistrationStatus = React.createClass({
  mixins: [ Router.State ],
  
  getInitialState: function() {
    return {
       status: RegistrationStatusStore.getStatus(this.getParams().uuid)
    };
  },

  updateStatus: function() {
    this.setState({
       status: RegistrationStatusStore.getStatus(this.getParams().uuid)
    });
  },

  requestCancellationEmail: function() {
    RegistrationActions.requestCancellationEmail(this.getParams().uuid);
  },

  componentWillMount: function() {
    RegistrationStatusStore.listen(this.updateStatus);
    RegistrationActions.getRegistrationStatus(this.getParams().uuid);
  },

  componentDidUnmount: function() {
    RegistrationStatusStore.unlisten(this.updateStatus);
  },

  render: function() {
    if(this.state.status === itemStatus.LOADING) {
      return (<Loading/>);
    }

    if(this.state.status === itemStatus.NOT_AVAILABLE) {
      return (
        <p className="error"> No registration corresponding to the code 
          {" " + this.getParams().uuid} was found. Either the code is invalid or
          there was a problem with the server. Please try again
          later or contact the event managers. </p>
      );
    }

    var eventTitle = (
      <em>{this.state.status.event.title}</em>
    );
    
    var intro;
    if(this.state.status.onWaitingList) {
      intro = (
        <p>
          The event {eventTitle} is fully booked, but you are on the waiting list. If a place becomes available, we will send you an email.
        </p>
      );
    } else {
      intro = (
        <p>
          You have registered for the event {eventTitle}.
        </p>
      );
    }

    return (
      <div>
        <h1>The status of your application</h1>
        {intro}
        {renderStatuses(this.state.status)}

        <h2>Cancelling your registration</h2>
        <p>If you cannot participate in the event, you can cancel your application by clicking on the button below. An email will be sent to the email address you used to register with a link that you can use to cancel your application.</p>
        <button onClick={this.requestCancellationEmail}>
          Email cancellation link
        </button>
      </div>
    );
  }
});

module.exports = RegistrationStatus;
