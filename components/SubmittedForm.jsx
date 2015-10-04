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

    if(question.type === "paragraph") {
      return null;
    }

    var key = question.key;
    var isRequired = question.isResponseOptional ? "" : " (required)";
    var header = (
        <h4>
          {question.label + isRequired}
        </h4> 
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

var SubmittedForm = React.createClass({
  render: function() {
    return (
      <div className="submitted-form">
        {renderForm(this.props.registrationForm,
                    this.props.submittedForm)}
      </div>
    );
  }
});

module.exports = SubmittedForm; 
