var React = require('react');

var Router = require('react-router');
var Link = Router.Link;

var $ = require('jquery');

var EventList = React.createClass({
  getInitialState : function() {
    return { events : [] };
  },
  
  componentDidMount : function() {
    this.fetchEvents();
  },
  
  fetchEvents : function() {
    $.ajax({ 
      type : "GET",
      url : "events",
      success : function(data) { 
        console.log(data);
        this.setState( {events : data} );
      }.bind(this),
      error : function(data, textStatus) { 
        console.log(data);
        console.log(textStatus);
        //this.setState({ error : "Invalid user name or password."});
      }.bind(this),
      dataType : "json"
    });
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
