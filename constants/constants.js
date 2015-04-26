var keyMirror = require('react/lib/keyMirror');

module.exports = {
  actionTypes: keyMirror({
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
    VERIFY_EMAIL_SUCCESS: null,
    VERIFY_EMAIL_FAIL: null,
  }),

  // Values that store getters can return when a requested item isn't
  // available.
  itemStatus: keyMirror({
    LOADING: null,
    NOT_AVAILABLE: null,
  }),
}; 
