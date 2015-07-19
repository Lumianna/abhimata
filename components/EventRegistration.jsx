var React = require('react');

var _ = require('lodash');
var Router = require('react-router');
var Link = Router.Link;

var itemStatus = require('../constants/constants.js').itemStatus;
var EventActions = require('../actions/EventActions.js');
var PublicEventStore = require('../stores/PublicEventStore.js');
var EventApplicationStore = require('../stores/EventApplicationStore.js');
var RegistrationActions = require('../actions/RegistrationActions.js');

var Bootstrap = require('react-bootstrap');

var Loading = require('./Loading.jsx');

var TextArea = React.createClass({
  render: function() {
    return(  
      <Bootstrap.Input type="textarea"
                       rows="4" 
                       label={this.props.label}
                       value={this.props.value}
                       onChange={this.onChange}/>
    );
  },
  
  onChange: function(event) {
    this.props.onChange(event.target.value);
  },
});

var TextInput = React.createClass({
  render: function() {
    return(  
      <Bootstrap.Input type="text" 
                       label={this.props.label}
                       value={this.props.value}
                       onChange={this.onChange}/>
    );
  },
  
  onChange: function(event) {
    this.props.onChange(event.target.value);
  },
});


var CheckboxGroup = React.createClass({
  render: function() {
    var checkboxes = _.map(
      this.props.alternatives,
      function(alternative, index) {
        return ( 
          <Bootstrap.Input type="checkbox" 
                           key={index}
                           label={alternative}
                           onChange={this.onChange.bind(null, index)}
                           checked={this.props.value[index]} /> 
        );
      }.bind(this));

    return(  
      <div id={this.props.id} className="checkbox-group">
        {checkboxes}
      </div>
    );
  },
  
  onChange: function(index) {
    var newValue = _.clone(this.props.value);
    newValue[index] = !newValue[index];
    this.props.onChange(newValue);
  },
});


var RadioGroup = React.createClass({
  render: function() {
    var name = "radio_" + this.props.key;
    
    var radioButtons = _.map(
      this.props.alternatives, 
      function(alternative, index) {
        return ( 
          <Bootstrap.Input type="radio" 
                           value={alternative} 
                           name={name}
                           key={index}
                           label={alternative}
                           checked={index === this.props.value ? true : null}
                           onChange={this.onChange.bind(this, index)}/> 
        );
      }.bind(this));

    return(  
      <div id={this.props.id} className="radio-group">
        {radioButtons}
      </div>
    );
  },
  
  onChange: function(index, event) {
    if(this.props.value !== index) {
      this.props.onChange(index);
    }
  },
});


function renderForm(state, updateFunc) {
  if(!state.draft.questions) {
    return null;
  }

  var questions = _.map(state.event.registration_form.order, function(key) { 
    return state.event.registration_form.questions[key];
  });
  
  return _.map(questions, function(question) {
    var key = question.key;
    var id = _.uniqueId("formquestion");


    var isRequired = ""; // question.isResponseOptional ? "" : " (answer required)";

    var labelText = question.label + isRequired;
    var label = (
        <label key={question.key}
               className="control-label"
               htmlFor={id}>
          {labelText}
        </label> 
    );

    var onChange = updateFunc.bind(null, question.key);
    var input;
    var bsStyle = null; //state.draft.questions[key].error ? "error" : null;
    switch(question.type) {
      case  "textarea" :
        label = null;
        input = (
          <TextArea label={labelText}
                    bsStyle={bsStyle}
                    value={state.draft.questions[key].value}
                    onChange={onChange}/>
        );
        break;

      case  "text" :
        label = null;
        input = ( 
          <TextInput label={question.label + isRequired}
                     bsStyle={bsStyle}
                     value={state.draft.questions[key].value}
                     onChange={onChange}/>
        );
        break;

      case "radio" :
        input = ( 
          <RadioGroup alternatives={question.alternatives}
                      value={state.draft.questions[key].value}
                      id={id}
                      onChange={onChange}/>
        );
        break;
        
      case "checkbox" :
        input = ( 
          <CheckboxGroup alternatives={question.alternatives}
                         value={state.draft.questions[key].value}
                         id={id}
                         onChange={onChange}/>

        );
        break;

      default :
        console.log("Warning: unrecognized editable form element");
        return null;
    }

   
    return (
      <div className={"form-question"}
           key={question.key}>
        {label}
        {input}
        <span className="error">
          {state.draft.questions[key].error}
        </span>
      </div>
    );
  });
}

var EventRegistration = React.createClass({
  mixins: [ Router.State ],

  getInitialState: function() {
    var event_id = parseInt(this.getParams().eventId, 10);
    return { 
      event: PublicEventStore.getEvent(event_id),
      event_id: event_id,
      draft: EventApplicationStore.getDraft(event_id) 
    };
  },
  
  componentWillReceiveProps: function(nextProps) {
    this.setState({ 
      event_id: parseInt(this.getParams().eventId, 10) 
    });
  },
  
  updateDraft: function() {
    this.setState({ 
      draft: EventApplicationStore.getDraft(this.state.event_id)
    });
  },

  updateEvent: function() {
    this.setState({ 
      event: PublicEventStore.getEvent(this.state.event_id)
    });
  },
  
  componentDidMount: function() {
    EventApplicationStore.listen(this.updateDraft);
    PublicEventStore.listen(this.updateEvent);
    EventActions.requestPublicEvent(this.state.event_id);
  },
  
  componentWillUnmount: function() {
    EventApplicationStore.unlisten(this.updateDraft);
    PublicEventStore.unlisten(this.updateEvent);
  },

  updateAnswer: function(key, value) {
    RegistrationActions.updateApplicationAnswer({
      event_id: this.state.event_id,
      key: key,
      value: value
    });
  },

  submit: function() {
    RegistrationActions.submit(this.state.event_id, this.state.draft);
  },

  render: function() {
    if(_.contains([this.state.event, this.state.draft], itemStatus.LOADING)) {
      return (<Loading/>);
    }

    if(this.state.event === itemStatus.NOT_AVAILABLE) {
      return (
        <div>
          <p>The event you tried to access does not seem to exist.</p>
          <Link to="/">Back to list of events</Link>
        </div>
      );
    }

    if(!this.state.event.registration_open) {
      return (
        <div>
          <p>This event is currently not accepting applications.</p>
          <Link to="/">Back to list of events</Link>
        </div>
      );
    }
                    
    var disabled = _.any(this.state.draft.questions, "error");
    var content;
    var serverError = this.state.draft.serverError;
    var alreadySubmitted = this.state.draft.submissionComplete;

    if (serverError) {
      serverError = (<p className="error"> {serverError} </p>);
    }
    
    if(alreadySubmitted) {
      content = (
        <p className="ok">
          Your application was successfully submitted.
        </p>
      );
    }
    else {
      content = renderForm(this.state, this.updateAnswer);
    }
    
    var submissionButton = (
      <Bootstrap.Button disabled={disabled}
                        bsStyle="primary"
                        onClick={this.submit}>
        Submit application
      </Bootstrap.Button>
    );

    var signup;
    if(this.state.event.max_participants > this.state.event.num_participants)
    {
      signup = "Sign up for ";
    } else {
      signup = "Join the waiting list for ";
    }

    return (
      <div className="event-registration">
        <Link to="/">Back to list of events</Link>
        <h1>
          {signup}
          <em>{this.state.event.title}</em>
        </h1> 
        {serverError}
        {content}
        {this.state.draft.submissionComplete ? null : submissionButton}
      </div>
    );
  }
});

module.exports = EventRegistration; 
