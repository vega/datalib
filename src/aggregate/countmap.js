var util = require('../util');

function CountMap() {
  this._map = {};
}

var proto = CountMap.prototype;

proto.clean = function(v) {
  var old = this._map, map = {}, k, e;
  for (k in old) {
    e = old[k];
    if (e.n > 0) map[k] = e;
  }
  this._map = map;
};

proto.add = function(v) {
  var entry = this._map[v] || (this._map[v] = {n: 0, v: v});
  entry.n += 1;
};

proto.rem = function(v) {
  this._map[v].n -= 1;
};

proto.size = function() {
  var map = this._map, s = 0, k;
  for (k in map) {
    if (map[k].n > 0) s += 1;
  }
  return s;
};

proto.min = function() {
  var map = this._map,
      keys = util.keys(map),
      min = map[keys[0]].v,
      i, n, e;
  for (i=1, n=keys.length; i<n; ++i) {
    e = map[keys[i]];
    if (e.n > 0 && e.v < min) min = e.v;
  }
  return min;
};

proto.max = function() {
  var map = this._map,
      keys = util.keys(map),
      max = map[keys[0]].v,
      i, n, e;
  for (i=1, n=keys.length; i<n; ++i) {
    e = map[keys[i]];
    if (e.n > 0 && e.v > max) max = e.v;
  }
  return max;
};

proto.objects = function() {
  return util.vals(this._map);
};

proto.values = function() {
  var map = this._map,
      vals = [], k, e, i;
  for (k in map) {
    e = map[k];
    for (i=0; i<e.n; ++i) vals.push(e.v);
  }
  return vals;
};

module.exports = CountMap;