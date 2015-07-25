var React = require('react');

var Router = require('react-router');
var Link = Router.Link;

var Bootstrap = require('react-bootstrap');
var RRBootstrap = require('react-router-bootstrap');

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
          <RRBootstrap.ListGroupItemLink to="event" 
                                       key={event.event_id}
                                       params={{eventId: event.event_id}}> 
            {event.title} 
          </RRBootstrap.ListGroupItemLink> );
    });

    return ( 
      <div>
        <h1>Events</h1>
        <Bootstrap.ListGroup>
          {eventTitles}
        </Bootstrap.ListGroup> 
        <Bootstrap.Button onClick={this.createNewEvent}
                          bsStyle="primary">
          Create new event
        </Bootstrap.Button>
      </div>);
  }
});

module.exports = AdminEventList;
