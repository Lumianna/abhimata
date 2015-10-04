var PrivateEventStore = require('./PrivateEventStore.js');
var _ = require('lodash');
var alt = require('../alt.js');

var ParticipantDraftActions = require('../actions/ParticipantDraftActions.js');
var RegistrationActions = require('../actions/RegistrationActions.js');

function ParticipantDraftStore() {
  this.bindActions(ParticipantDraftActions);

  this.draft = null;
  this.modalIsOpen = false;
}

// RegistrationActions

ParticipantDraftStore.prototype.openModal = function(participant) {
  if(participant) {
    this.modalIsOpen = true;
    this.draft = _.cloneDeep(participant);
  }
};

ParticipantDraftStore.prototype.closeModal = function() {
  this.modalIsOpen = false;
};

ParticipantDraftStore.prototype.updateProperty = function(payload) {
  if(this.draft) {
    this.draft[payload.property] = payload.value;
  }
};
  
module.exports = alt.createStore(ParticipantDraftStore, 'ParticipantDraftStore');
