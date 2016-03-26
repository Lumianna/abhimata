var PrivateEventStore = require('./PrivateEventStore.js');
var EditableForm = require('../utils/editableForm.js');
var formFieldParsers = require('../utils/formFieldParsers.js');
var _ = require('lodash');
var alt = require('../alt.js');

var EventActions = require('../actions/EventActions.js');
var RegistrationActions = require('../actions/RegistrationActions.js');

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
  draft.uiState = {
    errors: {},
    exportSettings: {
      exportAllQuestions: true,
      oneParticipantPerPage: true,
      perQuestionToggles: {},
    },
  };

  return draft;
}

function validateEventDraft(event_id) {
  var draft = _eventDrafts[event_id];
  var event = validation.parseAndValidate(_eventSchema, draft);

  if(validation.isValidationError(event)) {
    return null;
  }

  delete event.hasUnsavedChanges;
  delete event.guestPasswordIsSet;
  delete event.uiState;
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
    util.setNestedPropSafely(eventDraft.uiState.errors, payload.property, parsedVal.error);
  } else {
    util.deleteNestedProp(eventDraft.uiState.errors, payload.property);
  }
};

EventDraftStore.prototype.onUpdateEmailReminder = function(payload) {
  var eventDraft = _eventDrafts[payload.event_id];

  eventDraft[payload.property] = payload.value;
  var error = _eventSchema[payload.property] &&
  _eventSchema[payload.property](payload.value).error;
  if(error) {
    eventDraft.uiState.errors[payload.property] = error;
  } else {
    delete eventDraft.uiState.errors[payload.property];
    eventDraft.hasUnsavedChanges = true;
  }

};

EventDraftStore.prototype.onAddQuestion = function(payload) {
  var eventDraft = _eventDrafts[payload.event_id];

  EditableForm.addElement(eventDraft.registration_form,
                           payload.questionType,
                           payload.index);
  eventDraft.hasUnsavedChanges = true;
};

EventDraftStore.prototype.onUpdateQuestionProperty = function(payload) {
  var eventDraft = _eventDrafts[payload.event_id];

  eventDraft.registration_form.questions[payload.key][payload.property] = payload.value;
  eventDraft.hasUnsavedChanges = true;
};

EventDraftStore.prototype.onDeleteQuestion = function(payload) {
  var eventDraft = _eventDrafts[payload.event_id];

  EditableForm.deleteElement(eventDraft.registration_form,
                              payload.key);
  eventDraft.hasUnsavedChanges = true;
};

EventDraftStore.prototype.onMoveQuestion = function(payload) {
  var eventDraft = _eventDrafts[payload.event_id];

  EditableForm.moveElement(eventDraft.registration_form, 
                             payload.key, payload.toIndex);
  eventDraft.hasUnsavedChanges = true;
};

EventDraftStore.prototype.onDeleteEventSucceeded = function(payload) {
  var eventDraft = _eventDrafts[payload.event_id];
  delete _eventDrafts[payload.event_id];
};

EventDraftStore.prototype.onRequestEventDetailsSucceeded = function(payload) {
  var currentDraft = _eventDrafts[payload.event.event_id];
  if(!currentDraft ||
     !currentDraft.hasUnsavedChanges) {
    var newDraft = makeEventDraft(payload.event);

    if (currentDraft) {
      newDraft.uiState.exportSettings = currentDraft.uiState.exportSettings;
    }

    _eventDrafts[payload.event.event_id] = newDraft;
  }
};

EventDraftStore.prototype.onSaveEventSucceeded = function(payload) {
  var eventDraft = _eventDrafts[payload.event_id];

  eventDraft.hasUnsavedChanges = false;
};

EventDraftStore.prototype.onSetQuestionExportStatuses = function(payload) {
  var eventDraft = _eventDrafts[payload.event_id];

  _.each(payload.questions, function(selected, key) {
    eventDraft.uiState.exportSettings.perQuestionToggles[key] = selected;
  });
};

EventDraftStore.prototype.onSetExportAllQuestions = function(payload) {
  var eventDraft = _eventDrafts[payload.event_id];

  eventDraft.uiState.exportSettings.exportAllQuestions = payload.value;
};

module.exports = alt.createStore(EventDraftStore, 'EventDraftStore');
