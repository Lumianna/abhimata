var digitsOnly = /^\d+$/g;
var _ = require('lodash');

module.exports = {
  identity: function(str) {
    return { value: str };
  },

  parsePositiveInteger: function(str) {
    var num = parseInt(str, 10);
    if(!_.isNaN(num) && num > 0 && str.match(digitsOnly)) {
      return {
        value: num
      };
    } else {
      return {
        value: str,
        error: "Not a positive integer."
      };
    }
  }
};
