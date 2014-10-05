var React = require('react');

var $ = require('jquery');
var Router = require('react-router');
var Link = Router.Link;

var AuthenticatedRoute = require('../mixins/AuthenticatedRoute.js');

var EventSettings = React.createClass({
  mixins : [AuthenticatedRoute], 

  getInitialState : function() {
    return {
      title : "",
      signup_form : [],
    };
  },
  
  getData : function() {
    var url = "events/" + this.props.params.eventId;
    $.ajax({ 
      type : "GET",
      url : url,
      success : function(data) { 
        data.error = undefined;
        this.setState( data );
      }.bind(this),
      error : function(data, textStatus) { 
        console.log(data);
        this.setState( {error : data });
        //this.setState({ error : "Invalid user name or password."});
      }.bind(this),
      dataType : "json"
    });
  },
  
  componentDidMount : function() {
    this.getData();
  },
  
  render : function() {
    if(this.state.error) {
      return ( 
        <div>
          <p>Error: {this.state.error}</p>
          <Link to="/events">Back to event list.</Link>
        </div>);
    }
  
    return (
      <div className="eventSettings">
        <h1>{this.state.title}</h1> 
        {/*<EventSettingsLinks/>*/}
        <this.props.activeRouteHandler/>
    </div>
    );
  }
});

var EventGeneral = React.createClass({
  render : function() {
    return (<div></div> );
  }
});



module.exports = { 
  EventSettings : EventSettings,
  EventGeneral : EventGeneral,
  SignUpForm : null //SignUpForm
};
