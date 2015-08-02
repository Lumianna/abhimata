var React = require('react');
var Bootstrap = require('react-bootstrap');

var recognizedFormElements = [
  {
    type: "text", 
    description : "Small textbox"
  },
  {
    type: "textarea", 
    description : "Big textbox"},
  {
    type: "radio", 
    description : "Radio button" },
  {
    type: "checkbox", 
    description : "Checkbox" },
  {
    type: "paragraph",
    description: "Paragraph"
  }
]; 

var MovementControls = React.createClass({
   deleteQuestion: function() {
    this.props.deleteQuestion(this.props.element.key);
  },

  moveUp: function() {
    this.props.moveQuestion(this.props.element.key, 
                            this.props.element.index - 1);
  },

  moveDown: function() {
    this.props.moveQuestion(this.props.element.key, 
                            this.props.element.index + 1);
  },
 
  render: function() {
    var deleteButton = null;
    if(this.props.element.isDeletable) {
      deleteButton = (
        <Bootstrap.Button onClick={this.deleteQuestion}>
          Delete
        </Bootstrap.Button>
      );
    }

    return (
      <div className="movement-controls">
        <Bootstrap.Button className="move-question-up"
                          onClick={this.moveUp}>
          Up
        </Bootstrap.Button>
        <Bootstrap.Button className="move-question-down"
                          onClick={this.moveDown}>
          Down
        </Bootstrap.Button>
        {deleteButton}
      </div>
    );
  }
  });

var GeneralEditControls = React.createClass({

  handleTitleChange: function(event) {
    this.props.onEdit("label", event.target.value);
  },

  handleIsOptionalChange: function(event) {
    this.props.onEdit("isResponseOptional", 
                      event.target.checked);
  },

  render: function() {
    var isOptionalCheckbox = null;
    if(this.props.element.isDeletable) {
      isOptionalCheckbox = (
        <Bootstrap.Input type="checkbox" 
                         label="Answering is optional"
                         onChange={this.handleIsOptionalChange}
                         checked={this.props.element.isResponseOptional}/>
      );
    }

    return (
      <div className="general-edit-controls">
        <Bootstrap.Input type="text"
                         label="Question title"
                         onChange={this.handleTitleChange} 
                         value={this.props.element.label}/>
        {isOptionalCheckbox}
        <MovementControls element={this.props.element}
                          deleteQuestion={this.props.deleteQuestion}
                          moveQuestion={this.props.moveQuestion}/>
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
          <Bootstrap.Input label={this.props.element.label}
                           type="textarea"
                           rows="4"/>
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
          <Bootstrap.Input type="text"
                           label={this.props.element.label} />
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
  
  render: function() {
    var labelIdPreview = "preview" + this.props.element.key;
    var labelIdTitle = "title" + this.props.element.key;
    var labelIdAlts = "alternatives" + this.props.element.key;
    var radioName = "radio" + this.props.element.key;
    
    var altsStr = this.props.element.alternatives.join("\n");
    
    var radioButtons = this.props.element.alternatives.map(
      function(alternative, index) {
        return (
          <Bootstrap.Input type="radio"
                           key={index}
                           label={alternative}
                           value={alternative} 
                           name={radioName} /> 
        );
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

          <Bootstrap.Input rows={this.props.element.alternatives.length}
                           type="textarea"
                           label="Alternatives"
                           onChange={this.handleAltsEdit}
                           value={altsStr}/>
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
          <Bootstrap.Input type="checkbox"
                           key={index}
                           label={alternative}
                           value={alternative} 
                           name={checkboxName} /> 
        );
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

          <Bootstrap.Input label="Alternatives"
                           type="textarea"
                           rows={this.props.element.alternatives.length}
                           onChange={this.handleAltsEdit}
                           value={altsStr}/>
        </div>
      </div> );
  }
});

// Component for selecting a form element to be added.
var FormElementSelector = React.createClass({
  getInitialState: function() {
    return {
      open: false,
    };
  },

  addFormElement: function(type) {
    this.close();
    this.props.onSelection(type);
  },

  open: function() {
    this.setState({ open: true });
  },

  close: function() {
    this.setState({ open: false });
  },

  render: function() {
    if(!this.state.open) {
      return (
        <Bootstrap.Button className="form-element-selector closed"
                          onClick={this.open}>
          Add new item here
        </Bootstrap.Button>
      );
    }
    else {
      var buttons = this.props.formElements.map(function(elem) {
        var clickHandler = this.addFormElement.bind(this, elem.type);
        return ( <label key={elem.type}> 
          <Bootstrap.Button onClick={clickHandler}
                            bsStyle="primary">
            {elem.description}
          </Bootstrap.Button>
        </label>
        );
      }.bind(this));
      return (
        <div className="form-element-selector open">
          <h2> Add a new question: </h2>
          {buttons}
          <Bootstrap.Button onClick={this.close}
                            className="cancel">
            Cancel
          </Bootstrap.Button>
        </div>
      );
    }
  }
});

var Paragraph = React.createClass({
  handleContentChange: function(event) {
    this.props.onEdit("content", event.target.value);
  },
  render: function() {
    return (
      <div className="editable-paragraph editable-form-element">
        <div className="preview">
          <p>{this.props.element.content}</p>
        </div>
        <div className="edit-controls">
          <div className="general-edit-controls">
            <Bootstrap.Input type="textarea"
                             label="Paragraph content"
                             value={this.props.element.content}
                             onChange={this.handleContentChange}
                             rows="4"/>
            <MovementControls element={this.props.element} 
                              moveQuestion={this.props.moveQuestion}
                              deleteQuestion={this.props.deleteQuestion}/> 
          </div>
        </div>
      </div> );

  }
});


var EditableForm = React.createClass({
  render: function() {
    var components = this.props.elements.map(function(elem, index) {
      var onEdit = this.props.editQuestion.bind(null, elem.key);
      var component;

      switch(elem.type) {
        case  "textarea" :
          component = ( 
            <EditableTextArea element={elem}
                              deleteQuestion={this.props.deleteQuestion}
                              moveQuestion={this.props.moveQuestion}
                              onEdit={onEdit} /> );
          break;
        case  "text" :
          component = ( 
            <EditableText element={elem} 
                          deleteQuestion={this.props.deleteQuestion}
                          moveQuestion={this.props.moveQuestion}
                          onEdit={onEdit} /> );
          break;
        case "radio" :
          component = ( 
            <EditableRadioButton element={elem} 
                                 deleteQuestion={this.props.deleteQuestion}
                                 moveQuestion={this.props.moveQuestion}
                                 onEdit={onEdit} /> );
          break;
        case "checkbox" :
          component = ( 
            <EditableCheckbox element={elem} 
                              deleteQuestion={this.props.deleteQuestion}
                              moveQuestion={this.props.moveQuestion}
                              onEdit={onEdit} /> );
          break;
        case "paragraph":
          component = (
            <Paragraph element={elem}
                       deleteQuestion={this.props.deleteQuestion}
                       moveQuestion={this.props.moveQuestion}
                       onEdit={onEdit} />
          );
          break;
        default :
          console.log("Warning: unrecognized editable form element");
          component = null;
          break;
      }

      if(component) {
        component = (
          <div key={elem.key}>
            {component}
            <FormElementSelector formElements={recognizedFormElements} 
                                 onSelection={this.props.addQuestion.bind(null, index + 1)}/>
          </div>
        );

        return component;
      }
    }.bind(this));

    return (
      <div className="editable-form"> 
        {components}
      </div>
    );
  }
});

module.exports = EditableForm;
