var itemStatus = require('../constants/constants.js').itemStatus;
var alt = require('../alt.js');

var RegistrationActions = require('../actions/RegistrationActions.js');

var _info = {};

function RegistrationStatusStore() {
  this.bindActions(RegistrationActions);

  this.exportPublicMethods({
    getStatus: function(uuid) {
      if(!_info[uuid]) {
        return itemStatus.LOADING;
      }
      return _info[uuid];
    },
  });
}

RegistrationStatusStore.prototype.onGetRegistrationStatusSucceeded = function(payload) {
  _info[payload.uuid] = payload.statusData;
};

RegistrationStatusStore.prototype.onGetRegistrationStatusFailed = function(payload) {
  _info[payload.uuid] = itemStatus.NOT_AVAILABLE;
};

RegistrationStatusStore.prototype.onRequestCancellationEmail = function(uuid) {
  if(_info[uuid]) {
    _info[uuid].cancellationEmailRequestPending = true;
  }
};

RegistrationStatusStore.prototype.onRequestCancellationEmailSucceeded = function(payload) {
  if(_info[payload.uuid]) {
    _info[payload.uuid].cancellationEmailRequestPending = false;
    _info[payload.uuid].cancellationEmailSent = true;
  }
};

RegistrationStatusStore.prototype.onRequestCancellationEmailFailed = function(payload) {
  var status = _info[payload.uuid];
  if(status) {
    var message = payload.errorMessage;

    status.cancellationEmailRequestPending = false;
    if(message.responseText) {
      status.cancellationEmailError = message.responseText +
        " (" + message.status + " " + message.statusText + ")";
    } else {
      status.cancellationEmailError = "Could not connect to the server. If your internet connection is working, the server might be down. Try again later.";
    }
  }
};


 


module.exports = alt.createStore(RegistrationStatusStore, 'RegistrationStatusStore');
