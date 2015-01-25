var keyMirror = require('react/lib/keyMirror');

module.exports = {
  actionTypes: keyMirror({
    //Get public event data from server.
    REQUEST_PUBLIC_EVENT_LIST: null,
    REQUEST_PUBLIC_EVENT_LIST_SUCCESS: null,
    REQUEST_PUBLIC_EVENT_LIST_FAIL: null,
    REQUEST_PUBLIC_EVENT: null,
    REQUEST_PUBLIC_EVENT_SUCCESS: null,
    REQUEST_PUBLIC_EVENT_FAIL: null,
    //Get admin-only event data from server. 
    REQUEST_PRIVATE_EVENT_LIST: null,
    REQUEST_PRIVATE_EVENT_LIST_SUCCESS: null,
    REQUEST_PRIVATE_EVENT_LIST_FAIL: null,
    REQUEST_EVENT_DETAILS: null,
    REQUEST_EVENT_DETAILS_SUCCESS: null,
    REQUEST_EVENT_DETAILS_FAIL: null,
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
    //submitting & cancelling applications
    UPDATE_APPLICATION_ANSWER: null,
    SUBMIT_APPLICATION_REQUEST: null,
    SUBMIT_APPLICATION_SUCCESS: null,
    SUBMIT_APPLICATION_FAIL: null,
    CANCEL_REGISTRATION_REQUEST: null,
    CANCEL_REGISTRATION_SUCCESS: null,
    CANCEL_REGISTRATION_FAIL: null,
    GET_CANCELLATION_INFO_REQUEST: null,
    GET_CANCELLATION_INFO_SUCCESS: null,
    GET_CANCELLATION_INFO_FAIL: null,
    //admin authentication 
    REQUEST_LOGIN: null,
    REQUEST_LOGIN_SUCCESS: null,
    REQUEST_LOGIN_FAIL: null,
    REQUEST_LOGOUT_SUCCESS: null,
    REQUEST_LOGOUT_FAIL: null,
    AUTHENTICATION_FAILED: null,
    LOGIN_EXPIRED: null,
  }),

  // Values that store getters can return when a requested item isn't
  // available.
  itemStatus: keyMirror({
    LOADING: null,
    NOT_AVAILABLE: null,
  }),

  payloadSources: keyMirror({
    // The action came from the backend (e.g., fetched data)
    SERVER_ACTION: null,
    // This action came from the user (e.g., user submitted a form)
    VIEW_ACTION: null,
  })
}; 
