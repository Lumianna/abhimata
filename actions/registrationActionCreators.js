var dispatcher = require('../dispatcher/dispatcher.js');
var actionTypes = require('../constants/constants.js').actionTypes;

function updateApplicationAnswer(event_id, key, value) {
  var payload = {
    event_id: event_id,
    key: key,
    value: value,
    type: actionTypes.UPDATE_APPLICATION_ANSWER,
  };
  dispatcher.handleViewAction(payload);
}

function submit(event_id) {
  // TODO
}

module.exports = {
  updateApplicationAnswer: updateApplicationAnswer,
  submit: submit,
};
