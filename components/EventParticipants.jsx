var _ = require('lodash');
var moment = require('moment');
var React = require('react');

var Router = require('react-router');
var Link = Router.Link;

var Bootstrap = require('react-bootstrap');

var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.js');
var RegistrationActions = require('../actions/RegistrationActions.js');

var ParticipantDraftStore = require('../stores/ParticipantDraftStore.js');
var ParticipantDraftActions = require('../actions/ParticipantDraftActions.js');

var ParticipantDetails = require('./ParticipantDetails.jsx');

var statuses = {
  "application_screened": {
    eventProp: "applications_need_screening",
    text: "Application screened",
  },
  "deposit_paid": {
    eventProp: "has_deposit",
    text: "Deposit paid",
  },
  "registration_fee_paid": {
    eventProp: "has_registration_fee",
    text: "Full fee paid",
  },
};

function getRelevantStatuses(event) {
  return _.pick(statuses, function(status) {
    return event[status.eventProp];
  });
}

var ParticipantModal = React.createClass({
  saveAndClose: function() {
    this.props.saveChanges();
    this.props.closeModal();
  },
  render: function() {
    if(!this.props.participant) {
      return null;
    }
    return (
      <Bootstrap.Modal show={this.props.visible} onHide={this.props.closeModal}>
        <Bootstrap.Modal.Header>
          <Bootstrap.Modal.Title>Participant details</Bootstrap.Modal.Title>
        </Bootstrap.Modal.Header>
        <Bootstrap.Modal.Body>
          <ParticipantDetails event={this.props.event}
                              optionalStatuses={getRelevantStatuses(this.props.event)}
                              participant={this.props.participant}/>
        </Bootstrap.Modal.Body>
        <Bootstrap.Modal.Footer>
          <Bootstrap.Button onClick={this.saveAndClose}
                            bsStyle='primary'>
            Save changes
          </Bootstrap.Button>
          </Bootstrap.Modal.Footer>
        </Bootstrap.Modal>
    );
  }
});

function renderParticipants(participants, event, showParticipantInfo, emptyMessage) {
  // These should be the same for every object in participants, so we can just
  // take the first
  var onWaitingList = _.first(_.pluck(participants, 'on_waiting_list'));
  var cancelled = _.first(_.pluck(participants, 'cancelled'));
  if(_.isEmpty(participants)) {
    return (<em>{emptyMessage}</em>);
  }

  var relevantStatuses = getRelevantStatuses(event);

  // Show latest applications first
  var sortedParticipants = _.sortBy(participants, function(participant) {
    var submissionTime = new Date(participant.submission_date);
    return -submissionTime.getTime();
  });

  var rows = _.map(sortedParticipants, function(participant) {
    var linkParams = {
      registrationId: participant.registration_id,
      eventId: participant.event_id
    };

    var statuses = _.map(relevantStatuses, function(status, statusKey) {
      var className = participant[statusKey] ? 'ok' : 'error';
      return (
        <td key={statusKey}>
          <span className={className}>
            {participant[statusKey] ? "Yes" : "No"}
          </span>
        </td>
      );
    });

    var isEmailVerified = participant.email_verified;

    var email = participant.email + ' ';
    email += isEmailVerified ? '(verified)' : '(not verified)';

    var verificationStatusColor = isEmailVerified ? 'email-verified' : 'email-unverified';

    return ( 
      <tr key={participant.registration_id}> 
        <td>
          <Bootstrap.Button onClick={showParticipantInfo.bind(null, participant)}
                            bsStyle='primary'>
            {participant.name}
          </Bootstrap.Button>
        </td>
        <td className={verificationStatusColor}>
          {email}
        </td>
        <td>
          {moment(participant.submission_date).format("D.M YYYY HH:mm")}
        </td>
        {statuses}
        <td>
          <em>
            {participant.notes}
          </em>
        </td>
      </tr>
    );
  });

  var statusDescriptions = _.map(relevantStatuses, function(status, statusKey) {
    return (
      <th key={statusKey}>{status.text}</th>
    );
  });

  return ( 
    <Bootstrap.Table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Submission time</th>
          {statusDescriptions}
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </Bootstrap.Table>
  );
}

var EventParticipants = React.createClass({
  getInitialState: function() {
    return ParticipantDraftStore.getState();
  },
  
  eventId: function() {
    return parseInt(this.getParams().eventId, 10);
  },
  
  _onChange: function(updated_event_id) {
    this.setState(ParticipantDraftStore.getState());
  },
  
  componentDidMount: function() {
    ParticipantDraftStore.listen(this._onChange);
  },
  
  componentWillUnmount: function() {
    ParticipantDraftStore.unlisten(this._onChange);
  },

  showParticipantInfo: function(participant) {
    ParticipantDraftActions.openModal(participant);
  },

  saveParticipantChanges: function() {
    ParticipantDraftActions.saveDraft();
    ParticipantDraftActions.closeModal();
  },

  render: function() {
    var groupedByCancellation = _.groupBy(this.props.event.registrations, 'cancelled');
    var cancelled = groupedByCancellation[true];
    var groupedByWaitingListStatus = _.groupBy(groupedByCancellation[false], 'on_waiting_list');

    var waitingList = groupedByWaitingListStatus[true];
    var participants = groupedByWaitingListStatus[false];
    return ( 
      <div>
        <h2>Participants ({participants.length}/{this.props.event.max_participants})</h2>
        {renderParticipants(participants,
                            this.props.event,
                            this.showParticipantInfo,
                            "No applications yet.")}
        <h2>Waiting list ({waitingList.length}/{this.props.event.max_waiting_list_length})</h2>
        {renderParticipants(waitingList,
                            this.props.event,
                            this.showParticipantInfo,
                            "The waiting list is currently empty.")}
        <h2>Cancelled or rejected ({cancelled.length})</h2>
        {renderParticipants(cancelled,
                            this.props.event,
                            this.showParticipantInfo,
                            "No cancellations yet.")}
        <ParticipantModal event={this.props.event}
                          participant={this.state.draft}
                          visible={this.state.modalIsOpen}
                          saveChanges={ParticipantDraftActions.saveDraft}
                          closeModal={ParticipantDraftActions.closeModal}/>
      </div>);
  },
});

module.exports = EventParticipants;
