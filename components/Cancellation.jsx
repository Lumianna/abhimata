var React = require('react');
var Router = require('react-router');

var RegistrationStatusStore = require('../stores/RegistrationStatusStore.js');
var itemStatus = require('../constants/constants.js').itemStatus;
var Loading = require('./Loading.jsx');
var RegistrationActions = require('../actions/RegistrationActions.js');

var Cancellation = React.createClass({
  mixins: [ Router.State ],
  
  getInitialState: function() {
    return {
      info: RegistrationStatusStore.getStatus(this.getParams().uuid)
    };
  },

  updateInfo: function() {
    this.setState({
      info: RegistrationStatusStore.getStatus(this.getParams().uuid)
    });
  },

  cancel: function() {
    RegistrationActions.cancel(this.getParams().uuid);
  },

  componentWillMount: function() {
    RegistrationStatusStore.listen(this.updateInfo);
    RegistrationActions.getRegistrationStatusByCancellationUUID(this.getParams().uuid);
  },

  componentDidUnmount: function() {
    RegistrationStatusStore.unlisten(this.updateInfo);
  },

  render: function() {
    if(this.state.info === itemStatus.LOADING) {
      return (<Loading/>);
    }

    if(this.state.info === itemStatus.NOT_AVAILABLE) {
      return (
        <p> The cancellation code {this.getParams().uuid} seems to be
          invalid, or there was a problem with the server. Please try again
          later or contact the event managers. </p>
      );
    }

    var registered = this.state.info.onWaitingList ?
                     "on the waiting list" :
                     "signed up";

    if(this.state.info.alreadyCancelled) {
      return(
        <p>You are no longer {registered} for the event
          "{this.state.info.event.title}".</p>
      );
    } else {
      return(
        <div>
          <p>You are currently {registered} for the event <em>{this.state.info.event.title}</em>. Are you sure you want to
            cancel your registration?</p>
          <button onClick={this.cancel}>Yes, I want to cancel</button>
        </div>
      );
    }
  }
});

module.exports = Cancellation;
