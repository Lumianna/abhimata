var React = require('react');

var Router = require('react-router');
var RouteHandler = Router.RouteHandler;
var Link = Router.Link;

var Bootstrap = require('react-bootstrap');

var RRBootstrap = require('react-router-bootstrap');

var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.js');
var EventActions = require('../actions/EventActions.js');
var AuthActions = require('../actions/AuthActions.js');
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
        <Bootstrap.Button onClick={this.saveEvent}
                          bsStyle="primary"
                          className="save-changes">
          Save changes
        </Bootstrap.Button>
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
      <Bootstrap.Navbar>
        <Bootstrap.Nav>
          <RRBootstrap.NavItemLink to="general" params={linkParams}>
            General settings
          </RRBootstrap.NavItemLink>
          <RRBootstrap.NavItemLink to="registrationform" params={linkParams}>
            Sign-up form
          </RRBootstrap.NavItemLink>
          <RRBootstrap.NavItemLink to="participants" params={linkParams}>
            Participants
          </RRBootstrap.NavItemLink>
          {/*<RRBootstrap.NavItemLink to="emailreminders" params={linkParams}>
              Participants
              </RRBootstrap.NavItemLink>*/}
              <RRBootstrap.NavItemLink to="delete" params={linkParams}>
                Delete event 
              </RRBootstrap.NavItemLink>
              <Bootstrap.NavItem onSelect={AuthActions.logout}>
                Log out
              </Bootstrap.NavItem>
        </Bootstrap.Nav>
      </Bootstrap.Navbar> );
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
      <Bootstrap.Button bsStyle="danger"
                        onClick={this.deleteEvent}>
        Delete event and all data
      </Bootstrap.Button>
      );
  }
});


var ValidatedTextInput = React.createClass({ 
  render: function() {
    return( 
      <div>
        <Bootstrap.Input type="text" value={this.props.value}
                         label={this.props.label}
                         onChange={this.props.onChange}
                         onBlur={this.props.onBlur}/>
        <span className="error"> {this.props.error}</span>
      </div>
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
        key: "has_registration_fee",
        text: "This event has a registration fee",
      },
      {
        key: "has_deposit",
        text: "This event has a deposit (in addition to the registration fee) that you need to pay as soon as you register",
      },
    ];

    var that = this;
    var checkboxes = _.map(optionalStatuses, function(status) {
      return (
        <div key={status.key}>
          <Bootstrap.Input type="checkbox" 
                           label={status.text}
                           checked={that.props.event[status.key]}
                           onChange={that._onCheckboxClick.bind(null, status.key)}/>
        </div>
      );
    });

    return (
      <form>
        <Bootstrap.Input type="text"
                         label="Event title"
                         value={this.props.event.title}
                         onChange={this._onChange.bind(null, "title")}/>
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

function hasSubmissions(event) {
  return (!_.isEmpty(event.registrations.participants) ||
    !_.isEmpty(event.registrations.cancelled) ||
    !_.isEmpty(event.registrations.waitingList));
}

var RegistrationForm = React.createClass({
  render : function() {
    if(!this.props.event) {
      return (<Loading/>);
    }

    if(hasSubmissions(this.props.event)) {
      return (
        <p>
          Someone has already registered for this event, so you can no longer edit the form.
        </p>
      );
    }

    if(this.props.event.registration_open) {
      return (
        <p>
          You can't edit the registration form while registration is open. As long as no one has registered for the event, you can make the form editable again by closing registration.
        </p>
      );
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
