var React = require('react');

var $ = require('jquery');
var _ = require('lodash');
var Router = require('react-router');
var Link = Router.Link;

var eventActionCreators = require('../actions/eventActionCreators.js');
var publicEventStore = require('../stores/publicEventStore.js');
var eventApplicationStore = require('../stores/eventApplicationStore.js');
var registrationActionCreators = require('../actions/registrationActionCreators.js');


var TextArea = React.createClass({
  render: function() {
    var id = _.uniqueId("textarea");
    return(  
      <textarea rows="4" 
                id={this.props.id}
                value={this.props.value}
                onChange={this.onChange}/>
    );
  },
  
  onChange: function(event) {
    this.props.onChange(this.props.key, event.target.value);
  },
});

var TextInput = React.createClass({
  render: function() {
    var id = _.uniqueId("textinput");
    return(  
      <input type="text" 
             id={this.props.id}
             value={this.props.value}
             onChange={this.onChange}/>
    );
  },
  
  onChange: function(event) {
    this.props.onChange(this.props.key, event.target.value);
  },
});


var CheckboxGroup = React.createClass({
  render: function() {
    var checkboxes = _.map(
      this.props.alternatives,
      function(alternative, index) {
        var id = _.uniqueId("checkbox");
        return ( 
          <div key={index}>
            <input type="checkbox" 
                   id={id}
                   onChange={this.onChange.bind(null, index)}
                   checked={this.props.value[index]} /> 
            <label htmlFor={id}> 
              {alternative} 
            </label> 
          </div>
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
    this.props.onChange(this.props.key, newValue);
  },
});


var RadioGroup = React.createClass({
  render: function() {
    var name = "radio_" + this.props.key;
    
    var radioButtons = _.map(
      this.props.alternatives, 
      function(alternative, index) {
        var id = _.uniqueId("radio");
        return ( 
          <div key={index}>
            <input type="radio" 
                   value={alternative} 
                   name={name}
                   id={id}
                   checked={index === this.props.value ? true : null}
                   onChange={this.onChange.bind(this, index)}/> 
            <label htmlFor={id}> 
              {alternative} 
            </label> 
          </div>
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
      this.props.onChange(this.props.key, index);
    }
  },
});


function renderQuestions(state, updateFunc) {
  if(!state.answers) {
    return null;
  }

  var questions = _.map(state.form.order, function(key) { 
    return state.form.questions[key];
  });
  
  return _.map(questions, function(question) {
    var key = question.key;
    var id = _.uniqueId("formquestion");
    var label = (
        <label key={question.key}
               htmlFor={id}>
          {question.label}
        </label> 
    );

    var input;
    switch(question.type) {
      case  "textarea" :
        input = (
          <TextArea id={id}
                    value={state.answers[key]}
                    onChange={updateFunc}/>
        );
        break;

      case  "text" :
        input = ( 
          <TextInput id={id}
                     value={state.answers[key]}
                     onChange={updateFunc}/>
        );
        break;

      case "radio" :
        input = ( 
          <RadioGroup alternatives={question.alternatives}
                      value={state.answers[key]}
                      id={id}
                      onChange={updateFunc}/>
        );
        break;
        
      case "checkbox" :
        input = ( 
          <CheckboxGroup alternatives={question.alternatives}
                         value={state.answers[key]}
                         id={id}
                         onChange={updateFunc}/>

        );
        break;

      default :
        console.log("Warning: unrecognized editable form element");
        return null;
    }
    
    return (
      <div className="form-question"
           key={question.key}>
        {label}
        {input}
      </div>
    );
  });
}

var EventRegistration = React.createClass({
  getInitialState: function() {
    var events = publicEventStore.getEvents();
    var event_id = this.eventId();
    return { 
      form: events[event_id].registration_form,
      event_id: event_id,
      answers: eventApplicationStore.getDraft(event_id) 
    };
  },
  
  updateAnswers: function() {
    this.setState({ 
      answers: eventApplicationStore.getDraft(this.state.event_id)
    });
  },
  
  componentDidMount: function() {
    eventApplicationStore.addChangeListener(this.updateAnswers);
  },
  
  componentWillUnmount: function() {
    eventApplicationStore.removeChangeListener(this.updateAnswers);
  },

  updateAnswer: function(key, value) {
    registrationActionCreators.updateApplicationAnswer(this.state.event_id, key, value);
  },
  
  eventId: function() {
    return parseInt(this.props.params.eventId, 10);
  },

  render: function() {
    return (
      <div className="event-registration">
        <Link to="/">Back to list of events</Link>
        <h1>{this.state.title}</h1> 
        {renderQuestions(this.state, this.updateAnswer)}
    </div>
    );
  }
});

module.exports = EventRegistration; 
