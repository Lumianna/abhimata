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
      <div className={this.props.className}>
        <label key={this.props.key}
               for={id}>
          {this.props.label}
        </label> 

        <textarea rows="4" 
                  id={id}
                  value={this.props.value}
                  onChange={this.onChange}/>
      </div>
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
      <div className={this.props.className}>
        <label  
          for={id}
          key={this.props.key}>
          {this.props.label}
        </label> 

        <input type="text" 
               id={id}
               value={this.props.value}
               onChange={this.onChange}/>
      </div>
    );
  },
  
  onChange: function(event) {
    this.props.onChange(this.props.key, event.target.value);
  },
});


var CheckboxGroup = React.createClass({
  render: function() {
    var groupId = _.uniqueId("checkbox_group");
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
            <label for={id}> 
              {alternative} 
            </label> 
          </div>
        );
      }.bind(this));

    return(  
      <div className={this.props.className} 
           key={this.props.key}>
        <label for={groupId}>
          {this.props.label}
        </label>
        <div id={groupId} className="checkbox-group">
          {checkboxes}
        </div>
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
    var groupId = _.uniqueId("radiogroup");
    
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
            <label for={id}> 
              {alternative} 
            </label> 
          </div>
        );
      }.bind(this));

    return(  
      <div className={this.props.className} 
           key={this.props.key}>
        <label for={groupId}>
          {this.props.label}
        </label>
        <div id={groupId} className="radio-group">
          {radioButtons}
        </div>
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
    switch(question.type) {
      case  "textarea" :
        return ( 
          <TextArea key={question.key}
                    label={question.label}
                    className="form-question"
                    value={state.answers[key]}
                    onChange={updateFunc}/>
        );
      case  "text" :
        return ( 
          <TextInput key={question.key}
                     label={question.label}
                     className="form-question"
                     value={state.answers[key]}
                     onChange={updateFunc}/>
        );
      case "radio" :
        return ( 
          <RadioGroup key={question.key}
                      label={question.label}
                      alternatives={question.alternatives}
                      className="form-question"
                      value={state.answers[key]}
                      onChange={updateFunc}/>
        );
      case "checkbox" :
        return ( 
          <CheckboxGroup key={question.key}
                         label={question.label}
                         alternatives={question.alternatives}
                         className="form-question"
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
      <div className="event-registration">
        <Link to="/">Back to list of events</Link>
        <h1>{this.state.title}</h1> 
        {renderQuestions(this.state, this.updateAnswer)}
    </div>
    );
  }
});

module.exports = EventRegistration; 
