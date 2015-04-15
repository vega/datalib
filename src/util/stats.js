var util = require('./index');
var stats = {};

stats.unique = function(data, f, results) {
  if (!util.isArray(data) || data.length===0) return [];
  f = f || util.identity;
  results = results || [];
  var u = {}, v, i;
  for (i=0, n=data.length; i<n; ++i) {
    v = f(data[i]);
    if (v in u) continue;
    u[v] = 1;
    results.push(v);
  }
  return results;
};

stats.uniq = function(data, f) {
  if (!util.isArray(data) || data.length===0) return 0;
  f = f || util.identity;
  var u = {}, v, i, count = 0;;
  for (i=0, n=data.length; i<n; ++i) {
    v = f(data[i]);
    if (v in u) continue;
    u[v] = 1;
    count += 1;
  }
  return count;
};

stats.median = function(values) {
  values.sort(util.cmp);
  var half = Math.floor(values.length/2);
  if (values.length % 2) {
    return values[half];
  } else {
    return (values[half-1] + values[half]) / 2.0;
  }
};

stats.mean = function(values) {
  var mean = 0, delta, i, c, v;
  for (i=0, c=0; i<values.length; ++i) {
    v = values[i];
    if (v != null) {
      delta = values[i] - mean;
      mean = mean + delta / (++c);
    }
  }
  return mean;
};

stats.variance = function(values) {
  var mean = 0, M2, delta, i, c, v;
  for (i=0, c=0; i<values.length; ++i) {
    v = values[i];
    if (v != null) {
      delta = values[i] - mean;
      mean = mean + delta / (++c);
      M2 = M2 + delta * (v - mean);
    }
  }
  M2 = M2 / (len - 1);
  return M2;
};

stats.stdev = function(values) {
  return Math.sqrt(stats.variance(values));
};

stats.skew = function(values) {
  var avg = stats.mean(values),
      med = stats.median(values),
      std = stats.stdev(values);
  return 1.0 * (avg - med) / std;
};

stats.minmax = function(data) {
  var s = {min: +Infinity, max: -Infinity}, v, i;
  for (i=0; i<data.length; ++i) {
    v = data[i];
    if (v != null) {
      if (v > s.max) s.max = v;
      if (v < s.min) s.min = v;
    }
  }
  return s;
};

stats.minIndex = function(data, f) {
  if (!u.isArray(data) || data.length==0) return -1;
  f = f || u.identity;
  var idx = 0, min = f(data[0]), v = min;
  for (var i=1, n=data.length; i<n; ++i) {
    v = f(data[i]);
    if (v < min) { min = v; idx = i; }
  }
  return idx;
};

stats.maxIndex = function(data, f) {
  if (!u.isArray(data) || data.length==0) return -1;
  f = f || u.identity;
  var idx = 0, max = f(data[0]), v = max;
  for (var i=1, n=data.length; i<n; ++i) {
    v = f(data[i]);
    if (v > max) { max = v; idx = i; }
  }
  return idx;
};

module.exports = stats;