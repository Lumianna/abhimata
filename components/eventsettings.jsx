var React = require('react');

var $ = require('jquery');
var Router = require('react-router');
var Link = Router.Link;

var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.js');
var eventActionCreators = require('../actions/eventActionCreators.js');
var eventStore = require('../stores/eventStore.js');

var EventSettings = React.createClass({
  mixins: [AuthenticatedRoute], 

  getInitialState: function() {
    return {
      title: "",
      signup_form: [],
    };
  },
  
  eventId: function() {
    return parseInt(this.props.params.eventId);
  },

  
  _onChange: function(updated_event_id) {
    if(updated_event_id === this.eventId())
    {
      this.setState(eventStore.getEventPrivate(updated_event_id));
    }
  },
  
  componentDidMount: function() {
    eventStore.addChangeListener(this._onChange);
    eventActionCreators.requestEventPrivate(this.props.params.eventId);
  },
  
  componentWillUnmount: function() {
    eventStore.removeChangeListener(this._onChange);
  },
  
  saveEvent: function() {
    eventActionCreators.saveEvent(event_id);
  },
  
  render: function() {
    if(this.state.error) {
      return ( 
        <div>
          <p>Error: {this.state.error}</p>
          <Link to="/events">Back to event list.</Link>
        </div>);
    }
  
    return (
      <div className="eventSettings">
        <h1>{this.state.title}</h1> 
        {/*<EventSettingsLinks/>*/}
        <this.props.activeRouteHandler event={this.state}/>
        <button onClick={this.saveEvent}>Save changes</button>
    </div>
    );
  }
});

var EventGeneral = React.createClass({
  render: function() {
    return (
      <form>
        <input type="text" value={this.props.event.title}
               onChange={this._onChange.bind(null, "title")}/>
      </form> );
  },

  _onChange: function(propertyName, jsEvent) {
    eventActionCreators.updateEventProperty(this.props.event.event_id,
                                            propertyName,
                                            jsEvent.target.value);
  },
});



module.exports = { 
  EventSettings: EventSettings,
  EventGeneral: EventGeneral,
  SignUpForm: null //SignUpForm
};
