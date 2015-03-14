var React = require('react');

var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var Link = Router.Link;

var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.js');
var eventActionCreators = require('../actions/eventActionCreators.js');
var eventDraftStore = require('../stores/eventDraftStore.js');

var EditableForm = require('../components/editableform.jsx');
var EventParticipants = require('../components/EventParticipants.jsx');

var Loading = require('./Loading.jsx');

var POLLING_INTERVAL = 60000;

var EventSettings = React.createClass({
  mixins: [AuthenticatedRoute, Router.State], 

  getInitialState: function() {
    return null;
  },
  
  eventId: function() {
    return parseInt(this.getParams().eventId, 10);
  },
  
  _onChange: function(updated_event_id) {
    if(updated_event_id === this.eventId())
    {
      this.setState(eventDraftStore.getEventDraft(updated_event_id));
    }
  },
  
  componentDidMount: function() {
    eventDraftStore.addChangeListener(this._onChange);
    eventActionCreators.requestEventDetails(this.eventId());
    var that = this;
    this.pollerId = setInterval(function() {
      eventActionCreators.requestEventDetails(that.eventId());
    }, POLLING_INTERVAL);
      
  },
  
  componentWillUnmount: function() {
    eventDraftStore.removeChangeListener(this._onChange);
    clearInterval(this.pollerId);
  },
  
  saveEvent: function() {
    eventActionCreators.saveEvent(this.eventId());
  },
  
  render: function() {
    if(!this.state) {
      return (<Loading/>);
    }

    if(this.state.error) {
      return ( 
        <div>
          <p>Error: {this.state.error}</p>
          <Link to="/admin/events">Back to event list.</Link>
        </div>
      );
    }

    var saveButton = null;

    if(this.state.hasUnsavedChanges) {
      saveButton = (
        <button onClick={this.saveEvent}>Save changes</button>
      );
    }
  
    return (
      <div className="event-settings">
        <h1>{this.state.title}</h1> 
        <Link to="/admin/events">Back to list of events</Link>
        <EventSettingsLinks eventId={this.getParams().eventId}/>
        <RouteHandler event={this.state}/>
        {saveButton}
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
        <Link to="participants" params={linkParams}>
          Participants
        </Link>
        <Link to="delete" params={linkParams}>
          Delete event 
        </Link>
      </div> );
  }
});

var DeleteData = React.createClass({
  mixins: [Router.Navigation], 

  deleteEvent: function() {
    eventActionCreators.deleteEvent(this.props.event.event_id);
    this.transitionTo('/admin/events');
  },
  render: function() {
    return (
      <button onClick={this.deleteEvent}>Delete event and all data</button>
      );
  }
});


var ValidatedTextInput = React.createClass({ 
  render: function() {
    return( 
      <label>
        {this.props.label} 
        <input type="text" value={this.props.value}
               onChange={this.props.onChange}/>
        <span className=".error"> {this.props.error}</span>
      </label>
    );
  }
});


/* Component for managing general event settings: title, number of
   participants, etc. */
var EventGeneral = React.createClass({
  render: function() {
    if(!this.props.event) {
      return (<Loading/>);
    }

    return (
      <form>
        <label>
          Event title
          <input type="text" value={this.props.event.title}
               onChange={this._onChange.bind(null, "title")}/>
        </label>
        <ValidatedTextInput 
          label="Maximum number of participants"
          value={this.props.event.max_participants}
          error={this.props.event.errors.max_participants}
          onChange={this._onChange.bind(null, "max_participants")}/>
        <ValidatedTextInput 
          label="Maximum length of waiting list"
          value={this.props.event.max_waiting_list_length}
          error={this.props.event.errors.max_waiting_list_length}
          onChange={this._onChange.bind(null, "max_waiting_list_length")}/>
        <label>
          Visible to public
          <input type="checkbox" 
                 checked={this.props.event.visible_to_public}
                 onChange={this._onCheckboxClick.bind(null, "visible_to_public")}/>
        </label>
        <label>
          Registration open
          <input type="checkbox" 
                 checked={this.props.event.registration_open}
                 onChange={this._onCheckboxClick.bind(null, "registration_open")}/>
        </label>
      </form> );
  },

  _onChange: function(propertyName, event) {
    eventActionCreators.updateEventProperty(this.props.event.event_id,
                                            propertyName,
                                            event.target.value);
  },
  
  _onCheckboxClick: function(propertyName, event) {
    eventActionCreators.updateEventProperty(this.props.event.event_id,
                                            propertyName,
                                            event.target.checked);
  },

});

var RegistrationForm = React.createClass({
  render : function() {
    if(!this.props.event) {
      return (<Loading/>);
    }

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
  EventParticipants: EventParticipants,
};
