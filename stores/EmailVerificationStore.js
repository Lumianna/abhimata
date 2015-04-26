var itemStatus = require('../constants/constants.js').itemStatus;
var alt = require('../alt.js');

var RegistrationActions = require('../actions/RegistrationActions.js');

var _info = {};

function EmailVerificationStore() {
  this.bindActions(RegistrationActions);

  this.exportPublicMethods({
    getInfo: function(uuid) {
      if(!_info[uuid]) {
        return itemStatus.LOADING;
      }
      return _info[uuid];
    },
  });
}

EmailVerificationStore.prototype.onVerifyEmailSucceeded = function() {
  _info[payload.uuid] = {
    emailIsVerified: true
  };
};

EmailVerificationStore.prototype.onVerifyEmailFailed = function() {
  _info[payload.uuid] = itemStatus.NOT_AVAILABLE;
};


module.exports = alt.createStore(EmailVerificationStore, 'EmailVerificationStore');
