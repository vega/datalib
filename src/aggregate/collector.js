var stats = require('../stats');

var REM = '$!_rem_!#';

function Collector() {
  this._add = [];
  this._rem = [];
}

var proto = Collector.prototype;

proto.add = function(v) {
  this._add.push(v);
};

proto.rem = function(v) {
  this._rem.push(v);
};

proto.values = function() {
  if (this._rem.length === 0) return this._add;
  var a = this._add,
      r = this._rem,
      x = Array(a.length - r.length),
      i, j, n;

  for (i=0, n=r.length; i<n; ++i) {
    r[i][REM] = 1;
  }
  for (i=0, j=0, n=a.length; i<n; ++i) {
    if (!a[i][REM]) { x[j++] = a[i]; }
  }
  for (i=0, n=r.length; i<n; ++i) {
    delete r[i][REM];
  }
  
  this._rem = [];
  this._f = null;
  return (this._add = x);
};

// memoizing statistics methods

proto.extent = function(get) {
  if (this._f !== get || !this._ext) {
    var v = this.values(),
        i = stats.extent.index(v, get);
    this._ext = [v[i[0]], v[i[1]]];
    this._f = get;    
  }
  return this._ext;
};
proto.min = function(f) { return this.extent(f)[0]; };
proto.max = function(f) { return this.extent(f)[1]; };

proto.quartile = function(get) {
  if (this._f !== get || !this._q) {
    this._q = stats.quartile(this.values(), get);
    this._f = get;    
  }
  return this._q;
};
proto.q1 = function(f) { return this.quartile(f)[0]; };
proto.q2 = function(f) { return this.quartile(f)[1]; };
proto.q3 = function(f) { return this.quartile(f)[2]; };

module.exports = Collector;