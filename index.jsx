/** @jsx React.DOM */
var React = require('react');
var pkg = require('./package.json');

require('./main.less');

var recognizedFormElements = [
  { type : "text", 
    description : "Small textbox"},
  { type : "textarea", 
    description : "Big textbox"},
  { type : "radio", 
    description : "Radio button" },
  { type : "checkbox", 
    description : "Checkbox" }
  ]; 


//Editable textarea element
var EditableTextArea = React.createClass({
  handleChange: function(event) {
    this.props.onEdit("label", event.target.value);
  },

  render : function() {
    var labelIdPreview = "preview" + this.props.key;
    var labelIdEditable = "editable" + this.props.key;
    return (
      <div className="editable-textarea editable-form-element" key={this.props.key}>
        <div className="preview">
          <label htmlFor={labelIdPreview}> 
            {this.props.element.label} 
          </label>
          <textarea id={labelIdPreview} rows="4"/>
        </div>
        <div className="edit-controls">
      {/* <RequiredControl elemId={this.props.id} /> */}
          <label htmlFor="labelIdEditable"> Question title </label>
          <input id={labelIdEditable} type="text" onChange={this.handleChange} value={this.props.element.label}/>
        </div>
      </div> );
  }
});

//Editable input type=text element
var EditableText = React.createClass({
  handleChange: function(event) {
    this.props.onEdit("label", event.target.value);
  },

  render : function() {
    var labelIdPreview = "preview" + this.props.key;
    var labelIdEditable = "editable" + this.props.key;
    return (
      <div className="editable-text editable-form-element" key={this.props.key}>
        <div className="preview">
          <label htmlFor={labelIdPreview}> 
            {this.props.element.label} 
          </label>
          <input type="text" id={labelIdPreview} />
        </div>
        <div className="edit-controls">
      {/* <RequiredControl elemId={this.props.id} /> */}
          <label htmlFor="labelIdEditable"> Question title </label>
          <input id={labelIdEditable} type="text" onChange={this.handleChange} value={this.props.element.label}/>
        </div>
      </div> );
  }
});


var EditableText = React.createClass({
  handleChange: function(event) {
    this.props.onEdit("label", event.target.value);
  },

  render : function() {
    var labelIdPreview = "preview" + this.props.key;
    var labelIdEditable = "editable" + this.props.key;
    return (
      <div className="editable-text editable-form-element" key={this.props.key}>
        <div className="preview">
          <label htmlFor={labelIdPreview}> 
            {this.props.element.label} 
          </label>
          <input type="text" id={labelIdPreview} />
        </div>
        <div className="edit-controls">
      {/* <RequiredControl elemId={this.props.id} /> */}
          <label htmlFor="labelIdEditable"> Question title </label>
          <input id={labelIdEditable} type="text" onChange={this.handleChange} value={this.props.element.label}/>
        </div>
      </div> );
  }
});


// Component for selecting a form element to be added.
var FormElementSelector = React.createClass({

  addFormElement : function(type) {
    this.props.onSelection(type);
  },

  render : function() {
    var buttons = this.props.formElements.map(function(elem) {
      var clickHandler = this.addFormElement.bind(this, elem.type);
      return ( <label key={elem.type}> 
        <button onClick={clickHandler}>
          {elem.description}
        </button>
        </label>
             );
    }.bind(this));
    return (
      <div className="form-element-selector">
        <h2> Add a new question: </h2>
        {buttons}
      </div>
    );
  }
});

var EditableFormElement = function(type) {
  this.type = type;
  this.label = "?";
  this.required = true;
  if (type === "radio" || type === "checkbox") {
    this.alternatives = ["a", "b"]; 
  }
}

var EditableForm = React.createClass({
  getInitialState: function() {
    return {
      elements : [],
      nextKey : 0 // to generate keys
    };
  },

  addFormElement : function(type) {
    var elements = this.state.elements;
    var newElement = new EditableFormElement(type);
    newElement.key = this.state.nextKey;
    elements.push(newElement);
    this.setState({elements : elements, nextKey : this.state.nextKey + 1});
  },
  
  editFormElement : function(key, field, value) {
    var elements = this.state.elements;
    elements[key][field] = value;
    this.setState({elements : elements});
  },

  render: function() {
    var components = this.state.elements.map(function(elem) {
      switch(elem.type) {
        case  "textarea" :
var onEdit = this.editFormElement.bind(this, elem.key);
          return ( <EditableTextArea key={elem.key} element={elem}
                                     onEdit={onEdit} /> );
        break;
        case  "text" :
var onEdit = this.editFormElement.bind(this, elem.key);
          return ( <EditableText key={elem.key} element={elem} 
                                     onEdit={onEdit} /> );
        break;
        default :
          return null;
      }
    }.bind(this));;

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
