var React = require('react');

var $ = require('jquery');

var EventSettings = React.createClass({
  getInitialState : function() {
    return {
      title : "",
      signup_form : [],
    };
  },
  
  componentDidMount : function() {
    var url = "events/" + this.props.params.eventId;
    $.ajax({ 
      type : "GET",
      url : url,
      success : function(data) { 
        this.setState( data );
      }.bind(this),
      error : function(data, textStatus) { 
        console.log(data);
        console.log(textStatus);
        //this.setState({ error : "Invalid user name or password."});
      }.bind(this),
      dataType : "json"
    });

  },
  
  render : function() {
    return (<h1>{this.state.title}</h1>);
  }
});

module.exports = EventSettings;
