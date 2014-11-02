var keyMirror = require('react/lib/keyMirror');

module.exports = {
  actionTypes: keyMirror({
    //Get public event data from server.
    REQUEST_EVENTS_PUBLIC: null,
    REQUEST_EVENTS_PUBLIC_SUCCESS: null,
    REQUEST_EVENTS_PUBLIC_FAIL: null,
    //Get admin-only event data from server. 
    REQUEST_EVENT_PRIVATE: null,
    REQUEST_EVENT_PRIVATE_SUCCESS: null,
    REQUEST_EVENT_PRIVATE_FAIL: null,
    //Create and edit events (admin-only)
    CREATE_EVENT: null,
    CREATE_EVENT_SUCCESS: null,
    CREATE_EVENT_FAIL: null,
    UPDATE_EVENT_PROPERTY: null,
    SAVE_EVENT_SUCCESS: null,
    SAVE_EVENT_FAIL: null,
    DELETE_EVENT_SUCCESS: null,
    DELETE_EVENT_FAIL: null,
    ADD_REGISTRATION_FORM_QUESTION: null,
    UPDATE_REGISTRATION_FORM_QUESTION_PROPERTY: null,
    DELETE_REGISTRATION_FORM_QUESTION: null,
    MOVE_REGISTRATION_FORM_QUESTION: null,
    //admin authentication 
    REQUEST_LOGIN: null,
    REQUEST_LOGIN_SUCCESS: null,
    REQUEST_LOGIN_FAIL: null,
    REQUEST_LOGOUT_SUCCESS: null,
    REQUEST_LOGOUT_FAIL: null,
    AUTHENTICATION_FAILED: null,
    LOGIN_EXPIRED: null,
  }),

  payloadSources: keyMirror({
    SERVER_ACTION: null,
    VIEW_ACTION: null,
  })
}; 
