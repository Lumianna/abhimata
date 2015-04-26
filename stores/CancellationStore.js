var itemStatus = require('../constants/constants.js').itemStatus;
var alt = require('../alt.js');
var RegistrationActions = require('../actions/RegistrationActions.js');

var _info = {};

function CancellationStore() {
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

CancellationStore.prototype.onRequestCancellationInfoSucceeded = function(payload) {
  _info[payload.uuid] = payload.info;
};

CancellationStore.prototype.onCancelRegistrationSucceeded = function(payload) {
  _info[payload.uuid].alreadyCancelled = true;
};

CancellationStore.prototype.onRequestCancellationInfoFailed = function(payload) {
  _info[payload.uuid] = itemStatus.NOT_AVAILABLE;
};


module.exports = alt.createStore(CancellationStore, 'CancellationStore');
