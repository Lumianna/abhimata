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

RegistrationStatusStore.prototype.onRequestCancellationEmailSucceeded = function(payload) {
  if(_info[payload.uuid]) {
    _info[payload.uuid].cancellationEmailRequestPending = false;
    _info[payload.uuid].cancellationEmailError = payload.errorMessage;
  }
};


 


module.exports = alt.createStore(RegistrationStatusStore, 'RegistrationStatusStore');
