var actionTypes = require('../constants/constants.js').actionTypes;
var createStore = require('../utils/createStore.js');
var publicEventStore = require('./publicEventStore.js');

var _ = require('lodash');

var _applications = {};

function makeDraft(event) {
  var draft = {};
  
  _.each(event.registration_form.questions, function(question) {
    var response;
    switch(question.type) {
      case "radio":
        response = 0;
        break;
      case "checkbox":
        response = _.map(question.alternatives, function() { return false; });
        break;
      default:
        response = "";
        break;
    }

    draft[question.key] = response;
  });
  
  return draft;
}

var actionHandler = function(payload) {
  var act = payload.action;
  var draft = _applications[act.event_id];

  switch(act.type) {
    case actionTypes.UPDATE_APPLICATION_ANSWER:
      draft[act.key] = act.value;
      eventApplicationStore.emitChange();
      break;

    case actionTypes.REQUEST_PUBLIC_EVENT_LIST_SUCCESS:
      var events = publicEventStore.getEvents();
      _.each(events, function(event) {
        if(!_applications[event.event_id]) {
          _applications[event.event_id] = makeDraft(event);
        }
      });
      eventApplicationStore.emitChange();
      break;

    default:
      //do nothing
      break;
  }
};

var eventApplicationStore = createStore(actionHandler, {
  getDraft: function(event_id) {
    if(!_applications[event_id]) {
      return undefined;
    }
    return _applications[event_id];
  },
});

module.exports = eventApplicationStore;
