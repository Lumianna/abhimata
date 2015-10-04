var React = require('react');
var SubmittedForm = require('./SubmittedForm.jsx');
var _ = require('lodash');
var Bootstrap = require('react-bootstrap');

var ParticipantDraftActions = require('../actions/ParticipantDraftActions.js');

var mandatoryStatuses = {
  cancelled: {
    text: 'Cancelled (check to reject application)',
  },

  on_waiting_list: {
    text: 'On waiting list',
  }
};

module.exports = React.createClass({
  handleCheckbox: function(property, event) {
    ParticipantDraftActions.updateProperty({
      property: property,
      value: event.target.checked
    });
  },

  handleText: function(property, event) {
    ParticipantDraftActions.updateProperty({
      property: property,
      value: event.target.value
    });
  },


  render: function() {
    var statuses = _.merge({}, mandatoryStatuses, this.props.optionalStatuses);
    var that = this;

    var checkboxes = _.map(statuses, function(status, statusKey) {
      return (
        <div key={statusKey}>
          <Bootstrap.Input type="checkbox" 
                           label={status.text}
                           checked={that.props.participant[statusKey]}
                           onChange={that.handleCheckbox.bind(null, statusKey)}/>
        </div>
      );
    });
    return (
      <div>
        <h3>Application status</h3>
        {checkboxes}
        <Bootstrap.Input type="textarea"
                         label="Notes"
                         value={this.props.participant.notes}
                         onChange={this.handleText.bind(null, 'notes')}/>
        <hr/>
        <h3>Submitted application</h3>
        <SubmittedForm registrationForm={this.props.event.registration_form}
                       submittedForm={this.props.participant.submitted_form}/>
      </div>
    );
  }
});
