var React = require('react');

var ValidatedInput = React.createClass({
  getInitialState: function() {
    var state = getStateFromProps();
    state.isValid = this.props.validator(state.contents);
    return state;
  },

  componentWillReceiveProps: function() {
    this.setState(getStateFromProps());
  },
  
  getStateFromProps: function() {
    return {
      return { contents: this.props.value};
    }
  },
  
  _onChange: function(event) {
    this.setState(fiel
  },

  render: function() {
    return (
      <label>
        {this.props.label}
        <input type="text" onChange={this._onChange}></input>
      </label>
    );
  }
});

module.exports = ValidatedInput;
