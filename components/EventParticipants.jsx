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
  if(_.isEmpty(participants)) {
    return (<em>{emptyMessage}</em>);
  }

  var relevantStatuses = getRelevantStatuses(event);

  var rows = _.map(participants, function(participant) {
    var linkParams = {
      registrationId: participant.registration_id,
      eventId: participant.event_id
    };

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

    return ( 
      <tr key={participant.registration_id}> 
        <td>
          <Link to="participant-details"
                params={linkParams}>
          {participant.name}
            </Link>
        </td>
        <td>
          {participant.email}
        </td>
        <td>
          {participant.email_verified ? "Yes" : "No"}
        </td>
        <td>
          {moment(participant.submission_date).format("D.M YYYY HH:mm")}
        </td>
        {statuses}
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
          <th>Email verified?</th>
          <th>Submission time</th>
          {statusDescriptions}
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
    return ( 
      <div>
        <a href={pdfUrl}
           download="participants.pdf">
          Download forms submitted by participants as a PDF.
        </a>
        <h2>Participants</h2>
        {renderParticipants(this.props.event.registrations.participants,
                            this.props.event,
                            "No applications yet.")}
        <h2>Waiting list</h2>
        {renderParticipants(this.props.event.registrations.waitingList,
                            this.props.event,
                            "The waiting list is currently empty.")}
        <h2>Cancelled</h2>
        {renderParticipants(this.props.event.registrations.cancelled,
                            this.props.event,
                            "No cancellations yet.")}
      </div>);
  },
});

module.exports = EventParticipants;
