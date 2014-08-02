/** @jsx React.DOM */
var React = require('react');
var pkg = require('./package.json');

require('./main.less');

var recognizedFormElements = [
  { type : "text", 
    label : "Small textbox"},
  { type : "textarea", 
    label : "Big textbox"},
  { type : "radio", 
    label : "Radio button" },
  { type : "checkbox", 
    label : "Checkbox" }
  ]; 


var FormElementSelector = React.createClass({

  addFormElement : function(type) {
    this.props.onSelection(type);
  },

  render : function() {
    var buttons = this.props.formElements.map(function(elem) {
      var clickHandler = this.addFormElement.bind(this, elem.type);
      return ( <label> 
        <button onClick={clickHandler}>
          {elem.label}
        </button>
        </label>
             );
    }.bind(this));
    return (
      <div className="formElementSelector">
        {buttons}
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
        <FormElementSelector formElements={recognizedFormElements} 
                             onSelection={this.addFormElement}/>
        {components}
      </div>
    );
  }
});

React.renderComponent(
  <EditableForm />

, document.body);
