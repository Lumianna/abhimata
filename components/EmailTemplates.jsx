var React = require('react');

var $ = require('jquery');

var EmailTemplate = React.createClass({
  deleteTemplate: function() {
    this.props.deleteTemplate(this.props.element.key);
  },

  handleTitleChange: function(event) {
    this.props.onEdit("label", event.target.value);
  },

  render: function() {
    var subjectId = _.uniqueId("title");

    return (
      <div>
        <label for={subjectId}> 
          Subject
        </label>
        <input type="text"
               id={subjectId}
               onChange={this._onChange.bind(null, "subject")}/>
               value={this.props.template.subject}/>
        
        <label for={bodyId}> 
          Body
        </label>
        <input type="text"
               id={bodyId}
               onChange={this._onChange.bind(null, "body")}/>
               value={this.props.template.body}/>

        <label for={dateId}> 
          Send date
        </label>
        <input type="text"
               id={dateId}
               onChange={this._onChange.bind(null, "date")}/>
               value={this.props.template.date}/>

        <button onClick={this.delete}>Delete email reminder</button>
      </div> 
    );
  }
});

//Editable textarea element
var EditableTextArea = React.createClass({

  render : function() {
    var labelIdPreview = "preview" + this.props.element.key;
    var labelIdEditable = "editable" + this.props.element.key;
    return (
      <div className="editable-textarea editable-form-element">
        <div className="preview">
          <label htmlFor={labelIdPreview}> 
            {this.props.element.label} 
          </label>
          <textarea id={labelIdPreview} rows="4"/>
        </div>
        <div className="edit-controls">
          <GeneralEditControls element={this.props.element} 
                               moveQuestion={this.props.moveQuestion}
                               deleteQuestion={this.props.deleteQuestion}
                               onEdit={this.props.onEdit} /> 
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
    var labelIdPreview = "preview" + this.props.element.key;
    return (
      <div className="editable-text editable-form-element">
        <div className="preview">
          <label htmlFor={labelIdPreview}> 
            {this.props.element.label} 
          </label>
          <input type="text" id={labelIdPreview} />
        </div>
        <div className="edit-controls">
          <GeneralEditControls element={this.props.element} 
                               moveQuestion={this.props.moveQuestion}
                               deleteQuestion={this.props.deleteQuestion}
                               onEdit={this.props.onEdit} /> 
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
    var newLine = /\r\n|\r|\n/g;
    parsedAlts = altsString.split(newLine);
    this.props.onEdit("alternatives", parsedAlts);
  },
  
  render : function() {
    var labelIdPreview = "preview" + this.props.element.key;
    var labelIdTitle = "title" + this.props.element.key;
    var labelIdAlts = "alternatives" + this.props.element.key;
    var radioName = "radio" + this.props.element.key;
    
    var altsStr = this.props.element.alternatives.join("\n");
    
    var radioButtons = this.props.element.alternatives.map(
      function(alternative, index) {
        return ( 
          <label key={index}> 
            {alternative} 
            <input type="radio" value={alternative} 
                   name={radioName} /> 
          </label> );
      }.bind(this));
    return (
      <div className="editable-text editable-form-element">
        <div className="preview">
          <label htmlFor={radioName}> 
            {this.props.element.label} 
          </label>
          <div id={radioName}>
            {radioButtons}
          </div>
        </div>
        <div className="edit-controls">
          <GeneralEditControls element={this.props.element} 
                               moveQuestion={this.props.moveQuestion}
                               deleteQuestion={this.props.deleteQuestion}
                               onEdit={this.props.onEdit} /> 

          <label htmlFor="labelIdAlts"> Alternatives </label>
          <textarea id={labelIdAlts} rows={this.props.element.alternatives.length} onChange={this.handleAltsEdit} value={altsStr}/>
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
    var newLine = /\r\n|\r|\n/g;
    parsedAlts = altsString.split(newLine);
    this.props.onEdit("alternatives", parsedAlts);
  },
  
  render : function() {
    var labelIdPreview = "preview" + this.props.element.key;
    var labelIdTitle = "title" + this.props.element.key;
    var labelIdAlts = "alternatives" + this.props.element.key;
    var checkboxName = "checkbox" + this.props.element.key;
    
    var altsStr = this.props.element.alternatives.join("\n");
    
    var checkboxes = this.props.element.alternatives.map(
      function(alternative, index) {
        return ( 
          <label key={index}> 
            {alternative} 
            <input type="checkbox" value={alternative} 
                   name={checkboxName} /> 
          </label> );
      }.bind(this));
    return (
      <div className="editable-checkbox editable-form-element">
        <div className="preview">
          <label htmlFor={checkboxName}> 
            {this.props.element.label} 
          </label>
          <div id={checkboxName}>
            {checkboxes}
          </div>
        </div>
        <div className="edit-controls">
          <GeneralEditControls element={this.props.element} 
                               moveQuestion={this.props.moveQuestion}
                               deleteQuestion={this.props.deleteQuestion}
                               onEdit={this.props.onEdit} /> 

          <label htmlFor="labelIdAlts"> Alternatives </label>
          <textarea id={labelIdAlts} rows={this.props.element.alternatives.length} onChange={this.handleAltsEdit} value={altsStr}/>
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


var EmailTemplates = React.createClass({

  render: function() {
    var that = this;
    var templates = that.props.event.email_reminders.map(function(elem, index) {
      var onEdit = that.props.editQuestion.bind(null, elem.key);
      return (
        <EmailTemplate template={elem}
                       key={elem.reminder_id}
                       deleteTemplate={that.props.deleteQuestion}
                       onEdit={onEdit} />
      );
    });

    return (
      <div className="emailTemplateList"> 
        {templates}
        <button>Add new email reminder</button>
      </div>
    );
  }
});

module.exports = EditableForm;
