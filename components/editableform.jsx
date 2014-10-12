var React = require('react');

var $ = require('jquery');

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

var EditableRadioButton = React.createClass({
  handleLabelEdit: function(event) {
    this.props.onEdit("label", event.target.value);
  },
  
  handleAltsEdit: function(event) {
    var altsString = event.target.value;
    parsedAlts = altsString.split(",").map(function(x) { return x.trim(); });
    this.props.onEdit("alternatives", parsedAlts);
  },
  
  render : function() {
    var labelIdPreview = "preview" + this.props.key;
    var labelIdTitle = "title" + this.props.key;
    var labelIdAlts = "alternatives" + this.props.key;
    var radioName = "radio" + this.props.key;
    
    var altsStr = this.props.element.alternatives.join(",");
    
    var radioButtons = this.props.element.alternatives.map(
      function(alternative, index) {
        return ( 
          <label> 
            {alternative} 
            <input type="radio" value={alternative} 
                   key={index} name={radioName} /> 
          </label> );
      }.bind(this));
    return (
      <div className="editable-text editable-form-element" key={this.props.key}>
        <div className="preview">
          <label htmlFor={radioName}> 
            {this.props.element.label} 
          </label>
          <div id={radioName}>
            {radioButtons}
          </div>
        </div>
        <div className="edit-controls">
      {/* <RequiredControl elemId={this.props.id} /> */}
          <label htmlFor="labelIdTitle"> Question title </label>
          <input id={labelIdTitle} type="text" onChange={this.handleLabelEdit} value={this.props.element.label}/>
          <label htmlFor="labelIdAlts"> Alternatives </label>
          <input id={labelIdAlts} type="text" onChange={this.handleAltsEdit} value={altsStr}/>
        </div>
      </div> );
  }
});


var EditableCheckbox = React.createClass({
  handleLabelEdit: function(event) {
    this.props.onEdit("label", event.target.value);
  },
  
  handleAltsEdit: function(event) {
    var altsString = event.target.value;
    parsedAlts = altsString.split(",").map(function(x) { return x.trim(); });
    this.props.onEdit("alternatives", parsedAlts);
  },
  
  render : function() {
    var labelIdPreview = "preview" + this.props.key;
    var labelIdTitle = "title" + this.props.key;
    var labelIdAlts = "alternatives" + this.props.key;
    var checkboxName = "checkbox" + this.props.key;
    
    var altsStr = this.props.element.alternatives.join(",");
    
    var checkboxes = this.props.element.alternatives.map(
      function(alternative, index) {
        return ( 
          <label> 
            {alternative} 
            <input type="checkbox" value={alternative} 
                   key={index} name={checkboxName} /> 
          </label> );
      }.bind(this));
    return (
      <div className="editable-checkbox editable-form-element" key={this.props.key}>
        <div className="preview">
          <label htmlFor={checkboxName}> 
            {this.props.element.label} 
          </label>
          <div id={checkboxName}>
            {checkboxes}
          </div>
        </div>
        <div className="edit-controls">
      {/* <RequiredControl elemId={this.props.id} /> */}
          <label htmlFor="labelIdTitle"> Question title </label>
          <input id={labelIdTitle} type="text" onChange={this.handleLabelEdit} value={this.props.element.label}/>
          <label htmlFor="labelIdAlts"> Alternatives </label>
          <input id={labelIdAlts} type="text" onChange={this.handleAltsEdit} value={altsStr}/>
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


var EditableForm = React.createClass({

  render: function() {
    var components = this.props.elements.map(function(elem, index) {
      var onEdit = this.props.editQuestion.bind(null, index);
      switch(elem.type) {
        case  "textarea" :
          return ( <EditableTextArea key={elem.key} element={elem}
                                     onEdit={onEdit} /> );
          break;
        case  "text" :
          return ( <EditableText key={elem.key} element={elem} 
                                 onEdit={onEdit} /> );
          break;
        case "radio" :
          return ( <EditableRadioButton key={elem.key} element={elem} 
                                        onEdit={onEdit} /> );
        case "checkbox" :
          return ( <EditableCheckbox key={elem.key} element={elem} 
                                        onEdit={onEdit} /> );
          break;
        default :
          console.log("Warning: unrecognized editable form element");
          return null;
      }
    }.bind(this));

    return (
      <div className="editableForm"> 
        <FormElementSelector formElements={recognizedFormElements} 
                             onSelection={this.props.addQuestion}/>
        {components}
      </div>
    );
  }
});

module.exports = EditableForm;
