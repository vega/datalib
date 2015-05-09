var util = require('../util'),
    Measures = require('./measures');

function Aggregator() {
  this._cells = {};
  this._aggr = [];
}

var Flags = Aggregator.Flags = {
  ADD_CELL: 1,
  MOD_CELL: 2
};

var proto = Aggregator.prototype;

// Parameters

// Input: array of objects of the form
// {name: string, get: function}
proto.groupby = function(dims) {
  this._dims = util.array(dims).map(function(d, i) {
    d = util.isString(d) ? {name: d, get: util.accessor(d)}
      : util.isFunction(d) ? {name: d.name || ("_" + i), get: d}
      : (d.name && util.isFunction(d.get)) ? d : null;
    if (d == null) throw "Invalid groupby argument: " + d;
    return d;
  });
  return this;
};

// Input: array of objects of the form
// {name: string, ops: [string, ...]}
proto.summary = function(fields) {
  var fields = summary_args(fields),
      aggr = (this._aggr = []),
      m = [], f, i, j, op, as;

  for (i=0; i<fields.length; ++i) {
    for (j=0, f=fields[i]; j<f.ops.length; ++j) {
      op = f.ops[j];
      out = f.as && f.as[j] || op + (f.name==='*' ? '' : '_'+f.name);
      m.push(Measures[op](out));
    }
    aggr.push({
      name: f.name,
      measures: Measures.create(m, f.get || util.accessor(f.name))
    });
  }
  return this;
};

function summary_args(fields) {
  if (util.isArray(fields)) { return fields; }
  var a = [], name, ops;
  for (name in fields) {
    ops = util.array(fields[name]);
    a.push({name: name, ops: ops});
  }
  return a;
}

// Cell Management

proto.clear = function() {
  return (this._cells = {}, this);
};

proto.reset = function() {
  var k, c, tuples = [];
  for (k in this._cells) {
    if (!(c = this._cells[k])) continue;
    tuples.push(c.tuple);
  }
  this.clear();
  return tuples;
};

proto.keys = function(x) {
  var d = this._dims,
      n = d.length,
      k = Array(n), i;
  for (i=0; i<n; ++i) { k[i] = d[i].get(x); }
  return {key: util.keystr(k), keys: k};
};

proto.cell = function(x) {
  var k = this.keys(x);
  return this._cells[k.key] || (this._cells[k.key] = this.new_cell(x, k));
};

proto.new_cell = function(x, k) {
  var cell = {
    num:   0,
    tuple: this.new_tuple(x, k),
    flag:  Flags.ADD_CELL
  };

  var aggr = this._aggr, i;
  for (i=0; i<aggr.length; ++i) {
    cell[aggr[i].name] = new aggr[i].measures(cell, cell.tuple);
  }

  return cell;
};

proto.new_tuple = function(x) {
  var dims = this._dims,
      t = {}, i, n;
  for(i=0, n=dims.length; i<n; ++i) {
    t[dims[i].name] = dims[i].get(x);
  }
  return this.ingest(t);
};

// Override to perform custom tuple ingestion
proto.ingest = util.identity;

// Process Tuples

proto.add = function(x) {
  var cell = this.cell(x),
      aggr = this._aggr;

  cell.num += 1;
  for (i=0; i<aggr.length; ++i) {
    cell[aggr[i].name].add(x);
  }
  cell.flag |= Flags.MOD_CELL;
};

proto.rem = function(x) {
  var cell = this.cell(x),
      aggr = this._aggr;

  cell.num -= 1;
  for (i=0; i<aggr.length; ++i) {
    cell[aggr[i].name].rem(x);
  }
  cell.flag |= Flags.MOD_CELL;
};

proto.results = function() {
  var results = [],
      aggr = this._aggr,
      cell, i, k;

  for (k in this._cells) {
    cell = this._cells[k];
    if (cell.num > 0) {
      for (i=0; i<aggr.length; ++i) {
        cell[aggr[i].name].set();
      }
      results.push(cell.tuple);
    }
    cell.flag = 0;
  }

  return results;
};

proto.execute = function(input) {
  return this.clear().insert(input);
};

proto.insert = function(input) {
  for (var i=0; i<input.length; ++i) {
    this.add(input[i]);
  }
  return this.results();
};

proto.remove = function(input) {
  for (var i=0; i<input.length; ++i) {
    this.rem(input[i]);
  }
  return this.results();
};

module.exports = Aggregator;