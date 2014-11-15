var React = require('react');

var Router = require('react-router');
var Link = Router.Link;

var $ = require('jquery');
var eventActionCreators = require('../actions/eventActionCreators.js');
var publicEventStore = require('../stores/publicEventStore.js');

var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.js');

var UserEventList = React.createClass({
  getInitialState: function() {
    return this.getStateFromStores();
  },
  
  componentDidMount: function() {
    publicEventStore.addChangeListener(this._onChange);
    eventActionCreators.requestPublicEventList();
  },
  
  getStateFromStores: function() {
    return { events: publicEventStore.getEvents() };
  },
  
  _onChange: function() {
    this.setState(this.getStateFromStores());
  },

  componentWillUnmount: function() {
    publicEventStore.removeChangeListener(this._onChange);
  },
  
  createNewEvent: function() {
    eventActionCreators.createEvent();
  },

  render: function() {
    var eventTitles = this.state.events.map(function(event) {
      return ( 
        <li key={event.event_id}> 
          <Link to="event-registration" 
                params={{eventId: event.event_id}}> 
            {event.title} 
          </Link> 
        </li> );
    });

    return ( 
      <div>
        <h1>Events</h1>
        <ul>{eventTitles}</ul> 
      </div>);
  }
});

module.exports = UserEventList;
