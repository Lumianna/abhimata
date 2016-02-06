var React = require('react');
var _ = require('lodash');
var ExportActions = require('../actions/ExportActions.js');
var ExportStore = require('../stores/ExportStore.js');
var Loading = require('./Loading.jsx');
var Bootstrap = require('react-bootstrap');

var Router = require('react-router');

function handleCheckboxClick(event_id, questionKey, event) {
  var questions = {};
  questions[questionKey] = event.target.checked;

  ExportActions.setQuestions({
    event_id: event_id,
    questions: questions
  });
}

function renderQuestion(event_id, storeState, question) {
  return (
    <div key={question.key}>
      <Bootstrap.Input type='checkbox'
                       checked={!!storeState[question.key]}
                       onChange={handleCheckboxClick.bind(null, event_id, question.key)}/>
      {question.label}
    </div>
  );
}

module.exports = React.createClass({
  mixins: [Router.State],

  getInitialState: function () {
    return this.getStoreState();
  },

  componentDidMount: function() {
    ExportStore.listen(this._onChange);
  },

  componentWillUnmount: function() {
    ExportStore.unlisten(this._onChange);
  },

  getStoreState: function () {
    return ExportStore.getEventState(this.props.event.event_id);
  },

  _onChange: function() {
    this.setState(this.getStoreState());
  },

  render: function() {
    var pdfUrl = 'events-private/' +
      this.props.event.event_id + '/participants.pdf';

    return (
      <div>
        <a href={pdfUrl}
           download="participants.pdf">
          Download forms submitted by participants as a PDF.
        </a>

        {_.map(this.props.event.registration_form.questions, renderQuestion.bind(null, this.props.event.event_id, this.state))}

      </div>
    );
  },
});
