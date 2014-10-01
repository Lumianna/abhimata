var flux = require('flux');
var dispatcher = new flux.Dispatcher();
var payloadSources = require('../constants/constants.js').payloadSources;

dispatcher.handleServerAction = function (action) {
  if (!action.type) {
    throw new Error('Empty action.type: you probably mistyped the action.');
  }
  console.log('Dispatching server action ' + action.type);
  this.dispatch({
    source: payloadSources.SERVER_ACTION,
    action: action
  });
};


dispatcher.handleViewAction = function (action) {
  if (!action.type) {
    throw new Error('Empty action.type: you probably mistyped the action.');
  }
  console.log('Dispatching view action ' + action.type);
  this.dispatch({
    source: payloadSources.VIEW_ACTION,
    action: action
  });
}

module.exports = dispatcher;
