var React = require('react');

var $ = require('jquery');
var _ = require('lodash');
var Router = require('react-router');
var Link = Router.Link;

var eventActionCreators = require('../actions/eventActionCreators.js');
var publicEventStore = require('../stores/publicEventStore.js');

function renderQuestions(form) {
  var questions = _.map(form.order, function(key) { 
    return form.questions[key];
  });
  
  return _.map(questions, function(question) {
    switch(question.type) {
      case  "textarea" :
        return ( 
          <label key={question.key}>
            {question.label}
            <textarea rows="4"/>
          </label> 
        );
        break;
      case  "text" :
        return ( 
          <label key={question.key}>
            {question.label}
            <input type="text"/>
          </label>
        );
        break;
      case "radio" :
        var name = "radio" + question.key;
        var radioButtons = question.alternatives.map(
          function(alternative, index) {
            return ( 
              <label key={index}> 
                {alternative} 
                <input type="radio" value={alternative} 
                       name={name}/> 
              </label> 
            );
          });

        return ( 
          <label key={question.key}>
            {question.label}
            {radioButtons}
          </label>
        );
      case "checkbox" :
          var checkboxes = question.alternatives.map(
            function(alternative, index) {
              return ( 
                <label key={index}> 
                  {alternative} 
                  <input type="checkbox" value={alternative} /> 
                </label> 
              );
            });

        return ( 
          <label key={question.key}>
            {question.label}
            {checkboxes}
          </label>
        );
        break;
      default :
        console.log("Warning: unrecognized editable form element");
        return null;

    }
  });
}

var EventRegistration = React.createClass({
  getInitialState: function() {
    var events = publicEventStore.getEvents();
    console.log(events);
    return events[this.eventId()];
  },
  
  eventId: function() {
    return parseInt(this.props.params.eventId, 10);
  },

  render: function() {
    return (
      <div className="eventSettings">
        <Link to="/">Back to list of events</Link>
        <h1>{this.state.title}</h1> 
        {renderQuestions(this.state.registration_form)}
    </div>
    );
  }
});

module.exports = EventRegistration; 
