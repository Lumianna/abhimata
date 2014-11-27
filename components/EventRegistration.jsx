var React = require('react');

var $ = require('jquery');
var _ = require('lodash');
var Router = require('react-router');
var Link = Router.Link;

var eventActionCreators = require('../actions/eventActionCreators.js');
var publicEventStore = require('../stores/publicEventStore.js');
var eventApplicationStore = require('../stores/eventApplicationStore.js');
var registrationActionCreators = require('../actions/registrationActionCreators.js');

//TODO: write separate components (text area etc), refactor
//editable form component to use these components for preview

function generalUpdateFunc(updateFunc, event) {
  updateFunc(event.target.value);
}

function checkboxUpdateFunc(updateFunc, event) {
  updateFunc(event.target.value);
}

var TextArea = React.createClass({
  render: function() {
    return(  
      <label key={this.props.key}>
        {this.props.label}
        <textarea rows="4" 
                  value={this.props.value}
                  onChange={this.onChange}/>
      </label> 
    );
  },
  
  onChange: function(event) {
    this.props.onChange(this.props.key, event.target.value);
  },
});

var TextInput = React.createClass({
  render: function() {
    return(  
      <label key={this.props.key}>
        {this.props.label}
        <input type="text" 
               value={this.props.value}
               onChange={this.onChange}/>
      </label> 
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
        return ( 
          <label key={index}> 
            {alternative} 
            <input type="checkbox" 
                   onChange={this.onChange.bind(null, index)}
                   checked={this.props.value[index]} /> 
          </label> 
        );
      }.bind(this));

    return(  
      <label key={this.props.key}>
        {this.props.label}
        {checkboxes}
      </label>
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
      var name = "radio" + this.props.key;
      var radioButtons = _.map(
        this.props.alternatives, 
        function(alternative, index) {
          return ( 
            <label key={index}> 
              {alternative} 
              <input type="radio" 
                     value={alternative} 
                     id={index}
                     name={name}
                     checked={index === this.props.value}
                     onChange={this.onChange.bind(this, index)}/> 
            </label> 
          );
        }.bind(this));

    return(  
      <label key={this.props.key}>
        {this.props.label}
        {radioButtons}
      </label>
    );
  },
  
  onChange: function(index) {
    this.props.onChange(this.props.key, index);
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
    switch(question.type) {
      case  "textarea" :
        return ( 
          <TextArea key={question.key}
                    label={question.label}
                    value={state.answers[key]}
                    onChange={updateFunc}/>
        );
      case  "text" :
        return ( 
          <TextInput key={question.key}
                     label={question.label}
                     value={state.answers[key]}
                     onChange={updateFunc}/>
        );
      case "radio" :
        return ( 
          <RadioGroup key={question.key}
                      label={question.label}
                      alternatives={question.alternatives}
                      value={state.answers[key]}
                      onChange={updateFunc}/>
        );
      case "checkbox" :
        return ( 
          <CheckboxGroup key={question.key}
                         label={question.label}
                         alternatives={question.alternatives}
                         value={state.answers[key]}
                         onChange={updateFunc}/>

        );
      default :
        console.log("Warning: unrecognized editable form element");
        return null;

    }
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
      <div className="eventSettings">
        <Link to="/">Back to list of events</Link>
        <h1>{this.state.title}</h1> 
        {renderQuestions(this.state, this.updateAnswer)}
    </div>
    );
  }
});

module.exports = EventRegistration; 
