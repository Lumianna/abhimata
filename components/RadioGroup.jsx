var React = require('react');
var Bootstrap = require('react-bootstrap');

module.exports = React.createClass({
  render: function() {
    var name = "radio_" + this.props.id;

    var radioButtons = _.map(
      this.props.alternatives,
      function(alternative, index) {
        return (
          <Bootstrap.Input type="radio"
                           value={alternative}
                           name={name}
                           key={index}
                           label={alternative}
                           checked={index === this.props.value ? true : null}
                           onChange={this.onChange.bind(this, index)}/>
        );
      }.bind(this));

    return(
      <div id={this.props.id} className="radio-group">
        {radioButtons}
      </div>
    );
  },

  onChange: function(index, event) {
    if(this.props.value !== index) {
      this.props.onChange(index);
    }
  },
});