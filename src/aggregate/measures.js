var util = require('../util');
var stats = require('../stats');
var countmap = require('./countmap');

var types = {
  "count": measure({
    name: "count",
    set:  "this.cell.num"
  }),
  "nulls": measure({
    name: "nulls",
    set:  "this.cell.num - this.cell.valid"
  }),
  "valid": measure({
    name: "valid",
    set:  "this.cell.valid"
  }),
  "data": measure({
    name: "data",
    init: "this.data = [];",
    add:  "this.data.push(t);",
    rem:  "this.data.splice(this.data.indexOf(t), 1);",
    set:  "this.data", idx: -1
  }),
  "distinct": measure({
    name: "distinct",
    init: "this.distinct = new this.map();",
    add:  "this.distinct.add(v);",
    rem:  "this.distinct.rem(v);",
    set:  "this.distinct.size()", idx: -1
  }),
  "sum": measure({
    name: "sum",
    init: "this.sum = 0;",
    add:  "this.sum += v;",
    rem:  "this.sum -= v;",
    set:  "this.sum"
  }),
  "mean": measure({
    name: "mean",
    init: "this.mean = 0;",
    add:  "var d = v - this.mean; this.mean += d / this.cell.num;",
    rem:  "var d = v - this.mean; this.mean -= d / this.cell.num;",
    set:  "this.mean"
  }),
  "var": measure({
    name: "var",
    init: "this.dev = 0;",
    add:  "this.dev += d * (v - this.mean);",
    rem:  "this.dev -= d * (v - this.mean);",
    set:  "this.dev / (this.cell.num-1)",
    req:  ["mean"], idx: 1
  }),
  "varp": measure({
    name: "varp",
    set:  "this.dev / this.cell.num",
    req:  ["var"], idx: 2
  }),
  "stdev": measure({
    name: "stdev",
    set:  "Math.sqrt(this.dev / (this.cell.num-1))",
    req:  ["var"], idx: 2
  }),
  "stdevp": measure({
    name: "stdevp",
    set:  "Math.sqrt(this.dev / this.cell.num)",
    req:  ["var"], idx: 2
  }),
  "median": measure({
    name: "median",
    set:  "this.stats.median(this.data, this.get)",
    req:  ["data"], idx: 3
  }),
  "argmin": measure({
    name: "argmin",
    add:  "if (v < this.min) this.argmin = t;",
    rem:  "this.argmin = null;",
    set:  "this.argmin || this.data[this.stats.extent.index(this.data, this.get)[0]]",
    req:  ["min", "data"], idx: 3
  }),
  "argmax": measure({
    name: "argmax",
    add:  "if (v > this.max) this.argmax = t;",
    rem:  "this.argmax = null;",
    set:  "this.argmax || this.data[this.stats.extent.index(this.data, this.get)[1]]",
    req:  ["max", "data"], idx: 3
  }),
  "min": measure({
    name: "min",
    init: "this.min = +Infinity;",
    add:  "if (v < this.min) this.min = v;",
    rem:  "this.min = null;",
    set:  "this.min != null ? this.min : this.stats.extent(this.data, this.get)[0]",
    req:  ["data"], idx: 4
  }),
  "max": measure({
    name: "max",
    init: "this.max = -Infinity;",
    add:  "if (v > this.max) this.max = v;",
    rem:  "this.max = null;",
    set:  "this.max != null ? this.max : this.stats.extent(this.data, this.get)[1]",
    req:  ["data"], idx: 4
  })
};

function measure(base) {
  return function(out) {
    var m = util.extend({init:"", add:"", rem:"", idx:0}, base);
    m.out = out || base.name;
    return m;
  };
}

function resolve(agg) {
  function collect(m, a) {
    (a.req || []).forEach(function(r) {
      if (!m[r]) collect(m, m[r] = types[r]());
    });
    return m;
  }
  var map = agg.reduce(
    collect,
    agg.reduce(function(m, a) { return (m[a.name] = a, m); }, {})
  );
  var all = [];
  for (var k in map) all.push(map[k]);
  all.sort(function(a,b) { return a.idx - b.idx; });
  return all;
}

function create(agg, accessor, mutator) {
  var all = resolve(agg),
      ctr = "this.tuple = t; this.cell = c; c.valid = 0;",
      add = "if (!this.valid(v)) return; this.cell.valid++;",
      rem = "if (!this.valid(v)) return; this.cell.valid--;",
      set = "var t = this.tuple;";

  all.forEach(function(a) {
    if (a.idx < 0) {
      ctr = a.init + ctr;
      add = a.add + add;
      rem = a.rem + rem;
    } else {
      ctr += a.init;
      add += a.add;
      rem += a.rem;
    }
  });
  agg.forEach(function(a) {
    set += "this.assign(t,'"+a.out+"',"+a.set+");";
  });
  set += "return t;";

  ctr = Function("c", "t", ctr);
  ctr.prototype.assign = mutator || assign;
  ctr.prototype.add = Function("t", "var v = this.get(t);" + add);
  ctr.prototype.rem = Function("t", "var v = this.get(t);" + rem);
  ctr.prototype.set = Function(set);
  ctr.prototype.get = accessor;
  ctr.prototype.mod = mod;
  ctr.prototype.map = countmap;
  ctr.prototype.stats = stats;
  ctr.prototype.valid = util.isNotNull;
  return ctr;
}

function assign(x, name, val) {
  x[name] = val;
}

function mod(v_new, v_old) {
  if (v_old === undefined || v_old === v_new) return;
  this.rem(v_old);
  this.add(v_new);
};

types.create = create;
module.exports = types;