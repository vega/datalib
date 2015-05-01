var stats = require('./stats');
var util = require('./util');
var bin = require('./bin');
var gen = require('./generate');

module.exports = function(values, f, options) {
  if (options === undefined) { options = f; f = null; }

  var type = options && options.type || infertype(values, f);
  if (type !== 'number' && type !== 'date' && type !== 'integer') {
    return categorical(values, f, options && options.sort);
  }

  var ext = stats.extent(values, f),
      opt = util.extend({min: ext[0], max: ext[1]}, options);
  if (type === 'integer' && opt.minstep == null) opt.minstep = 1;
  var b = type === 'date' ? bin.date(opt) : bin(opt);
  return numerical(values, f, b);
};

function infertype(values, f) {
  var v = null, i;
  for (i=0; !util.isNotNull(v) && i<values.length; ++i) {
    v = f ? f(values[i]) : values[i];
  }
  return util.isDate(v) ? 'date' : util.isNumber(v) ? 'number' : 'string';
}

function numerical(values, f, b) {
  var h = gen.range(b.start, b.stop + b.step/2, b.step)
    .map(function(v) { return {value: b.value(v), count: 0}; });

  for (var i=0, v, j; i<values.length; ++i) {
    v = f ? f(values[i]) : values[i];
    if (util.isNotNull(v)) {
      j = b.index(v);
      if (j < 0 || j >= h.length || !isFinite(j)) continue;
      h[j].count += 1;
    }
  }
  h.bins = b;
  return h;
}

function categorical(values, f, sort) {
  var c = stats.unique(values, f).counts;
  return util.keys(c)
    .map(function(k) { return {value: k, count: c[k]}; })
    .sort(util.comparator(sort ? "-count" : "+value"));
}