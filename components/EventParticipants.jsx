var _ = require('lodash');
var moment = require('moment');
var React = require('react');

var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var Link = Router.Link;

var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.js');

function renderParticipants(participants) {
    var rows = _.map(participants, function(participant) {
      return ( 
        <tr key={participant.registration_id}> 
          <td>
            {participant.name}
          </td>
          <td>
            {participant.email}
          </td>
          <td>
            {participant.email_verified ? "Yes" : "No"}
          </td>
          <td>
            {moment(participant.submission_date).format("D. M hh:mm")}
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
    console.log(this.props.event);
    return ( 
      <div>
        <h2>Participants</h2>
        {renderParticipants(this.props.event.registrations.participants)}
        <h2>Waiting list</h2>
        {renderParticipants(this.props.event.registrations.waitingList)}
        <h2>Cancelled</h2>
        {renderParticipants(this.props.event.registrations.cancelled)}
      </div>);
  },
});

module.exports = EventParticipants;
