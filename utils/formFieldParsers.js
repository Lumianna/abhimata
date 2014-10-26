var digitsOnly = /^\d+$/g;

module.exports = {
  identity: function(str) {
    return { value: str };
  },
  parsePositiveInteger: function(str) {
    var num = parseInt(str, 10);
    if(!isNaN(num) && num > 0 && str.match(digitsOnly)) {
      return { value: num } ;
    } else {
      return { error: "Not a positive integer." } ;
    }
  }
};
