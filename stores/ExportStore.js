var _ = require('lodash');
var alt = require('../alt.js');

var ExportActions = require('../actions/ExportActions.js');

var _eventStates = {};

function ensureEvent(event_id) {
  if (!_eventStates[event_id]) {
    _eventStates[event_id] = {};
  }
}

function ExportStore() {
  this.bindActions(ExportActions);

  this.exportPublicMethods({
    getEventState: function(event_id) {
      ensureEvent(event_id);

      return _eventStates[event_id];
    }
  });
}

ExportStore.prototype.onSetQuestions = function(payload) {
  ensureEvent(payload.event_id);

  _.each(payload.questions, function(selected, key) {
    _eventStates[payload.event_id][key] = selected;
  });
};

module.exports = alt.createStore(ExportStore, 'ExportStore');
