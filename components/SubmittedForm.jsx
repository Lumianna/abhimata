var React = require('react');

var _ = require('lodash');
var Router = require('react-router');
var Link = Router.Link;

var itemStatus = require('../constants/constants.js').itemStatus;

var Loading = require('./Loading.jsx');

function renderForm(registrationForm, submittedForm) {
  var fields = _.map(registrationForm.order, function(key) { 
    return {
      question: registrationForm.questions[key],
      answer: submittedForm[key]
    };
  });
  
  return _.map(fields, function(field) {
    var question = field.question;
    var key = question.key;
    var isRequired = question.isResponseOptional ? "" : " (required)";
    var header = (
        <h3>
          {question.label + isRequired}
        </h3> 
    );

    var noResponse = (<em>(no response)</em>);

    var response;

    var responseData = submittedForm[key];

    switch(question.type) {
      case  "textarea" :
      case  "text" :
        response = responseData || noResponse;
        break;

      case "radio" :
        response = responseData < 0 ? noResponse :
                   question.alternatives[responseData];
        break;
        
      case "checkbox" :
        if(!_.some(responseData)) {
          response = noResponse;
        } else {
          var alts = _.map(responseData, function(checked, index) {
            return checked ? null :
                   (<li key={index}>{question.alternatives[index]}</li>);
          });

            response = (<ul> {alts} </ul>);
        }
        break;

      default :
        console.log("Warning: unrecognized editable form element");
        return null;
    }

    return (
      <div className="submitted-form-field"
           key={question.key}>
        {header}
        {response}
      </div>
    );
  });
}

function getParticipant(registrations, registration_id) {
  var regs = registrations.participants.concat(registrations.waitingList,
                                               registrations.cancelled);
  
  return _.find(regs, function(reg) {
    return reg.registration_id === registration_id;
  });

}

var SubmittedForm = React.createClass({
  mixins: [ Router.State ],

  getInitialState: function() {
    var registration_id = parseInt(this.getParams().registrationId, 10);
    return { 
      registration_id: registration_id,
    };
  },
  
  componentWillReceiveProps: function(nextProps) {
    this.setState({ 
      registration_id: parseInt(this.getParams().registrationId, 10) 
    });
  },
  
  render: function() {
    var participant = getParticipant(this.props.event.registrations,
                                     this.state.registration_id);

    if(!participant) {
      return (
        <div>
          <p>The registration you tried to access does not seem to exist.</p>
          <Link to="participants" params={{eventId: this.props.event.event_id}}>
            Back to list of participants
          </Link>
        </div>
      );
    }

    return (
      <div className="submitted-form">
        <Link to="participants" params={{eventId: this.props.event.event_id}}>
          Back to list of participants
        </Link>
        <h2>Application submitted by {participant.name}</h2>
        {renderForm(this.props.event.registration_form,
                    participant.submitted_form)}
      </div>
    );
  }
});

module.exports = SubmittedForm; 
