_ = require('lodash');

function makePropChain(props) {
  if(_.isArray(props)) {
    return props;
  }
  
  if(_.isString(props)) {
    return props.split(".");
  }
}

function getNestedProp(obj, property) {
  var propChain = makePropChain(property);
  if(!propChain) {
    return undefined;
  }

  return _.reduce(propChain, function(prevProp, nextProp) {
    return prevProp && prevProp[nextProp];
  }, obj);
}


function getParentProp(obj, property) {
  var propChain = makePropChain(property);
  return getNestedProp(obj, _.initial(propChain));
}


function setNestedProp(obj, property, value) {
  var propChain = makePropChain(property);
  var parentProp = getParentProp(obj, propChain) || obj;
  parentProp[_.last(propChain)] = value;
}


function setNestedPropSafely(obj, property, value) {
  var propChain = makePropChain(property);
  _.reduce(propChain, function(prevProp, nextProp) {
    if(!prevProp[nextProp])
    {
      prevProp[nextProp] = {};
    }
  }, obj);

  setNestedProp(obj, propChain, value);
}


function deleteNestedProp(obj, property) {
  var propChain = makePropChain(property);
  var parentProp = getNestedProp(obj, _.initial(propChain));
  delete parentProp[_.last(propChain)];
}


module.exports = {
  getNestedProp: getNestedProp,
  getParentProp: getParentProp,
  makePropChain: makePropChain,
  setNestedProp: setNestedProp,
  setNestedPropSafely: setNestedPropSafely,
  deleteNestedProp: deleteNestedProp,
};
