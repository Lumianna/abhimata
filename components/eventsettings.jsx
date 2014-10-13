var React = require('react');

var $ = require('jquery');
var Router = require('react-router');
var Link = Router.Link;

var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.js');
var eventActionCreators = require('../actions/eventActionCreators.js');
var eventStore = require('../stores/eventStore.js');

var EditableForm = require('../components/editableform.jsx');

var EventSettings = React.createClass({
  mixins: [AuthenticatedRoute], 

  getInitialState: function() {
    return {
      title: "",
      registration_form: [],
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
    eventActionCreators.saveEvent(this.eventId());
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
        <EventSettingsLinks eventId={this.props.params.eventId}/>
        <this.props.activeRouteHandler event={this.state}/>
        <button onClick={this.saveEvent}>Save changes</button>
    </div>
    );
  }
});

var EventSettingsLinks = React.createClass({
  render: function() { 
    var linkParams = { eventId : this.props.eventId };
    return (
      <div className="event-settings-dashboard">
        <Link to="general" params={linkParams}>
          General settings
        </Link>
        <Link to="registrationform" params={linkParams}>
          Sign-up form
        </Link>
        <Link to="delete" params={linkParams}>
          Delete event 
        </Link>
      </div> );
  }
});

var DeleteData = React.createClass({
  mixins: [Router.Transitions],

  deleteEvent: function() {
    eventActionCreators.deleteEvent(this.props.event.event_id);
    this.transitionTo('/events');
  },
  render: function() {
    return (
      <button onClick={this.deleteEvent}>Delete event and all data</button>
      );
  }
});

var EventGeneral = React.createClass({
  render: function() {
    return (
      <form>
        <label>
          Event title
          <input type="text" value={this.props.event.title}
               onChange={this._onChange.bind(null, "title")}/>
        </label>
      </form> );
  },

  _onChange: function(propertyName, jsEvent) {
    eventActionCreators.updateEventProperty(this.props.event.event_id,
                                            propertyName,
                                            jsEvent.target.value);
  },
});

var RegistrationForm = React.createClass({
  render : function() {
    var questions = this.props.event.registration_form.order.map(
      function(key, index) { 
        var question = this.props.event.registration_form.questions[key]; 
        question.index = index;
        return question;
      }.bind(this));
    return (
      <EditableForm editQuestion={this.updateQuestionProperty}
                    addQuestion={this.addQuestion}
                    moveQuestion={this.moveQuestion}
                    deleteQuestion={this.deleteQuestion}
                    elements={questions}> 
      </EditableForm>
    );
  },

  addQuestion: function(type) {
    eventActionCreators.addQuestion({
      event_id: this.props.event.event_id,
      questionType: type,
    });
  },

  moveQuestion: function(key, index) {
    eventActionCreators.moveQuestion({
      event_id: this.props.event.event_id,
      key: key,
      toIndex: index,
    });
  },
 
  updateQuestionProperty: function(key, field, value) {
    eventActionCreators.updateQuestionProperty({
      event_id: this.props.event.event_id,
      key: key,
      property: field,
      value: value,
    });
  },
  
  deleteQuestion: function(key) {
    eventActionCreators.deleteQuestion({
      event_id: this.props.event.event_id,
      key: key,
    });
  },

});



module.exports = { 
  EventSettings: EventSettings,
  EventGeneral: EventGeneral,
  RegistrationForm: RegistrationForm,
  DeleteData: DeleteData,
};
