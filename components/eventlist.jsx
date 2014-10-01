var React = require('react');

var Router = require('react-router');
var Link = Router.Link;

var $ = require('jquery');
var eventActionCreators = require('../actions/eventActionCreators.js');
var eventStore = require('../stores/eventStore.js');

var EventList = React.createClass({
  getInitialState : function() {
    return this.getStateFromStores();
  },
  
  componentDidMount : function() {
    eventStore.addChangeListener(this._onChange);
    eventActionCreators.requestEventsPublic();
  },
  
  getStateFromStores : function() {
    return { events : eventStore.getEventsPublic() };
  },
                                 
  _onChange : function() {
    this.setState(this.getStateFromStores());
  },

  componentWillUnmount : function() {
    eventStore.removeChangeListener(this._onChange);
  },
  
  createNewEvent : function() {
    $.ajax({ 
      type : "POST",
      url : "events",
      data : JSON.stringify(
        { }),
      success : function(data) { 
        this.fetchEvents();
      }.bind(this),
      error : function(data, textStatus) { 
        this.setState({ error : "Could not access database."});
      }.bind(this),
      contentType : "application/json; charset=utf-8"
    });
  },

  render : function() {
    var eventTitles = this.state.events.map(function(event) {
      return ( 
        <li> 
          <Link to="event" 
                params={{eventId : event.event_id}}> 
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

module.exports = EventList;
