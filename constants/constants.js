var keyMirror = require('react/lib/keyMirror');

module.exports = {
  actionTypes : keyMirror({
    //Get public event data from server.
    REQUEST_EVENTS_PUBLIC : null,
    REQUEST_EVENTS_PUBLIC_SUCCESS : null,
    REQUEST_EVENTS_PUBLIC_FAIL : null,
    //Get admin-only event data from server. 
    REQUEST_EVENT_PRIVATE : null,
    REQUEST_EVENT_PRIVATE_SUCCESS : null,
    REQUEST_EVENT_PRIVATE_FAIL : null,
    //admin authentication 
    REQUEST_LOGIN : null,
    REQUEST_LOGIN_SUCCESS : null,
    REQUEST_LOGIN_FAIL : null,
    REQUEST_LOGOUT_TRY : null,
    REQUEST_LOGOUT_SUCCESS : null,
    REQUEST_LOGOUT_FAIL : null,
  }),
  payloadSources : keyMirror({
    SERVER_ACTION : null,
    VIEW_ACTION : null,
  })
}; 
