var util = require('../util');

var PARSERS = {
  boolean: util.boolean,
  integer: util.number,
  number:  util.number,
  date:    util.date,
  string:  util.identity
};

var TESTS = {
  boolean: function(x) { return x==="true" || x==="false" || util.isBoolean(x); },
  integer: function(x) { return TESTS.number(x) && (x=+x) === ~~x; },
  number: function(x) { return !isNaN(+x) && !util.isDate(x); },
  date: function(x) { return !isNaN(Date.parse(x)); }
};

function type(values, f) {
  var v, i, n;

  // if data array has type annotations, use them
  if (values.types) {
    v = f(values.types);
    if (util.isString(v)) return v;
  }

  for (i=0, n=values.length; !util.isValid(v) && i<n; ++i) {
    v = f ? f(values[i]) : values[i];
  }
  return util.isDate(v) ? 'date' : util.isNumber(v) ? 'number' : 'string';
}

function infer(values, f) {
  var i, j, v;

  // types to test for, in precedence order
  var types = ['boolean', 'integer', 'number', 'date'];

  for (i=0; i<values.length; ++i) {
    // get next value to test
    v = f ? f(values[i]) : values[i];
    // test value against remaining types
    for (j=0; j<types.length; ++j) {
      if (util.isValid(v) && !TESTS[types[j]](v)) {
        types.splice(j, 1);
        j -= 1;
      }
    }
    // if no types left, return 'string'
    if (types.length === 0) return 'string';
  }

  return types[0];
}

function inferAll(data, fields) {
  fields = fields || util.keys(data[0]);
  return fields.reduce(function(types, f) {
    var type = infer(data, util.accessor(f));
    if (PARSERS[type]) types[f] = type;
    return types;
  }, {});
}

type.infer = infer;
type.inferAll = inferAll;
type.parsers = PARSERS;
module.exports = type;