'use strict';

var assert = require('chai').assert;
var stats = require('../src/stats');
var EPSILON = 1e-15;

var a = function(x) { return x.a; },
    b = function(x) { return x.b; },
    c = function(x) { return x.c; },
    d = function(x) { return x.d; };

describe('stats', function() {

  describe('unique', function() {
    it('should return unique values in the original order', function() {
      var u = stats.unique([3, 1, 2]);
      [3, 1, 2].forEach(function(v, i) { assert.equal(v, u[i]); });
    });

    it('should filter out repeated occurrences of values', function() {
      var u = stats.unique([1, 1, 2, 1, 2, 3, 1, 2, 3, 3, 3]);
      [1, 2, 3].forEach(function(v, i) { assert.equal(v, u[i]); });
    });

    it('should treat undefined as a value and remove duplicates', function() {
      var u = stats.unique([1, undefined, 2, undefined]);
      [1, undefined, 2].forEach(function(v, i) { assert.equal(v, u[i]); });
    });

    it('should apply transformation to array elements', function() {
      var u = stats.unique([1,2,3], function (d) { return -2 * d; });
      [-2, -4, -6].forEach(function(v, i) { assert.equal(v, u[i]); });
    });

    it('should filter out repeated occurrences of transformed values', function() {
      var u = stats.unique([1,1,2,3], function (d) { return d<3 ? 1 : 3; });
      [1, 3].forEach(function(v, i) { assert.equal(v, u[i]); });
    });
  });

  describe('count', function() {
    it('should count non-null values', function() {
      assert.equal(stats.count([3, 1, 2]), 3);
      assert.equal(stats.count([null, 1, 2, null]), 2);
    });

    it('should count NaN values', function() {
      assert.equal(stats.count([NaN, 1, 2]), 3);
    });

    it('should ignore undefined values', function() {
      assert.equal(stats.count([1, undefined, 2, undefined, 3]), 3);
    });
  });

  describe('count.distinct', function() {
    it('should count distinct values', function() {
      assert.equal(stats.count.distinct([3, 1, 2]), 3);
      assert.equal(stats.count.distinct([1, 1, 2, 1, 2, 3, 1, 2, 3, 3, 3]), 3);
    });

    it('should recognize null values', function() {
      assert.equal(stats.count.distinct([null, 1, 2]), 3);
    });

    it('should recognize undefined values', function() {
      assert.equal(stats.count.distinct([1, undefined, 2, undefined, 3]), 4);
    });
  });

  describe('count.nulls', function() {
    it('should count null values', function() {
      assert.equal(stats.count.nulls([3, 1, 2]), 0);
      assert.equal(stats.count.nulls([null, 0, 1, 2, null]), 2);
    });

    it('should ignore NaN values', function() {
      assert.equal(stats.count.nulls([NaN, 1, 2]), 0);
    });

    it('should count undefined values', function() {
      assert.equal(stats.count.nulls([1, undefined, 2, undefined, 3]), 2);
    });
  });

  describe('extent', function() {
    it('should calculate min and max values', function() {
      var e = stats.extent([1, 2, 3, 4, 5]);
      assert.equal(e[0], 1);
      assert.equal(e[1], 5);

      e = stats.extent([1.1, 2.2, 3.3, 4.4, 5.5]);
      assert.equal(e[0], 1.1);
      assert.equal(e[1], 5.5);
    });

    it('should handle non-numeric values', function() {
      var e = stats.extent(['aa', 'eeeeeeeee', 'bbb', 'cccc', 'dddddd']);
      assert.equal(e[0], 2);
      assert.equal(e[1], 9);
    });

    it('should ignore null values', function() {
      var e = stats.extent([2, 1, null, 5, 4]);
      assert.equal(e[0], 1);
      assert.equal(e[1], 5);
    });
  });

  describe('extent.index', function() {
    it('should calculate min and max indices', function() {
      var e = stats.extent.index([1, 2, 3, 4, 5]);
      assert.equal(e[0], 0);
      assert.equal(e[1], 4);

      e = stats.extent.index([1.1, 2.2, 3.3, 4.4, 5.5]);
      assert.equal(e[0], 0);
      assert.equal(e[1], 4);
    });

    it('should handle non-numeric values', function() {
      var e = stats.extent.index(['aa', 'eeeeeeeee', 'bbb', 'cccc', 'dddddd']);
      assert.equal(e[0], 0);
      assert.equal(e[1], 1);
    });

    it('should ignore null values', function() {
      var e = stats.extent.index([2, 1, null, 5, 4]);
      assert.equal(e[0], 1);
      assert.equal(e[1], 3);
    });
  });

  describe('median', function() {
    it('should calculate median values', function() {
      assert.equal(stats.median([3, 1, 2]), 2);
      assert.equal(stats.median([-2, -2, -1, 1, 2, 2]), 0);
    });

    it('should ignore null values', function() {
      assert.equal(stats.median([1, 2, null]), 1.5);
    });
  });

  describe('quantile', function() {
    it('should calculate quantile values', function() {
      var a = [1, 2, 3, 4, 5];
      assert.equal(stats.quantile(a, 0.00), 1);
      assert.equal(stats.quantile(a, 0.25), 2);
      assert.equal(stats.quantile(a, 0.50), 3);
      assert.equal(stats.quantile(a, 0.75), 4);
      assert.equal(stats.quantile(a, 1.00), 5);

      var a = [1, 2, 3, 4];
      assert.equal(stats.quantile(a, 0.00), 1);
      assert.equal(stats.quantile(a, 0.25), 1.75);
      assert.equal(stats.quantile(a, 0.50), 2.5);
      assert.equal(stats.quantile(a, 0.75), 3.25);
      assert.equal(stats.quantile(a, 1.00), 4);
    });
  });

  describe('mean', function() {
    it('should calculate mean values', function() {
      assert.closeTo(stats.mean([3, 1, 2]), 2, EPSILON);
      assert.closeTo(stats.mean([-2, -2, -1, 1, 2, 2]), 0, EPSILON);
      assert.closeTo(stats.mean([4, 5]), 4.5, EPSILON);
    });

    it('should ignore null values', function() {
      assert.closeTo(stats.mean([1, 2, null]), 1.5, EPSILON);
    });
  });

  describe('rank', function() {
    it('should calculate rank values', function() {
      assert.deepEqual([1,   3,   2, 4], stats.rank([3,5,4,6]));
      assert.deepEqual([1.5, 1.5, 3, 4], stats.rank([3,3,4,5]));
      assert.deepEqual([1, 2.5, 2.5, 4], stats.rank([3,4,4,5]));
      assert.deepEqual([1, 2, 3.5, 3.5], stats.rank([3,4,5,5]));
    });
  });

  describe('dot', function() {
    var table = [
      {a:1, b:2, c:3},
      {a:4, b:5, c:6},
      {a:7, b:8, c:9}
    ];

    it('should accept object array and accessors', function() {
      assert.equal(1*2+4*5+7*8, stats.dot(table, a, b));
      assert.equal(1*2+4*5+7*8, stats.dot(table, b, a));
      assert.equal(1*3+4*6+7*9, stats.dot(table, a, c));
      assert.equal(1*3+4*6+7*9, stats.dot(table, c, a));
      assert.equal(2*3+5*6+8*9, stats.dot(table, b, c));
      assert.equal(2*3+5*6+8*9, stats.dot(table, c, b));
    });

    it('should accept two arrays', function() {
      var x = table.map(a), y = table.map(b), z = table.map(c);
      assert.equal(1*2+4*5+7*8, stats.dot(x, y));
      assert.equal(1*2+4*5+7*8, stats.dot(y, x));
      assert.equal(1*3+4*6+7*9, stats.dot(x, z));
      assert.equal(1*3+4*6+7*9, stats.dot(z, x));
      assert.equal(2*3+5*6+8*9, stats.dot(y, z));
      assert.equal(2*3+5*6+8*9, stats.dot(z, y));
    });

    it('should throw error with inputs of unequal length', function() {
      assert.throws(function() { stats.dot([1,2,3], [1,2]); });
    });
  });

  describe('cor', function() {
    var table = [
      {a:1,  b:0, c:-1},
      {a:0,  b:1, c:0},
      {a:-1, b:0, c:1}
    ];

    it('should accept object array and accessors', function() {
      assert.closeTo( 0, stats.cor(table, a, b), EPSILON);
      assert.closeTo( 0, stats.cor(table, b, a), EPSILON);
      assert.closeTo(-1, stats.cor(table, a, c), EPSILON);
      assert.closeTo(-1, stats.cor(table, c, a), EPSILON);
      assert.closeTo( 0, stats.cor(table, b, c), EPSILON);
      assert.closeTo( 0, stats.cor(table, c, b), EPSILON);
      assert.closeTo( 1, stats.cor(table, a, a), EPSILON);
      assert.closeTo( 1, stats.cor(table, b, b), EPSILON);
      assert.closeTo( 1, stats.cor(table, c, c), EPSILON);
    });

    it('should accept two arrays', function() {
      var x = table.map(a), y = table.map(b), z = table.map(c);
      assert.closeTo( 0, stats.cor(x, y), EPSILON);
      assert.closeTo( 0, stats.cor(y, x), EPSILON);
      assert.closeTo(-1, stats.cor(x, z), EPSILON);
      assert.closeTo(-1, stats.cor(z, x), EPSILON);
      assert.closeTo( 0, stats.cor(y, z), EPSILON);
      assert.closeTo( 0, stats.cor(z, y), EPSILON);
      assert.closeTo( 1, stats.cor(x, x), EPSILON);
      assert.closeTo( 1, stats.cor(y, y), EPSILON);
      assert.closeTo( 1, stats.cor(z, z), EPSILON);
    });

    it('should return NaN with zero-valued input', function() {
      assert(isNaN(stats.cor([0,0,0], [0,0,0])));
      assert(isNaN(stats.cor([0,0,0], [1,2,3])));
      assert(isNaN(stats.cor([1,2,3], [0,0,0])));
    });
  });

  describe('cor.rank', function() {
    var table = [
      {a:1, b:5, c:8, d:3},
      {a:2, b:6, c:7, d:1},
      {a:3, b:7, c:6, d:4},
      {a:4, b:8, c:5, d:2}
    ];

    it('should accept two arrays', function() {
      assert.equal( 1, stats.cor.rank([1,2,3,4],[5,6,7,8]));
      assert.equal(-1, stats.cor.rank([1,2,3,4],[8,7,6,5]));
      assert.equal( 0, stats.cor.rank([1,2,3,4],[3,1,4,2]));
    });

    it('should accept object array and accessors', function() {
      assert.equal( 1, stats.cor.rank(table, a, b));
      assert.equal(-1, stats.cor.rank(table, a, c));
      assert.equal( 0, stats.cor.rank(table, a, d));
    });
  });

  describe('cor.dist', function() {
    var table = [
      {a:1,  b:-1},
      {a:0,  b:0},
      {a:-1, b:1}
    ];

    it('should accept object array and accessors', function() {
      assert.closeTo(1, stats.cor.dist(table, a, b), EPSILON);
      assert.closeTo(1, stats.cor.dist(table, b, a), EPSILON);
      assert.closeTo(1, stats.cor.dist(table, a, a), EPSILON);
      assert.closeTo(1, stats.cor.dist(table, b, b), EPSILON);
    });

    it('should accept two arrays', function() {
      var x = table.map(a), y = table.map(b), z = table.map(c);
      assert.closeTo(1, stats.cor.dist(x, y), EPSILON);
      assert.closeTo(1, stats.cor.dist(y, x), EPSILON);
      assert.closeTo(1, stats.cor.dist(x, x), EPSILON);
      assert.closeTo(1, stats.cor.dist(y, y), EPSILON);
    });

    it('should return NaN with zero-valued input', function() {
      assert(isNaN(stats.cor.dist([0,0,0], [0,0,0])));
      assert(isNaN(stats.cor.dist([0,0,0], [1,2,3])));
      assert(isNaN(stats.cor.dist([1,2,3], [0,0,0])));
    });
  });

  describe('dist', function() {
    var table = [
      {a:1,  b:-1},
      {a:0,  b:0},
      {a:-1, b:1}
    ];

    it('should accept object array and accessors', function() {
      assert.equal(0, stats.dist(table, a, a));
      assert.equal(0, stats.dist(table, b, b));
      assert.equal(Math.sqrt(8), stats.dist(table, a, b));
      assert.equal(Math.sqrt(8), stats.dist(table, b, a));
    });

    it('should accept two arrays', function() {
      var x = table.map(a), y = table.map(b);
      assert.equal(0, stats.dist(x, x));
      assert.equal(0, stats.dist(y, y));
      assert.equal(Math.sqrt(8), stats.dist(x, y));
      assert.equal(Math.sqrt(8), stats.dist(y, x));
    });

    it('should compute non-Euclidean distances', function() {
      assert.equal(2, stats.dist([1,1], [2,2], 1));
      assert.equal(4, stats.dist([1,1], [2,2], 0.5));
      assert.equal(Math.pow(2, 1/3), stats.dist([1,1], [2,2], 3));
    });
  });

  describe('entropy', function() {
    var even = [1, 1, 1, 1, 1, 1], ee = -Math.log(1/6)/Math.LN2;
    var skew = [6, 0, 0, 0, 0, 0], se = 0;

    it('should calculate entropy', function() {
      assert.equal(ee, stats.entropy(even));
      assert.equal(se, stats.entropy(skew));
    });

    it('should handle accessor argument', function() {
      var wrap = function(a, x) { return (a.push({a:x}), a); };
      assert.equal(ee, stats.entropy(even.reduce(wrap, []), a));
      assert.equal(se, stats.entropy(skew.reduce(wrap, []), a));
    });

    it('should handle zero vectors', function() {
      assert.equal(0, stats.entropy([0,0,0,0]));
    });

    it('should handle zero vectors', function() {
      assert.equal(0, stats.entropy([0,0,0,0]));
    });

    it('should calculate normalized entropy', function() {
      assert.equal(1, stats.entropy.normalized(even));
      assert.equal(0, stats.entropy.normalized(skew));
      assert.equal(0, stats.entropy.normalized([0,0,0,0]));
    });
  });

  describe('entropy.mutual', function() {
    var table = [
      {a:'a', b:1, c:1, d:1},
      {a:'a', b:2, c:0, d:1},
      {a:'b', b:1, c:0, d:0},
      {a:'b', b:2, c:1, d:0}
    ];

    it('should accept object array and accessors', function() {
      assert.equal(1, stats.entropy.mutual(table, a, b, c));
      assert.equal(0, stats.entropy.mutual(table, a, b, d));
    });

    it('should handle zero vectors', function() {
      var u = table.map(a), v = table.map(b),
          x = table.map(c), y = table.map(d);
      assert.equal(1, stats.entropy.mutual(u, v, x));
      assert.equal(0, stats.entropy.mutual(u, v, y));
    });
  });

  describe('profile', function() {
    it('should compute iqr correctly', function() {
      assert.deepEqual([1.00, 1.00], stats.profile([1]).iqr);
      assert.deepEqual([1.25, 1.75], stats.profile([1,2]).iqr);
      assert.deepEqual([1.50, 2.50], stats.profile([1,2,3]).iqr);
      assert.deepEqual([1.75, 3.25], stats.profile([1,2,3,4]).iqr);
      assert.deepEqual([2.00, 4.00], stats.profile([1,2,3,4,5]).iqr);
      assert.deepEqual([2.25, 4.75], stats.profile([1,2,3,4,5,6]).iqr);
      assert.deepEqual([2.50, 5.50], stats.profile([1,2,3,4,5,6,7]).iqr);
      assert.deepEqual([2.75, 6.25], stats.profile([1,2,3,4,5,6,7,8]).iqr);
    });

    it('should return min, max length for strings', function(){
      var p = stats.profile(['aa', 'eeeeeeeee', 'bbb', 'cccc', 'dddddd']);
      assert.equal(p.min, 2);
      assert.equal(p.max, 9);
    });
  });

});
