var stats = require('./stats');
var util = require('./util');
var bin = require('./bin');
var gen = require('./generate');

module.exports = function(values, f, options) {
  if (options === undefined) { options = f; f = null; }
  var opt = util.extend(stats.extent(values, f), options),
      b = bin(opt), i, j,
      h = gen.range(b.start, b.stop + b.step/2, b.step)
             .map(function(v) { return {value: v, count: 0}; });

  for (i=0; i<values.length; ++i) {
    j = b.index(f ? f(values[i]) : values[i]);
    h[j].count += 1;
  }
  h.bins = b;
  return h;
};