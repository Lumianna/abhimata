var actionTypes = require('../constants/constants.js').actionTypes;
var createStore = require('../utils/createStore.js');
var privateEventStore = require('./privateEventStore.js');
var EditableForm = require('../utils/EditableForm.js');
var formFieldParsers = require('../utils/formFieldParsers.js');
var _ = require('lodash');

var util = require('../utils/misc.js');
var validation = require('../utils/validation.js');

var _eventDrafts = {};

// All the event properties that need parsing and validation
var _eventSchema = {
  max_participants: formFieldParsers.parsePositiveInteger,
  max_waiting_list_length: formFieldParsers.parsePositiveInteger,
//  email_reminders: {
//  DEFAULT: {
//    send_date: formFieldParsers.parseDate,
//  }
//}, 
};


function stringifyProp(schema, obj, propChain) {
  console.log(propChain);
  console.log(obj);
  return obj.toString();
}


function makeEventDraft(event) {
  var draft = validation.mapOverSchemaProps(_eventSchema, event, [],
                                            stringifyProp);

  draft.hasUnsavedChanges = false;
  draft.errors = {};
  
  return draft;
}


function validateEventDraft(draft) {
  var event = validation.parseAndValidate(_eventSchema, draft);

  if(validation.isValidationError(event)) {
    console.log(validatedDraft.message);
    return null;
  }

  delete event.errors;
  delete event.hasUnsavedChanges;
  return event;
}

var actionHandler = function(payload) {
  var act = payload.action;
  var event = privateEventStore.getEvent(act.event_id);
  var eventDraft = _eventDrafts[act.event_id];
  switch(act.type) {
    case actionTypes.UPDATE_EVENT_PROPERTY:
      util.setNestedProp(eventDraft, act.property, act.value);
      eventDraft.hasUnsavedChanges = true;

      eventDraftStore.emitChange(act.event_id);
      break;

    case actionTypes.VALIDATE_EVENT_PROPERTY:
      var value = util.getNestedProp(eventDraft, act.property);
      var parsedVal = validation.parseSingleProp(_eventSchema,
                                                 act.property, value);

      if(parsedVal.error) {
        util.setNestedPropSafely(eventDraft.errors, act.property, parsedVal.error);
      }

      eventDraftStore.emitChange(act.event_id);

      break;

    case actionTypes.UPDATE_EMAIL_REMINDER:
      eventDraft[act.property] = act.value;
      var error = _eventSchema[act.property] &&
        _eventSchema[act.property](act.value).error;
      if(error) {
        eventDraft.errors[act.property] = error;
      } else {
        delete eventDraft.errors[act.property];
        eventDraft.hasUnsavedChanges = true;
      }

      eventDraftStore.emitChange(act.event_id);
      break;


    case actionTypes.ADD_REGISTRATION_FORM_QUESTION:
      EditableForm.addQuestion(eventDraft.registration_form,
        act.questionType);
      eventDraft.hasUnsavedChanges = true;
      eventDraftStore.emitChange(act.event_id);
      break;

    case actionTypes.UPDATE_REGISTRATION_FORM_QUESTION_PROPERTY:
      eventDraft.registration_form.questions[act.key][act.property] = act.value;
      eventDraft.hasUnsavedChanges = true;
      eventDraftStore.emitChange(act.event_id);
      break;

   case actionTypes.DELETE_REGISTRATION_FORM_QUESTION:
      EditableForm.deleteQuestion(eventDraft.registration_form,
                               act.key);
      eventDraft.hasUnsavedChanges = true;
      eventDraftStore.emitChange(act.event_id);
      break;

    case actionTypes.MOVE_REGISTRATION_FORM_QUESTION:
      EditableForm.moveQuestion(eventDraft.registration_form, 
                             act.key, act.toIndex);
      eventDraft.hasUnsavedChanges = true;
      eventDraftStore.emitChange(act.event_id);
      break;

    case actionTypes.DELETE_EVENT_SUCCESS:
      delete _eventDrafts[act.event_id];
      eventDraftStore.emitChange(act.event_id);
      break;

    case actionTypes.REQUEST_EVENT_DETAILS_SUCCESS:
      if(!_eventDrafts[act.event.event_id] || 
         !_eventDrafts[act.event.event_id].hasUnsavedChanges) {
           _eventDrafts[act.event.event_id] = makeEventDraft(act.event);
      }

      eventDraftStore.emitChange(act.event.event_id);
      break;

    case actionTypes.SAVE_EVENT_SUCCESS:
      eventDraft.hasUnsavedChanges = false;
      break;

    default:
      //do nothing
      break;
  }
};

var eventDraftStore = createStore(actionHandler, {
  getEventDraft: function(event_id) {
    return _eventDrafts[event_id];
  },
  
  validateEventDraft: function(event_id) {
    return validateEventDraft(_eventDrafts[event_id]);
  }
});

module.exports = eventDraftStore;
