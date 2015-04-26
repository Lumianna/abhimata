var React = require('react');

var Router = require('react-router');
var Link = Router.Link;

var $ = require('jquery');
var _ = require('lodash');
var EventActions = require('../actions/EventActions.js');
var PrivateEventStore = require('../stores/PrivateEventStore.js');

var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.js');

var AdminEventList = React.createClass({
  mixins: [AuthenticatedRoute],

  getInitialState: function() {
    return this.getStateFromStores();
  },
  
  componentDidMount: function() {
    PrivateEventStore.listen(this._onChange);
    EventActions.requestPrivateEventList();
  },
  
  getStateFromStores: function() {
    return { events: PrivateEventStore.getEvents() };
  },
                                 
  _onChange: function() {
    this.setState(this.getStateFromStores());
  },

  componentWillUnmount: function() {
    PrivateEventStore.unlisten(this._onChange);
  },
  
  createNewEvent: function() {
    EventActions.createEvent();
  },

  render: function() {
    var eventTitles = _.map(this.state.events, function(event) {
      return ( 
        <li key={event.event_id}> 
          <Link to="event" 
                params={{eventId: event.event_id}}> 
          {event.title} 
          </Link> 
        </li> );
    });

    return ( 
      <div>
        <h1>Events</h1>
        <ul>{eventTitles}</ul> 
        <button onClick={this.createNewEvent}>Create new event</button>
      </div>);
  }
});

module.exports = AdminEventList;
