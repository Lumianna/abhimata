var React = require('react');
var _ = require('lodash');
var EventActions = require('../actions/EventActions.js');
var Loading = require('./Loading.jsx');
var Bootstrap = require('react-bootstrap');
var RadioGroup = require('./RadioGroup.jsx');

var Router = require('react-router');

function handleCheckboxClick(event_id, questionKey, event) {
  var questions = {};
  questions[questionKey] = event.target.checked;

  EventActions.setQuestionExportStatuses({
    event_id: event_id,
    questions: questions
  });
}

function renderQuestion(event, question) {
  return (
    <div key={question.key}>
      <Bootstrap.Input type='checkbox'
                       checked={!!event.uiState.exportSettings.perQuestionToggles[question.key]}
                       onChange={handleCheckboxClick.bind(null, event.event_id, question.key)}/>
      {question.label}
    </div>
  );
}

var QuestionPicker = React.createClass({
  toggleAll: function(value) {
    var questions = _.mapValues(this.props.event.registration_form.questions, function(question) {
      return value;
    });

    EventActions.setQuestionExportStatuses({
      event_id: this.props.event.event_id,
      questions: questions
    });
  },

  render: function() {
    return (
      <div>
        <Bootstrap.Button onClick={this.toggleAll.bind(null, true)}>
          Select all
        </Bootstrap.Button>
        <Bootstrap.Button onClick={this.toggleAll.bind(null, false)}>
          Deselect all
        </Bootstrap.Button>
        {_.map(this.props.event.registration_form.questions, renderQuestion.bind(null, this.props.event))}
      </div>
    );
  }
});

var RADIO_ALTS = ['Export all questions', 'Select questions to export'];

module.exports = React.createClass({
  handleRadioClick: function(index) {
    EventActions.setExportAllQuestions({
      event_id: this.props.event.event_id,
      value: index === 0,
    });
  },

  render: function() {
    var pdfUrl = 'events-private/' +
      this.props.event.event_id + '/participants.pdf';

    var exportAllQuestions = this.props.event.uiState.exportSettings.exportAllQuestions;

    var radioValue = exportAllQuestions ? 0 : 1;

    return (
      <div>

        <RadioGroup alternatives={RADIO_ALTS}
                    value={radioValue}
                    id='toggleExportAll'
                    onChange={this.handleRadioClick}/>

        {!exportAllQuestions && <QuestionPicker event={this.props.event}/>}

        <a href={pdfUrl}
           download="participants.pdf">
          Download forms submitted by participants as a PDF.
        </a>
      </div>
    );
  },
});
