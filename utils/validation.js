_ = require('lodash');
util = require('./misc.js');

var DEFAULT_KEY = "DEFAULT";

function getParser(schema, property) {
  var propChain = util.makePropChain(property);
  if(!propChain) {
    return undefined;
  }

  return _.reduce(propChain, function(prevProp, nextProp) {
    if(!prevProp) {
      return prevProp;
    } else {
      var next = prevProp[nextProp];

      // If nextProp doesn't exist in the schema, check if there's
      // a default
      if(!next) {
        if(_.isObject(prevProp)) {
          next = prevProp[DEFAULT_KEY];
        }

        if(_.isArray(prevProp) && prevProp.length === 1) {
          next = prevProp[0];
        }
      }

      return next;
    }
  }, schema);
}


function parseSingleProp(schema, propChain, value) {
  var parser = getParser(schema, propChain);

  return parser ? parser(value) : { value: value };
}


function makeValidationError(propChain, description) {
  return {
    propChain: propChain,
    message: propChain.join["."] + ": " + description,
  };
}


function mapOverSchemaProps(schema, obj, propChain, func) {
  var mappedObj = null;

  propChain = propChain || [];

  if(_.isFunction(schema)) {
    mappedObj = func(schema, obj, propChain);
  } else if (_.isArray(schema)) {
    if (!_.isArray(obj)) {
      throw makeValidationError(propChain, "expected an array");
    } else {
      // An array schema should only have one element; we assume
      // that array elements all have the same type
      mappedObj = _.map(obj, function(elem, index) {
        mapOverSchemaProps(schema[0], elem, propChain.concat(index), func);
      });
    }
  } else {
    if(!_.isObject(schema)) {
      var msg = "invalid schema: expected object, array, or function";
      throw makeValidationError(propChain, msg);
    }

    var schemaKeys = _.keys(schema);

    if (schemaKeys.length === 1 && schemaKeys[0] === DEFAULT_KEY) {
      mappedObj = _.mapValues(obj, function(prop, key) {
        return mapOverSchemaProps(prop, schema[DEFAULT_KEY],
                                  propChain.concat(key), func);
      });
    } else {
      mappedObj = _.cloneDeep(obj);
      _.each(schemaKeys, function(key) {
        mappedObj[key] = mapOverSchemaProps(schema[key], obj[key],
                                            propChain.concat(key), func);
      });
    }
  }

  return mappedObj;
}


function validateLeaf(schema, obj, propChain) {
  var validatedObj;
  
  var parsedVal = schema(obj);

  if(parsedVal.error) {
    throw makeValidationError(propChain, parsedVal.error);
  } else {
    return parsedVal.value;
  }
}


function validateObject(schema_, obj_, propChain_) {
  return mapOverSchemaProps(schema_, obj_, propChain_, validateLeaf);
}


function isValidationError(obj) {
  return _.keys(obj).length === 2 && !!obj.message && !!obj.propChain;
}


function parseAndValidate(schema, obj) {
  var validatedObj;
  try {
    validatedObj = validateObject(schema,obj);
    return validatedObj;
  }
  catch(error) {
    if(isValidationError(error)) {
      return error;
    } else {
      throw error;
    }
  }
}


module.exports = {
  getParser: getParser,
  isValidationError: isValidationError,
  mapOverSchemaProps: mapOverSchemaProps,
  parseSingleProp: parseSingleProp,
  parseAndValidate: parseAndValidate,
  validateObject: validateObject,
};
