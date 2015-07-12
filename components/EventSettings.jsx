var React = require('react');

var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var Link = Router.Link;

var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.js');
var EventActions = require('../actions/EventActions.js');
var EventDraftStore = require('../stores/EventDraftStore.js');

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
    this.setState(EventDraftStore.getEventDraft(this.eventId()));
  },
  
  componentDidMount: function() {
    EventDraftStore.listen(this._onChange);
    EventActions.requestEventDetails(this.eventId());
    var that = this;
    this.pollerId = setInterval(function() {
      EventActions.requestEventDetails(that.eventId());
    }, POLLING_INTERVAL);
      
  },
  
  componentWillUnmount: function() {
    EventDraftStore.unlisten(this._onChange);
    clearInterval(this.pollerId);
  },
  
  saveEvent: function() {
    EventActions.saveEvent(this.eventId());
  },
  
  render: function() {
    if(!this.state) {
      return (<Loading/>);
    }

    if(this.state.error) {
      return ( 
        <div>
          <p>Error: {this.state.error}</p>
          <Link to="/admin/events">Back to list of events</Link>
        </div>
      );
    }

    var saveButton = null;

    if(this.state.hasUnsavedChanges) {
      saveButton = (
        <button onClick={this.saveEvent}
                className="save-changes">Save changes</button>
      );
    }
  
    return (
      <div className="event-settings">
        <Link to="/admin/events">Back to list of events</Link>
        <h1>{this.state.title}</h1> 
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
        {/*<Link to="emailreminders" params={linkParams}>
          Participants
        </Link>*/}
        <Link to="delete" params={linkParams}>
          Delete event 
        </Link>
      </div> );
  }
});

var DeleteData = React.createClass({
  mixins: [Router.Navigation], 

  deleteEvent: function() {
    EventActions.deleteEvent(this.props.event.event_id);
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
               onChange={this.props.onChange}
               onBlur={this.props.onBlur}/>
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

    var optionalStatuses = [
      {
        key: "visible_to_public",
        text: "Visible to public",
      },
      {
        key: "registration_open",
        text: "Registration is open",
      },
      {
        key: "applications_need_screening",
        text: "Applications for this event need to be screened by the organizers",
      },
      {
        key: "has_fee",
        text: "This event has an entry fee",
      },
      {
        key: "has_registration_fee",
        text: "This event has a registration fee",
      },
    ];

    var that = this;
    var checkboxes = _.map(optionalStatuses, function(status) {
      return (
        <div key={status.key}>
          <label htmlFor={status.key}>
            {status.text}
          </label>
          <input type="checkbox" 
                 id={status.key}
                 checked={that.props.event[status.key]}
                 onChange={that._onCheckboxClick.bind(null, status.key)}/>
        </div>
      );
    });

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
          onChange={this._onChange.bind(null, "max_participants")}
          onBlur={this._onBlur.bind(null, "max_participants")}/>
        <ValidatedTextInput 
          label="Maximum length of waiting list"
          value={this.props.event.max_waiting_list_length}
          error={this.props.event.errors.max_waiting_list_length}
          onChange={this._onChange.bind(null, "max_waiting_list_length")}
          onBlur={this._onBlur.bind(null, "max_waiting_list_length")}/>
        {checkboxes}
      </form>
    );
  },

  _onChange: function(propertyName, event) {
    EventActions.updateEventProperty({
      event_id: this.props.event.event_id,
      property: propertyName,
      value: event.target.value
    });
  },

  _onBlur: function(propertyName, event) {
    EventActions.validateEventProperty({
      event_id: this.props.event.event_id,
      property: propertyName
    });
  },

  
  _onCheckboxClick: function(propertyName, event) {
    EventActions.updateEventProperty({
      event_id: this.props.event.event_id,
      property: propertyName,
      value: event.target.checked
    });
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

  addQuestion: function(index, type) {
    EventActions.addQuestion({
      event_id: this.props.event.event_id,
      questionType: type,
      index: index,
    });
  },

  moveQuestion: function(key, index) {
    EventActions.moveQuestion({
      event_id: this.props.event.event_id,
      key: key,
      toIndex: index,
    });
  },
 
  updateQuestionProperty: function(key, field, value) {
    EventActions.updateQuestionProperty({
      event_id: this.props.event.event_id,
      key: key,
      property: field,
      value: value,
    });
  },
  
  deleteQuestion: function(key) {
    EventActions.deleteQuestion({
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
