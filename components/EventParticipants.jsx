var _ = require('lodash');
var moment = require('moment');
var React = require('react');

var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var Link = Router.Link;

var Bootstrap = require('react-bootstrap');

var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.js');
var RegistrationActions = require('../actions/RegistrationActions.js');

var statuses = {
  "deposit_paid": {
    eventProp: "has_deposit",
    text: "Deposit paid",
  },
  "application_screened": {
    eventProp: "applications_need_screening",
    text: "Application screened",
  },
  "registration_fee_paid": {
    eventProp: "has_registration_fee",
    text: "Full fee paid",
  },
};

function getRelevantStatuses(event) {
  return _.filter(_.keys(statuses), function(status) {
    return event[statuses[status].eventProp];
  });
}

function updateParticipantStatus(eventId, participantId, property, event) {
  RegistrationActions.updateParticipantStatus(eventId,
                                              participantId,
                                              property,
                                              event.target.checked);
}

function renderParticipants(participants, event, emptyMessage) {
  // These should be the same for every object in participants, so we can just
  // take the first
  var onWaitingList = _.first(_.pluck(participants, 'on_waiting_list'));
  var cancelled = _.first(_.pluck(participants, 'cancelled'));
  if(_.isEmpty(participants)) {
    return (<em>{emptyMessage}</em>);
  }

  var buttonHeaders = [];

  if (onWaitingList) {
    buttonHeaders.push((
      <th key='promoteHeader'> Promote </th>
    ));
  }

  if (!cancelled) {
    buttonHeaders.push((
      <th key='rejectHeader'> Reject application </th>
    ));
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

    var buttons = [];

    if (onWaitingList) {
      var wlClickHandler = function() {
        RegistrationActions.updateParticipantStatus(participant.event_id,
                                                    participant.registration_id,
                                                    'on_waiting_list',
                                                    false);
      };

      buttons.push((
        <td key='promoteButton'>
          <Bootstrap.Button bsStyle='primary'
                            onClick={wlClickHandler}>
            Promote
          </Bootstrap.Button>
        </td>
      ));
    }

    if (!cancelled) {
      var clickHandler = function() {
        RegistrationActions.updateParticipantStatus(participant.event_id,
                                                    participant.registration_id,
                                                    'cancelled',
                                                    true);
      };

      buttons.push((
        <td key='cancelButton'>
          <Bootstrap.Button bsStyle='danger'
                            onClick={clickHandler}>
            Reject
          </Bootstrap.Button>
        </td>
      ));
    }

    var statuses = _.map(relevantStatuses, function(status) {
      return (
        <td key={status}>
          <input type="checkbox" 
                 checked={participant[status]}
                 onChange={updateParticipantStatus.bind(null,
                                                        participant.event_id,
                                                        participant.registration_id,
                                                        status)}/>
        </td>
      );
    });

    var email = participant.email + ' ';
    email += participant.email_verified ? '(verified)' : '(not verified)';

    return ( 
      <tr key={participant.registration_id}> 
        <td>
          <Link to="participant-details"
                params={linkParams}>
          {participant.name}
            </Link>
        </td>
        <td>
          {email}
        </td>
        <td>
          {moment(participant.submission_date).format("D.M YYYY HH:mm")}
        </td>
        {statuses}
        {buttons}
      </tr>
    );
  });

  var statusDescriptions = _.map(relevantStatuses, function(status) {
    return (
      <th key={status}>{statuses[status].text}</th>
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
          {buttonHeaders}
        </tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </Bootstrap.Table>
  );
}

var EventParticipants = React.createClass({
  render: function() {
    var pdfUrl = 'events-private/' +
                 this.props.event.event_id + '/participants.pdf';

    var groupedByCancellation = _.groupBy(this.props.event.registrations, 'cancelled');
    var cancelled = groupedByCancellation[true];
    var groupedByWaitingListStatus = _.groupBy(groupedByCancellation[false], 'on_waiting_list');

    var waitingList = groupedByWaitingListStatus[true];
    var participants = groupedByWaitingListStatus[false];
    return ( 
      <div>
        <a href={pdfUrl}
           download="participants.pdf">
          Download forms submitted by participants as a PDF.
        </a>
        <h2>Participants</h2>
        {renderParticipants(participants,
                            this.props.event,
                            "No applications yet.")}
        <h2>Waiting list</h2>
        {renderParticipants(waitingList,
                            this.props.event,
                            "The waiting list is currently empty.")}
        <h2>Cancelled or rejected</h2>
        {renderParticipants(cancelled,
                            this.props.event,
                            "No cancellations yet.")}
      </div>);
  },
});

module.exports = EventParticipants;
