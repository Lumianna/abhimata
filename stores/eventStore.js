var actionTypes = require('../constants/constants.js').actionTypes;
var createStore = require('../utils/createStore.js');
var editableForm = require('../utils/editableForm.js');
var formFieldParsers = require('../utils/formFieldParsers.js');
var merge = require('react/lib/merge');
var _ = require('lodash');


//Event data that can be obtained without authenticating.
var _eventsPublic = [];

//Event data that requires logging in as an admin.
var _eventsPrivate = {};

var _eventDrafts = {};

// All the event properties that need parsing and validation
var _eventPropertyParsers = {
  max_participants: formFieldParsers.parsePositiveInteger,
  max_waiting_list_length: formFieldParsers.parsePositiveInteger,
};


function makeEventDraft(event) {
  var draft = _.cloneDeep(event);
  _.each(_eventPropertyParsers, function(__, key) { 
    draft[key] = draft[key] + ""; 
  });
  draft.hasUnsavedChanges = false;
  draft.errors = {};
  
  return draft;
}

function validateEventDraft(draft) {
  if(!_.isEmpty(draft.errors)) {
    return null;
  }
  
  var parsedFields = _.mapValues(_eventPropertyParsers, function(parser, key) {
    return parser(draft[key], draft).value;
  });
  
  if(!_.all(parsedFields)) {
    return null;
  }
  
  var event = _.cloneDeep(draft);
  
  _.extend(event, parsedFields);

  delete event.errors;
  delete event.hasUnsavedChanges;
  return event;
}

var actionHandler = function(payload) {
  var act = payload.action;
  var event = _eventsPrivate[act.event_id];
  var eventDraft = _eventDrafts[act.event_id];
  switch(act.type) {
    case actionTypes.ADD_REGISTRATION_FORM_QUESTION:
      editableForm.addQuestion(eventDraft.registration_form,
        act.questionType);
      eventDraft.hasUnsavedChanges = true;
      eventStore.emitChange(act.event_id);
      break;
    case actionTypes.UPDATE_REGISTRATION_FORM_QUESTION_PROPERTY:
      eventDraft.registration_form.questions[act.key][act.property] = act.value;
      eventDraft.hasUnsavedChanges = true;
      eventStore.emitChange(act.event_id);
      break;
   case actionTypes.DELETE_REGISTRATION_FORM_QUESTION:
      editableForm.deleteQuestion(eventDraft.registration_form,
                               act.key);
      eventDraft.hasUnsavedChanges = true;
      eventStore.emitChange(act.event_id);
      break;
    case actionTypes.MOVE_REGISTRATION_FORM_QUESTION:
      editableForm.moveQuestion(eventDraft.registration_form, 
                             act.key, act.toIndex);
      eventDraft.hasUnsavedChanges = true;
      eventStore.emitChange(act.event_id);
      break;
    case actionTypes.DELETE_EVENT_SUCCESS:
      delete _eventsPrivate[act.event_id];
      delete _eventDrafts[act.event_id];
      eventStore.emitChange(act.event_id);
      break;
    case actionTypes.UPDATE_EVENT_PROPERTY:
      eventDraft[act.property] = act.value;
      var error = _eventPropertyParsers[act.property] &&
        _eventPropertyParsers[act.property](act.value).error;
      if(error) {
        eventDraft.errors[act.property] = error;
      } else {
        delete eventDraft.errors[act.property];
        eventDraft.hasUnsavedChanges = true;
      }

      eventStore.emitChange(act.event_id);
      break;

    case actionTypes.REQUEST_EVENTS_PUBLIC_SUCCESS:
      _eventsPublic = act.events;
      eventStore.emitChange();
      break;
    case actionTypes.REQUEST_EVENT_PRIVATE_SUCCESS:
      _eventsPrivate[act.event.event_id] = act.event;
      if(!_eventDrafts[act.event.event_id] || 
         !_eventDrafts[act.event.event_id].hasUnsavedChanges) {
        _eventDrafts[act.event.event_id] = makeEventDraft(act.event);
      }
      eventStore.emitChange(act.event.event_id);
      break;
    default:
      //do nothing
      break;
  }
};

var eventStore = createStore(actionHandler, {
  getEventsPublic: function() {
    return _eventsPublic;
  },

  getEventPrivate: function(event_id) {
    return _eventsPrivate[event_id];
  },
  
  getEventDraft: function(event_id) {
    return _eventDrafts[event_id];
  },
  
  validateEventDraft: function(event_id) {
    return validateEventDraft(_eventDrafts[event_id]);
  }

});

module.exports = eventStore;
