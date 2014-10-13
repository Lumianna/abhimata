var actionTypes = require('../constants/constants.js').actionTypes;
var createStore = require('../utils/createStore.js');
var formUtils = require('../utils/editableForm.js');
var merge = require('react/lib/merge');


//Event data that can be obtained without authenticating.
var _eventsPublic = [];

//Event data that requires logging in as an admin.
var _eventsPrivate = [];



var actionHandler = function(payload) {
  var act = payload.action;
  var event = _eventsPrivate[act.event_id];
  switch(act.type) {
    case actionTypes.ADD_REGISTRATION_FORM_QUESTION:
      formUtils.addQuestion(event.registration_form,
        act.questionType);
      eventStore.emitChange(act.event_id);
      break;
    case actionTypes.UPDATE_REGISTRATION_FORM_QUESTION_PROPERTY:
      event.registration_form.questions[act.key][act.property] = act.value;
      eventStore.emitChange(act.event_id);
      break;
   case actionTypes.DELETE_REGISTRATION_FORM_QUESTION:
      formUtils.deleteQuestion(event.registration_form,
                               act.key);
      eventStore.emitChange(act.event_id);
      break;
    case actionTypes.MOVE_REGISTRATION_FORM_QUESTION:
      formUtils.moveQuestion(event.registration_form, 
                             act.key, act.toIndex);
      eventStore.emitChange(act.event_id);
      break;
    case actionTypes.DELETE_EVENT_SUCCESS:
      delete event;
      eventStore.emitChange(act.event_id);
      break;
    case actionTypes.UPDATE_EVENT_PROPERTY:
      event[act.property] = act.value;
      eventStore.emitChange(act.event_id);
      break;
    case actionTypes.REQUEST_EVENTS_PUBLIC_SUCCESS:
      _eventsPublic = act.events;
      eventStore.emitChange();
      break;
    case actionTypes.REQUEST_EVENT_PRIVATE_SUCCESS:
      _eventsPrivate[act.event.event_id] = act.event;
      eventStore.emitChange(act.event.event_id);
      break;
    default:
      //do nothing
      break;
  }
};

var eventStore = createStore(actionHandler, {
  getEventsPublic : function() {
    return _eventsPublic;
  },

  getEventPrivate : function(event_id) {
    return merge(_eventsPublic[event_id], 
                 _eventsPrivate[event_id]);
  },
});

module.exports = eventStore;
