var React = require('react');
var _ = require('lodash');
var EventDraftActions = require('../actions/EventActions.js');
var Loading = require('./Loading.jsx');
var Bootstrap = require('react-bootstrap');

var Router = require('react-router');

function handleCheckboxClick(event_id, questionKey, event) {
  var questions = {};
  questions[questionKey] = event.target.checked;

  EventDraftActions.setQuestionExportStatuses({
    event_id: event_id,
    questions: questions
  });
}

function renderQuestion(event, question) {
  return (
    <div key={question.key}>
      <Bootstrap.Input type='checkbox'
                       checked={!!event.uiState.questionExportStatuses[question.key]}
                       onChange={handleCheckboxClick.bind(null, event.event_id, question.key)}/>
      {question.label}
    </div>
  );
}

module.exports = React.createClass({
  render: function() {
    var pdfUrl = 'events-private/' +
      this.props.event.event_id + '/participants.pdf';

    return (
      <div>
        <a href={pdfUrl}
           download="participants.pdf">
          Download forms submitted by participants as a PDF.
        </a>

        {_.map(this.props.event.registration_form.questions, renderQuestion.bind(null, this.props.event))}

      </div>
    );
  },
});
