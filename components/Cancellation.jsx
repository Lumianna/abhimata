var React = require('react');
var Router = require('react-router');

var CancellationStore = require('../stores/CancellationStore.js');
var itemStatus = require('../constants/constants.js').itemStatus;
var Loading = require('./Loading.jsx');
var RegistrationActions = require('../actions/RegistrationActions.js');

var Cancellation = React.createClass({
  mixins: [ Router.State ],
  
  getInitialState: function() {
    return {
      info: CancellationStore.getInfo(this.getParams().uuid)
    };
  },

  updateInfo: function() {
    this.setState({
      info: CancellationStore.getInfo(this.getParams().uuid)
    });
  },

  cancel: function() {
    RegistrationActions.cancel(this.getParams().uuid);
  },

  componentWillMount: function() {
    CancellationStore.listen(this.updateInfo);
    RegistrationActions.getCancellationInfo(this.getParams().uuid);
  },

  componentDidUnmount: function() {
    CancellationStore.unlisten(this.updateInfo);
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
          "{this.state.info.eventTitle}".</p>
      );
    } else {
      return(
        <div>
          <p>You are currently {registered} for the event
            "{this.state.info.eventTitle}". Are you sure you want to
            cancel your registration?</p>
          <button onClick={this.cancel}>Yes, I want to cancel</button>
        </div>
      );
    }
  }
});

module.exports = Cancellation;
