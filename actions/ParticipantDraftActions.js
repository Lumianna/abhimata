var alt = require('../alt.js');
var $ = require('jquery');
var _ = require('lodash');

var EventActions = require('./EventActions.js');

function ParticipantDraftActions() {
  this.generateActions(
    'openModal',
    'closeModal',
    'updateProperty',
    'saveDraftSucceeded',
    'saveDraftFailed'
  );
}

var UNEDITABLE_PROPERTIES = [
  'registration_id',
  'event_id',
  'name',
  'email',
  'submitted_form',
  'submission_date',
  'email_verified',
  'email_verification_code',
  'cancellation_code',
];

ParticipantDraftActions.prototype.saveDraft =
  function () {
    var that = this;
    var storeState = require('../stores/ParticipantDraftStore.js').getState();
    var draft = storeState.draft;
    var payload = _.cloneDeep(draft);

    _.each(UNEDITABLE_PROPERTIES, function(property) {
      delete payload[property];
    });
    
    this.dispatch();
    
    $.ajax({ 
      type: "POST",
      url: "events-private/" + draft.event_id + "/participants/" + draft.registration_id,
      data: JSON.stringify(payload),
      success: function(data) { 
        that.actions.saveDraftSucceeded();

        EventActions.requestEventDetails(draft.event_id);
      },
      error: function(data, textStatus) { 
        that.actions.saveDraftFailed();
      },
      dataType: "text",
      contentType: "application/json; charset=utf-8",
    });
  };




module.exports = alt.createActions(ParticipantDraftActions);
