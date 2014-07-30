/** @jsx React.DOM */
var React = require('react');
var pkg = require('./package.json');


var FormElementSelector = React.createClass({

  formElements : [
    { type : "text", label : "Single-line textbox"},
    { type : "textarea", label : "Multi-line textbox"},
    //{ type : "radio", label : "Radio button" },
  ], 

  getInitialState : function() {
    return {type : "textarea"};
  },

  handleRadioClick : function(event) {
    this.setState({type : event.target.value});
    console.log(event.target.value);
  },

  addFormElement : function() {
    this.props.onSelection(this.state.type);
  },

  render : function() {
    var radioButtons = this.formElements.map(function(elem) {
      console.log(this);
      return ( <label> 
        <input type="radio" name="elementSelector" 
          value={elem.type} onClick={this.handleRadioClick} />
        {elem.label}
        </label>
             );
    }.bind(this));
    return (
      <div className="formElementSelector">
        {radioButtons}
        <button onClick={this.addFormElement}> Add form element </button>
      </div>
    );
  }
});

var EditableForm = React.createClass({
  getInitialState: function() {
    return {
      elements : []
    };
  },

  addFormElement : function(elem) {
    var newElements = this.state.elements;
    newElements.push(elem);
    this.setState({elements : newElements});
  },

  render: function() {
    var components = this.state.elements.map(function(elem) {
      switch(elem) {
        case  "textarea" :
          return ( <textarea rows="4" /> );
        break;
        case  "text" :
          return ( <input type="text" /> );
        break;
        default :
          return null;
      }
    });

    return (
      <div className="editableForm"> 
        <FormElementSelector onSelection={this.addFormElement}/>
        {components}
      </div>
    );
  }
});

React.renderComponent(
  <EditableForm />

, document.body);
