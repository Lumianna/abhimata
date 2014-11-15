var React = require('react');

var Router = require('react-router');
var Link = Router.Link;

var $ = require('jquery');
var _ = require('lodash');
var eventActionCreators = require('../actions/eventActionCreators.js');
var eventStore = require('../stores/eventStore.js');

var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.js');

var AdminEventList = React.createClass({
  mixins: [AuthenticatedRoute],

  getInitialState: function() {
    return this.getStateFromStores();
  },
  
  componentDidMount: function() {
    eventStore.addChangeListener(this._onChange);
    eventActionCreators.requestPrivateEventList();
  },
  
  getStateFromStores: function() {
    return { events: eventStore.getEventsPrivate() };
  },
                                 
  _onChange: function() {
    this.setState(this.getStateFromStores());
  },

  componentWillUnmount: function() {
    eventStore.removeChangeListener(this._onChange);
  },
  
  createNewEvent: function() {
    eventActionCreators.createEvent();
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
