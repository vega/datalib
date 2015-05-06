var util = require('../util');

var tests = {
  bool: function(x) { return x==="true" || x==="false" || util.isBoolean(x); },
  date: function(x) { return !isNaN(Date.parse(x)); },
  num: function(x) { return !isNaN(+x) && !util.isDate(x); }
};

function infer(values, f) {
  var i, j, v;

  // types to test for
  var types = [
    {type: "boolean", test: tests.bool},
    {type: "number", test: tests.num},
    {type: "date", test: tests.date}
  ];

  for (i=0; i<values.length; ++i) {
    // get next value to test
    v = f ? f(values[i]) : values[i];
    // test value against remaining types
    for (j=0; j<types.length; ++j) {
      if (v != null && !types[j].test(v)) {
        types.splice(j, 1);
        j -= 1;
      }
    }
    // if no types left, return 'string'
    if (types.length === 0) return "string";
  }

  return types[0].type;
}

infer.table = function (data) {
  return util.keys(data[0]).reduce(function(types, c) {
    var type = infer(data, util.accessor(c));
    types[c] = type;
    return types;
  }, {});
};

module.exports = infer;