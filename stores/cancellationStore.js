var actionTypes = require('../constants/constants.js').actionTypes;
var itemStatus = require('../constants/constants.js').itemStatus;
var createStore = require('../utils/createStore.js');

var _info = {};

var actionHandler = function(payload) {
  var act = payload.action;

  switch(act.type) {
    case actionTypes.GET_CANCELLATION_INFO_SUCCESS:
      _info[act.uuid] = act.info;
      cancellationStore.emitChange();
      break;

    case actionTypes.CANCEL_REGISTRATION_SUCCESS:
      _info[act.uuid].alreadyCancelled = true;
      cancellationStore.emitChange();
      break;

    case actionTypes.GET_CANCELLATION_INFO_FAIL:
      _info[act.uuid] = itemStatus.NOT_AVAILABLE;
      cancellationStore.emitChange();
      break;

    default:
      //do nothing
      break;
  }
};

var cancellationStore = createStore(actionHandler, {
  getInfo: function(uuid) {
    if(!_info[uuid]) {
      return itemStatus.LOADING;
    }
    return _info[uuid];
  },
});

module.exports = cancellationStore;
