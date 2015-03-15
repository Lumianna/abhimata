var _ = require('lodash');
var moment = require('moment');
var React = require('react');

var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var Link = Router.Link;

var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.js');

function renderParticipants(participants, emptyMessage) {
  if(_.isEmpty(participants)) {
    return (<em>{emptyMessage}</em>);
  }
  
  var rows = _.map(participants, function(participant) {
    var linkParams = {
      registrationId: participant.registration_id,
      eventId: participant.event_id
    };
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
      </tr>
    );
  });

  return ( 
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Email verified?</th>
          <th>Submission time</th>
        </tr>
      </thead>
      <tbody>
        {rows}
      </tbody>
    </table>
  );
}

var EventParticipants = React.createClass({
  render: function() {
    return ( 
      <div>
        <h2>Participants</h2>
        {renderParticipants(this.props.event.registrations.participants,
                            "No applications yet.")}
        <h2>Waiting list</h2>
        {renderParticipants(this.props.event.registrations.waitingList,
                            "The waiting list is currently empty.")}
        <h2>Cancelled</h2>
        {renderParticipants(this.props.event.registrations.cancelled,
                            "No cancellations yet.")}
      </div>);
  },
});

module.exports = EventParticipants;
