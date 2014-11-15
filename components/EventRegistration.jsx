var React = require('react');

var $ = require('jquery');
var Router = require('react-router');
var Link = Router.Link;

var eventActionCreators = require('../actions/eventActionCreators.js');
var eventStore = require('../stores/eventStore.js');

var EventRegistration = React.createClass({
  
  eventId: function() {
    return parseInt(this.props.params.eventId, 10);
  },

  render: function() {
    return (
      <div className="eventSettings">
        <h1>Registration</h1> 
        <Link to="/">Back to list of events</Link>
    </div>
    );
  }
});

module.exports = EventRegistration; 
