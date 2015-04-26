var PrivateEventStore = require('./PrivateEventStore.js');
var EditableForm = require('../utils/EditableForm.js');
var formFieldParsers = require('../utils/formFieldParsers.js');
var _ = require('lodash');
var alt = require('../alt.js');

var EventActions = require('../actions/EventActions.js');

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
  return obj.toString();
}


function makeEventDraft(event) {
  var draft = validation.mapOverSchemaProps(_eventSchema, event, [],
                                            stringifyProp);

  draft.hasUnsavedChanges = false;
  draft.errors = {};
  
  return draft;
}

function validateEventDraft(event_id) {
  var draft = _eventDrafts[event_id];
  var event = validation.parseAndValidate(_eventSchema, draft);

  if(validation.isValidationError(event)) {
    return null;
  }

  delete event.errors;
  delete event.hasUnsavedChanges;
  return event;
}

function EventDraftStore() {
  this.bindActions(EventActions);

  this.exportPublicMethods({
    getEventDraft: function(event_id) {
      return _eventDrafts[event_id];
    },

    validateEventDraft: validateEventDraft,
    
    getEventSchema: function() {
      return _eventSchema;
    }
  });
}

EventDraftStore.prototype.onUpdateEventProperty = function(payload) {
  var eventDraft = _eventDrafts[payload.event_id];

  util.setNestedProp(eventDraft, payload.property, payload.value);
  eventDraft.hasUnsavedChanges = true;
};

EventDraftStore.prototype.onValidateEventProperty = function(payload) {
  var eventDraft = _eventDrafts[payload.event_id];

  var value = util.getNestedProp(eventDraft, payload.property);
  var parsedVal = validation.parseSingleProp(_eventSchema,
                                                 payload.property, value);

  if(parsedVal.error) {
    util.setNestedPropSafely(eventDraft.errors, payload.property, parsedVal.error);
  }
};

EventDraftStore.prototype.onUpdateEmailReminder = function(payload) {
  var eventDraft = _eventDrafts[payload.event_id];

  eventDraft[payload.property] = payload.value;
  var error = _eventSchema[payload.property] &&
  _eventSchema[payload.property](payload.value).error;
  if(error) {
    eventDraft.errors[payload.property] = error;
  } else {
    delete eventDraft.errors[payload.property];
    eventDraft.hasUnsavedChanges = true;
  }

};

EventDraftStore.prototype.onAddQuestion = function(payload) {
  var eventDraft = _eventDrafts[payload.event_id];

  EditableForm.addQuestion(eventDraft.registration_form,
                           payload.questionType);
  eventDraft.hasUnsavedChanges = true;
};

EventDraftStore.prototype.onUpdateQuestionProperty = function(payload) {
  var eventDraft = _eventDrafts[payload.event_id];

  eventDraft.registration_form.questions[payload.key][payload.property] = payload.value;
  eventDraft.hasUnsavedChanges = true;
};

EventDraftStore.prototype.onDeleteQuestion = function(payload) {
  var eventDraft = _eventDrafts[payload.event_id];

  EditableForm.deleteQuestion(eventDraft.registration_form,
                              payload.key);
  eventDraft.hasUnsavedChanges = true;
};

EventDraftStore.prototype.onMoveQuestion = function(payload) {
  var eventDraft = _eventDrafts[payload.event_id];

  EditableForm.moveQuestion(eventDraft.registration_form, 
                             payload.key, payload.toIndex);
  eventDraft.hasUnsavedChanges = true;
};

EventDraftStore.prototype.onDeleteEventSucceeded = function(payload) {
  var eventDraft = _eventDrafts[payload.event_id];
  delete _eventDrafts[payload.event_id];
};

EventDraftStore.prototype.onRequestEventDetailsSucceeded = function(payload) {
  if(!_eventDrafts[payload.event.event_id] || 
     !_eventDrafts[payload.event.event_id].hasUnsavedChanges) {
       _eventDrafts[payload.event.event_id] = makeEventDraft(payload.event);
  }
};

EventDraftStore.prototype.onSaveEventSucceeded = function(payload) {
  var eventDraft = _eventDrafts[payload.event_id];

  eventDraft.hasUnsavedChanges = false;
};
  
module.exports = alt.createStore(EventDraftStore, 'EventDraftStore');
