var React = require('react');

var Router = require('react-router');
var Link = Router.Link;

var $ = require('jquery');
var _ = require('lodash');
var EventActions = require('../actions/EventActions.js');
var PublicEventStore = require('../stores/PublicEventStore.js');

var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.js');

var UserEventList = React.createClass({
  getInitialState: function() {
    return this.getStateFromStores();
  },
  
  componentDidMount: function() {
    PublicEventStore.listen(this._onChange);
    EventActions.requestPublicEventList();
  },
  
  getStateFromStores: function() {
    return { events: PublicEventStore.getEvents() };
  },
  
  _onChange: function() {
    this.setState(this.getStateFromStores());
  },

  componentWillUnmount: function() {
    PublicEventStore.unlisten(this._onChange);
  },
  
  render: function() {
    var events = _.map(this.state.events, function(event) {
      var openPlaces = Math.max(0, event.max_participants - event.num_participants); 
      
      return ( 
        <tr key={event.event_id}> 
          <td>
            <Link to="event-registration" 
                  params={{eventId: event.event_id}}> 
              {openPlaces > 0 ? "Sign up" : "Sign up for waiting list"}
            </Link> 
          </td>
          <td>
            {event.title}
          </td>
          <td>
            {openPlaces + "/" + event.max_participants}
          </td>
        </tr> );
    });

    return ( 
      <div>
        <h1>Events</h1>
        <table>
          <thead>
            <tr>
              <th>{/* Sign up link*/}</th>
              <th>Event name</th>
              <th>Places available</th>
            </tr>
          </thead>
          <tbody>
            {events}
          </tbody>
        </table>
      </div>
    );
  }
});

module.exports = UserEventList;
