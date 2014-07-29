/** @jsx React.DOM */
var React = require('react');
var pkg = require('./package.json');

var EditableForm = React.createClass({
  getInitialState: function() {
    return {
      elements : []
    };
  },
  
  addTextBox : function() {
    var newElements = this.state.elements.concat(["textbox"]);
    this.setState({elements : newElements});
  },
    
  render: function() {
    var components = this.state.elements.map(function(elem) {
      if (elem === "textbox") {
        return ( <input type="text" /> );
      }
    });

    return (
      <div className="editableForm"> 
        <button onClick={this.addTextBox}>
          Moar boxen!
        </button>
        {components}
      </div>
    );
  }
});

React.renderComponent(
  <EditableForm />

, document.body);
