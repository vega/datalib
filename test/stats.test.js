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
    it('should count all values', function() {
      assert.equal(stats.count([]), 0);
      assert.equal(stats.count([3, 1, 2]), 3);
      assert.equal(stats.count([null, 1, 2, null]), 4);
      assert.equal(stats.count([NaN, 1, 2]), 3);
      assert.equal(stats.count([1, undefined, 2, undefined, 3]), 5);
    });
  });

  describe('valid', function() {
    it('should ignore null values', function() {
      assert.equal(stats.count.valid([3, 1, 2]), 3);
      assert.equal(stats.count.valid([null, 1, 2, null]), 2);
    });

    it('should ignore NaN values', function() {
      assert.equal(stats.count.valid([NaN, 1, 2]), 2);
    });

    it('should ignore undefined values', function() {
      assert.equal(stats.count.valid([1, undefined, 2, undefined, 3]), 3);
    });

    it('should support accessor', function() {
      assert.equal(stats.count.valid([{a:3}, {a:1}, {a:2}], 'a'), 3);
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

    it('should support accessor', function() {
      assert.equal(stats.count.distinct([{a:3}, {a:1}, {a:2}], 'a'), 3);
    });
  });

  describe('count.missing', function() {
    it('should count null values', function() {
      assert.equal(stats.count.missing([3, 1, 2]), 0);
      assert.equal(stats.count.missing([null, 0, 1, 2, null]), 2);
    });

    it('should ignore NaN values', function() {
      assert.equal(stats.count.missing([NaN, 1, 2]), 0);
    });

    it('should count undefined values', function() {
      assert.equal(stats.count.missing([1, undefined, 2, undefined, 3]), 2);
    });

    it('should support accessor', function() {
      assert.equal(stats.count.missing([{a:3}, {a:1}, {a:2}], 'a'), 0);
    });
  });

  describe('count.map', function() {
    it('should create count hash', function() {
      var map = stats.count.map(['a', 'a', 'b']);
      assert.equal(map.a, 2);
      assert.equal(map.b, 1);
      assert.isUndefined(map.c);
    });

    it('should support accessor', function() {
      var map = stats.count.map([{a:'a'}, {a:'a'}, {a:'b'}], 'a');
      assert.equal(map.a, 2);
      assert.equal(map.b, 1);
      assert.isUndefined(map.c);
    });
  });

  describe('extent/min/max', function() {
    it('should calculate min and max values', function() {
      var a = [1, 2, 3, 4, 5];
      var e = stats.extent(a);
      assert.equal(e[0], 1);
      assert.equal(e[1], 5);
      assert.equal(e[0], stats.min(a));
      assert.equal(e[1], stats.max(a));

      a = [1.1, 2.2, 3.3, 4.4, 5.5];
      e = stats.extent(a);
      assert.equal(e[0], 1.1);
      assert.equal(e[1], 5.5);
      assert.equal(e[0], stats.min(a));
      assert.equal(e[1], stats.max(a));
    });

    it('should handle non-numeric values', function() {
      var a = ['aa', 'eeeee', 'bbb', 'cccc', 'dddddd'];
      var e = stats.extent(a);
      assert.equal(e[0], 'aa');
      assert.equal(e[1], 'eeeee');
      assert.equal(e[0], stats.min(a));
      assert.equal(e[1], stats.max(a));
    });

    it('should ignore null values', function() {
      var a = [2, 1, null, 5, 4];
      var e = stats.extent(a);
      assert.equal(e[0], 1);
      assert.equal(e[1], 5);
      assert.equal(e[0], stats.min(a));
      assert.equal(e[1], stats.max(a));
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
      var e = stats.extent.index(['aa', 'eeeee', 'bbb', 'cccc', 'dddddd']);
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

    it('should support accessor', function() {
      assert.equal(stats.median([{a:3}, {a:1}, {a:2}], 'a'), 2);
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

    it('should support accessor', function() {
      var a = [{a:1}, {a:2}, {a:3}, {a:4}, {a:5}];
      assert.equal(stats.quantile(a, 'a', 0.00), 1);
      assert.equal(stats.quantile(a, 'a', 0.25), 2);
      assert.equal(stats.quantile(a, 'a', 0.50), 3);
      assert.equal(stats.quantile(a, 'a', 0.75), 4);
      assert.equal(stats.quantile(a, 'a', 1.00), 5);
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

    it('should support accessor', function() {
      assert.equal(stats.mean([{a:1}, {a:2}], 'a'), 1.5);
    });
  });

  describe('mean.geometric', function() {
    it('should calculate geometric means', function() {
      assert.equal(stats.mean.geometric([1,1,1]), 1);
      assert.equal(stats.mean.geometric([1,2,3]), Math.pow(6,1/3));
      assert.equal(stats.mean.geometric([5]),5);
    });

    it('should ignore null values', function() {
      assert.equal(stats.mean.geometric([1,2,null]), Math.sqrt(2));
    });

    it('should support an array and accessor', function() {
      assert.equal(stats.mean.geometric([{a:1},{a:2}],'a'), Math.sqrt(2));
    });

    it('should return 0 if there are no valid values', function() {
      assert.equal(stats.mean.geometric([null,null]),0);
    });

    it('should throw error if the data contains negative or zero values', function() {
      assert.throws(function() { stats.mean.geometric([1,2,-1]); });
      assert.throws(function() { stats.mean.geometric([1,2,0]); });
    });
  });

  describe('mean.harmonic', function() {
    it('should calculate harmonic means', function() {
      assert.closeTo(stats.mean.harmonic([3, 1, 2]), 1.6363636363636365, EPSILON);
      assert.closeTo(stats.mean.harmonic([4, 5]), 4.444444444444445, EPSILON);
    });

    it('should ignore null values', function() {
      assert.closeTo(stats.mean.harmonic([1, 2, null]), 4/3, EPSILON);
    });

    it('should support accessor', function() {
      assert.equal(stats.mean.harmonic([{a:1}, {a:2}], 'a'), 4/3);
    });

    it('should handle zeros', function() {
      assert.equal(stats.mean.harmonic([-2, -2, -1, 1, 2, 2]), Infinity);
      assert.equal(stats.mean.harmonic([0, 1]), 0);
    })
  });

  describe('variance & stdev', function() {
    it('should calculate variance and stdev values', function() {
      assert.closeTo(stats.variance([3, 1, 2]), 1, EPSILON);
      assert.closeTo(stats.variance([1, 3]), 2, EPSILON);
      assert.closeTo(stats.variance([-2, -2, -1, 1, 2, 2]), 3.6, EPSILON);
      assert.equal(Math.sqrt(stats.variance([3, 1, 2])), stats.stdev([3, 1, 2]));
      assert.equal(Math.sqrt(stats.variance([1, 3])), stats.stdev([1, 3]));
      assert.equal(
        Math.sqrt(stats.variance([-2, -2, -1, 1, 2, 2])),
        stats.stdev([-2, -2, -1, 1, 2, 2])
      );
      assert.equal(0, stats.variance([]));
      assert.equal(0, stats.variance([1]));
      assert.equal(0, stats.stdev([]));
      assert.equal(0, stats.stdev([1]));
    });

    it('should ignore null values', function() {
      assert.equal(stats.variance([3, 1, 2, null]), 1);
      assert.equal(stats.stdev([3, 1, 2, null]), 1);
    });

    it('should support accessor', function() {
      assert.equal(stats.variance([{a:1}, {a:3}], 'a'), 2);
      assert.equal(stats.stdev([{a:1}, {a:3}], 'a'), Math.sqrt(2));
    });
  });

  describe('modeskew', function() {
    it('should calculate modeskew values', function() {
      assert.equal(stats.modeskew([]), 0);
      assert.equal(stats.modeskew([1]), 0);
      assert.equal(stats.modeskew([1,3]), 0);
      assert.equal(stats.modeskew([1,1,4]), 1/Math.sqrt(3));
    });

    it('should support accessor', function() {
      assert.equal(stats.modeskew([{a:1}, {a:2}], 'a'), 0);
      assert.equal(stats.modeskew([{a:1}, {a:1} ,{a:4}], 'a'), 1/Math.sqrt(3));
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

    it('should ignore NaN values', function() {
      var a = [1, 2, NaN];
      var b = [3, 2, 1];
      assert.equal(stats.dot(a, b), 1*3 + 2*2);
      var t = [{a:1, b:3}, {a:2, b:2}, {a:NaN, b:1}];
      assert.equal(stats.dot(t, 'a', 'b'), 1*3 + 2*2);
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

  describe('cohensd', function() {
    var g1 = [1,2,3],
        g2 = [2,1,0],
        table = [ {a:1,b:2}, {a:2,b:1}, {a:3,b:0} ];

    it('should accept object array and accessors', function() {
      assert.equal(0, stats.cohensd(table,a,a));
      assert.equal(0, stats.cohensd(table,b,b));
      assert.equal(1, stats.cohensd(table,a,b));
      assert.equal(-1, stats.cohensd(table,b,a));
    });

    it('should accept two arrays', function() {
      assert.equal(0, stats.cohensd(g1,g1));
      assert.equal(0, stats.cohensd(g2,g2));
      assert.equal(1, stats.cohensd(g1,g2));
      assert.equal(-1, stats.cohensd(g2,g1));
    });

    it('should return 0 for empty arrays, or arrays with no variance', function() {
      assert.equal(0, stats.cohensd([],[]));
      assert.equal(0, stats.cohensd([1],[2]));
      assert.equal(0, stats.cohensd([1,1],[1,1]));
    });
  });

  describe('covariance', function() {
    var table = [{a:1,b:2}, {a:2,b:1}, {a:3,b:0}],
        g1 = [1,2,3],
        g2 = [3,2,1];

    it('should accept object array and accessors', function() {
      assert.equal(-1,stats.covariance(table, a, b));
      assert.equal(-1,stats.covariance(table, b, a));
    });

    it('should accept two arrays', function() {
      assert.equal(-1, stats.covariance(g1, g2));
      assert.equal(1, stats.covariance(g1, g1));
    });

    it('should throw error with inputs of unequal length', function() {
      assert.throws(function() {
        stats.covariance(g1, [1,2]);
      });
    });

    it('should throw error with unmatched invalid values', function() {
      assert.throws(function() { stats.covariance(g1, [1,null,2]); });
      assert.throws(function() { stats.covariance([1,null,2], g1); });
      assert.equal(0, stats.covariance([null,null], [null,null]));
    });

  });

  describe('linearRegression', function() {
    var table = [{a:1,b:3}, {a:2,b:2}, {a:3,b:1}],
        g1 = [1,2,3],
        g2 = [3,2,1];

    it('should accept object array and accessors', function() {
      assert.equal(-1, stats.linearRegression(table, a, b).slope);
      assert.equal(1, stats.linearRegression(table, a, a).R);
      assert.equal(4, stats.linearRegression(table, b, a).intercept);
    });

    it('should accept two arrays', function() {
      assert.equal(-1, stats.linearRegression(g1, g2).slope);
      assert.equal(1, stats.linearRegression(g1, g1).R);
      assert.equal(0, stats.linearRegression(g1, g2).rss);
    });

    it('should ignore aligned invalid values', function() {
      assert.equal(-1, stats.linearRegression([1,2,NaN,3], [3,2,null,1]).slope);
    });

    it('should throw error with inputs of unequal length', function() {
      assert.throws(function() {
        stats.linearRegression(g1,[1,2]);
      });
    });

    it('should agree with pearsons r calculation', function() {
      assert.equal(stats.cor(g1, g2), stats.linearRegression(g1, g2).R);
      assert.equal(stats.cor(g2, g1), stats.linearRegression(g2, g1).R);
    });
  });

  describe('stats.bootstrap.ci', function() {
    var g1 = [ {a:1},{a:1}];
    it('should accept an array', function() {
      assert.deepEqual([1,1], stats.bootstrap.ci([1,1]));
    });

    it('should accept an array and sample count', function() {
      assert.deepEqual([1,1], stats.bootstrap.ci([1,1], 100));
    });

    it('should accept an array, sample count, and alpha', function(){
      assert.deepEqual([1,1], stats.bootstrap.ci([1,1], 100, 0.1));
    });

    it('should accept an array, sample count, alpha, and smoothing', function() {
      assert.notEqual(
        stats.bootstrap.ci([1,1], 100, 0.1),
        stats.bootstrap.ci([1,1], 100, 0.1, 5)
      );
    });

    it('should accept an array and accessor', function() {
      assert.deepEqual([1,1], stats.bootstrap.ci(g1, a));
    });

    it('should accept an array, accessor, and sample count', function() {
      assert.deepEqual([1,1], stats.bootstrap.ci(g1, a, 100));
    });

    it('should accept an array, accessor, sample count, and alpha', function() {
      assert.deepEqual([1,1], stats.bootstrap.ci(g1, a, 100, 0.1));
    });

    it('should accept an array, accessor, sample count, alpha, and smoothing', function() {
      assert.notEqual(
        stats.bootstrap.ci(g1, a, 100, 0.1),
        stats.bootstrap.ci(g1, a, 100, 0.1, 5)
      );
    });

    it('should ignore invalid values', function() {
      assert.deepEqual([1,1], stats.bootstrap.ci([1,null,1]));
    });
  });

  describe('stats.z.ci', function() {
    var g1 = [1,2,3,4,5],
        g2 = [1,1,1],
        g3 = [{a:1},{a:2},{a:3},{a:4},{a:5}],
        g4 = [{a:1},{a:1},{a:1}];

    it('should accept an array', function() {
      assert.deepEqual([1,1], stats.z.ci(g2));
    });

    it('should accept an array and an alpha', function() {
      assert.ok(
        stats.z.ci(g1)[0] < stats.z.ci(g1, 0.1)[0] &&
        stats.z.ci(g1)[1] > stats.z.ci(g1, 0.1)[1]
      );
      assert.equal(3, stats.z.ci(g1, 1)[0]);
      assert.equal(3, stats.z.ci(g1, 1)[1]);
    });

    it('should accept an array and accessor', function() {
      assert.deepEqual([1,1], stats.z.ci(g4,a));
    });

    it('should accept an array, accessor, and alpha', function() {
      assert.ok(
        stats.z.ci(g3, a)[0] < stats.z.ci(g3, a, 0.1)[0] &&
        stats.z.ci(g3, a)[1] > stats.z.ci(g3, a, 0.1)[1]
      );
      assert.equal(3, stats.z.ci(g3, a, 1)[0]);
      assert.equal(3, stats.z.ci(g3, a, 1)[1]);
    });
  });

  describe('stats.z.test', function() {
    var g1 = [1,2,3,4,5],
        g2 = [{a:1},{a:2},{a:3},{a:4},{a:5}];

    it('should accept an array', function() {
      assert.ok(stats.z.test(g1) < 0.05);
    });

    it('should accept an array and an accessor', function() {
      assert.ok(stats.z.test(g2, a) < 0.05);
    });

    it('should accept an array and a null hypothesis', function() {
      assert.equal(1, stats.z.test(g1, {nullh:3}));
    });

    it('should accept an array, an accessor, and a null hypothesis', function() {
      assert.equal(1, stats.z.test(g2, a, {nullh:3}));
    });

    it('should degrade gracefully if there is no variation', function() {
      assert.equal(0, stats.z.test([1]));
      assert.equal(1, stats.z.test([1], {nullh: 1}));
    });
  });

  describe('stats.z.test paired', function() {
    var g1 = [2, 4, 6, 8, 10],
        g2 = [0, 1, 2, 3, 4],
        o = {paired: true},
        table = [{a:2,b:0}, {a:4,b:1}, {a:6,b:2}, {a:8,b:3}, {a:10,b:4}];

    it('should accept an array and accessors', function() {
      assert.ok(stats.z.test(table,a,b,o) < 0.05);
      assert.equal(
        stats.z.test(table, a, b, o),
        stats.z.test(table, b, a, o)
      );
    });

    it('should accept two arrays', function() {
      assert.ok(stats.z.test(g1, g2, o) < 0.05);
      assert.equal(stats.z.test(g1, g2, o), stats.z.test(g2, g1, o));
    });

    it('should throw an error if arrays are of unequal size', function() {
      assert.throws(function() {
        stats.z.test([1,2,3], [1,2],o);
      });
    });

    it('should ignore non-valid values', function() {
      assert.equal(
        stats.z.test([1,2,3],  [3,4,5], o),
        stats.z.test([1,2,3,4],[3,4,5,NaN], o)
      );
    });
  });

  describe('stats.z.test two-sample', function() {
    var g1 = [2, 4, 6, 8, 10],
        g2 = [0, 1, 2, 3, 4],
        table = [{a:2,b:0}, {a:4,b:1}, {a:6,b:2}, {a:8,b:3}, {a:10,b:4}];

    it('should accept an array and accessors', function() {
      assert.ok(stats.z.test(table, a, b) < 0.05);
      assert.equal(
        stats.z.test(table, a, b),
        stats.z.test(table, b, a)
      );
    });

    it('should accept two arrays', function() {
      assert.ok(stats.z.test(g1, g2) < 0.05);
      assert.equal(
        stats.z.test(g1, g2),
        stats.z.test(g2, g1)
      );
      assert.equal(1, stats.z.test(g1, [2,3,4,5,6], {nullh:2}));
      assert.equal(1, stats.z.test([2,3,4,5,6], g1, {nullh:-2}));
    });

    it('should devolve gracefully when there is no variance', function() {
      assert.equal(0, stats.z.test([0,0], [1,1]));
      assert.equal(1, stats.z.test([1,1], [1,1]));
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
  });

  describe('mutual', function() {
    var table = [
      {a:'a', b:1, c:1, d:1},
      {a:'a', b:2, c:0, d:1},
      {a:'b', b:1, c:0, d:0},
      {a:'b', b:2, c:1, d:0}
    ];

    it('should accept object array and accessors', function() {
      assert.deepEqual([1, 0], stats.mutual(table, a, b, c));
      assert.deepEqual([0, 1], stats.mutual(table, a, b, d));
    });

    it('should handle zero vectors', function() {
      var u = table.map(a), v = table.map(b),
          x = table.map(c), y = table.map(d);
      assert.deepEqual([1, 0], stats.mutual(u, v, x));
      assert.deepEqual([0, 1], stats.mutual(u, v, y));
    });

    it('should support info/dist sub-methods', function() {
      var m = stats.mutual(table, a, b, c);
      assert.equal(m[0], stats.mutual.info(table, a, b, c));
      assert.equal(m[1], stats.mutual.dist(table, a, b, c));
      m = stats.mutual(table, a, b, d);
      assert.equal(m[0], stats.mutual.info(table, a, b, d));
      assert.equal(m[1], stats.mutual.dist(table, a, b, d));
    });
  });

  describe('profile', function() {
    it('should compute q1 correctly', function() {
      assert.equal(1.00, stats.profile([1]).q1);
      assert.equal(1.25, stats.profile([1,2]).q1);
      assert.equal(1.50, stats.profile([1,2,3]).q1);
      assert.equal(1.75, stats.profile([1,2,3,4]).q1);
      assert.equal(2.00, stats.profile([1,2,3,4,5]).q1);
      assert.equal(2.25, stats.profile([1,2,3,4,5,6]).q1);
      assert.equal(2.50, stats.profile([1,2,3,4,5,6,7]).q1);
      assert.equal(2.75, stats.profile([1,2,3,4,5,6,7,8]).q1);
    });

    it('should compute q3 correctly', function() {
      assert.equal(1.00, stats.profile([1]).q3);
      assert.equal(1.75, stats.profile([1,2]).q3);
      assert.equal(2.50, stats.profile([1,2,3]).q3);
      assert.equal(3.25, stats.profile([1,2,3,4]).q3);
      assert.equal(4.00, stats.profile([1,2,3,4,5]).q3);
      assert.equal(4.75, stats.profile([1,2,3,4,5,6]).q3);
      assert.equal(5.50, stats.profile([1,2,3,4,5,6,7]).q3);
      assert.equal(6.25, stats.profile([1,2,3,4,5,6,7,8]).q3);
    });

    it('should match stand-alone statistics', function() {
      var v = [1, 1, 3, 4, 20, null, undefined, NaN];
      var p = stats.profile(v);
      assert.equal(8, p.count);
      assert.equal(5, p.valid);
      assert.equal(2, p.missing);
      assert.equal(7, p.distinct);
      assert.equal(stats.count(v), p.count);
      assert.equal(stats.count.valid(v), p.valid);
      assert.equal(stats.count.missing(v), p.missing);
      assert.equal(stats.count.distinct(v), p.distinct);
      assert.equal(stats.extent(v)[0], p.min);
      assert.equal(stats.extent(v)[1], p.max);
      assert.equal(stats.mean(v), p.mean);
      assert.equal(stats.stdev(v), p.stdev);
      assert.equal(stats.median(v), p.median);
      assert.equal(stats.quartile(v)[0], p.q1);
      assert.equal(stats.quartile(v)[2], p.q3);
      assert.equal(stats.modeskew(v), p.modeskew);
      assert.deepEqual(stats.count.map(v), p.unique);
    });

    it('should return length statistics for strings', function(){
      var p = stats.profile(['aa', 'eeeeeeeee', 'bbb', 'cccc', 'dddddd']);
      assert.equal(p.min, 2);
      assert.equal(p.max, 9);
    });
  });


});
