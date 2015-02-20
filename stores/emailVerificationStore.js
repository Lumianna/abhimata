var actionTypes = require('../constants/constants.js').actionTypes;
var itemStatus = require('../constants/constants.js').itemStatus;
var createStore = require('../utils/createStore.js');

var _info = {};

var actionHandler = function(payload) {
  var act = payload.action;

  switch(act.type) {
    case actionTypes.VERIFY_EMAIL_SUCCESS:
      _info[act.uuid] = {
        emailIsVerified: true
      };
      verificationStore.emitChange();
      break;

    case actionTypes.VERIFY_EMAIL_FAIL:
      _info[act.uuid] = itemStatus.NOT_AVAILABLE;
      verificationStore.emitChange();
      break;

    default:
      //do nothing
      break;
  }
};

var verificationStore = createStore(actionHandler, {
  getInfo: function(uuid) {
    if(!_info[uuid]) {
      return itemStatus.LOADING;
    }
    return _info[uuid];
  },
});

module.exports = verificationStore;
