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
  switch(act.type) {
    case actionTypes.ADD_REGISTRATION_FORM_QUESTION:
      var newForm = formUtils.addQuestion(
        _eventsPrivate[act.event_id].registration_form,
        act.questionType);
      _eventsPrivate[act.event_id].registration_form = newForm;
      console.log(_eventsPrivate[act.event_id]);
      eventStore.emitChange(act.event_id);
      break;
    case actionTypes.UPDATE_REGISTRATION_FORM_QUESTION_PROPERTY:
      _eventsPrivate[act.event_id].registration_form[act.index][act.property] = act.value;
      eventStore.emitChange(act.event_id);
      break;
   case actionTypes.DELETE_REGISTRATION_FORM_QUESTION:
      formUtils.deleteQuestion(_eventsPrivate[act.event_id].registration_form,
                            act.index);
      eventStore.emitChange(act.event_id);
      break;
    case actionTypes.MOVE_REGISTRATION_FORM_QUESTION:
      var newForm = formUtils.move(
        _eventsPrivate[act.event_id].registration_form, 
        act.fromIndex, act.toIndex);
      _eventsPrivate[act.event_id].registration_form = newForm;
      eventStore.emitChange(act.event_id);
      break;
    case actionTypes.DELETE_EVENT_SUCCESS:
      _eventsPrivate[act.event_id] = undefined;
      eventStore.emitChange(act.event_id);
      break;
    case actionTypes.UPDATE_EVENT_PROPERTY:
      _eventsPrivate[act.event_id][act.property] = act.value;
      eventStore.emitChange(act.event_id);
      break;
    case actionTypes.REQUEST_EVENTS_PUBLIC_SUCCESS:
      _eventsPublic = payload.action.events;
      eventStore.emitChange();
      break;
    case actionTypes.REQUEST_EVENT_PRIVATE_SUCCESS:
      _eventsPrivate[payload.action.event.event_id] = payload.action.event;
      eventStore.emitChange(payload.action.event.event_id);
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
