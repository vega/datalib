'use strict';

var assert = require('chai').assert;
var gen = require('../src/generate');

describe('generate', function() {

  describe('repeat', function() {
    it('should generate repeated values', function() {
      assert.deepEqual([2,2,2], gen.repeat(2, 3));
      assert.deepEqual(['a','a'], gen.repeat('a', 2));
      assert.deepEqual([], gen.repeat(1, 0));
    });
    it('should throw error for negative lengths', function() {
      assert.throws(function() { return gen.repeat(1, -1); });
    });
  });

  describe('zeros', function() {
    it('should generate repeated zeros', function() {
      assert.deepEqual([0,0,0], gen.zeros(3));
      assert.deepEqual([0], gen.zeros(1));
      assert.deepEqual([], gen.zeros(0));
    });
    it('should throw error for negative lengths', function() {
      assert.throws(function() { return gen.zeros(-1); });
    });
  });

  describe('range', function() {
    it('should generate value ranges', function() {
      assert.deepEqual([0,1,2], gen.range(3));
      assert.deepEqual([2,3,4], gen.range(2, 5));
      assert.deepEqual([1,3,5,7], gen.range(1, 8, 2));
      assert.deepEqual([2,1,0], gen.range(2, -1, -1));
      assert.deepEqual([], gen.range(0, 2, -1));
    });
    it('should throw error for infinite range', function() {
      assert.throws(function() { return gen.range(0, +Infinity); });
    });
  });

  describe('random uniform', function() {
    var n1 = gen.random.uniform(-1, 1);
    function rangeTest(start, stop) {
      return function(x) {
        assert.isTrue(x >= start && x < stop);
      }
    }
    it('should generate random values', function() {
      (rangeTest(0, 1))((gen.random.uniform())());
      (rangeTest(0, 10))((gen.random.uniform(10))());
      (rangeTest(5, 10))((gen.random.uniform(5, 10))());
    });
    it('should generate multiple samples', function() {
      gen.random.uniform().samples(10).map(rangeTest(0, 1));
      gen.random.uniform(10).samples(10).map(rangeTest(0, 10));
      gen.random.uniform(5, 10).samples(10).map(rangeTest(5, 10));
    });
    it('should evaluate the pdf', function() {
      assert.equal(0.0, n1.pdf(-2));
      assert.equal(0.0, n1.pdf(2));
      assert.equal(0.5, n1.pdf(0));
      assert.equal(n1.pdf(-0.5), n1.pdf(0.5));
      assert.equal(n1.pdf(-1), n1.pdf(1));
    });
    it('should evaluate the cdf', function() {
      // extreme values
      assert.equal(0, n1.cdf(-2));
      assert.equal(1, n1.cdf(2));
      // in range values
      assert.equal(0.50, n1.cdf(0));
      assert.equal(0.25, n1.cdf(-0.5));
      assert.equal(0.75, n1.cdf(0.5));
    });
    it('should evaluate the inverse cdf', function() {
      // extreme values
      assert.ok(isNaN(n1.icdf(-2)));
      assert.ok(isNaN(n1.icdf(2)));
      assert.equal(-1, n1.icdf(0));
      assert.equal(1, n1.icdf(1));
      // in range values
      assert.equal(0, n1.icdf(0.5));
      assert.equal(-0.5, n1.icdf(0.25));
      assert.equal(0.5, n1.icdf(0.75));
    });
  });

  describe('random integer', function() {
    var n1 = gen.random.integer(0, 5);
    function intTest(start, stop) {
      return function(x) {
        assert.isTrue(x >= start && x < stop);
        assert.strictEqual(x, ~~x);
      }
    }
    it('should generate random values', function() {
      intTest(0, 10)((gen.random.integer(10))());
      intTest(5, 10)((gen.random.integer(5, 10))());
    });
    it('should generate multiple samples', function() {
      gen.random.integer(10).samples(10).map(intTest(0, 10));
      gen.random.integer(5, 10).samples(10).map(intTest(5, 10));
    });
    it('should evaluate the pdf', function() {
      assert.equal(0.0, n1.pdf(-1));
      assert.equal(0.0, n1.pdf(5));
      assert.equal(0.2, n1.pdf(0));
      assert.equal(0.2, n1.pdf(1));
      assert.equal(0.2, n1.pdf(2));
      assert.equal(0.2, n1.pdf(3));
      assert.equal(0.2, n1.pdf(4));
    });
    it('should evaluate the cdf', function() {
      assert.equal(0.0, n1.cdf(-1));
      assert.equal(0.2, n1.cdf(0));
      assert.equal(0.4, n1.cdf(1));
      assert.equal(0.6, n1.cdf(2));
      assert.equal(0.8, n1.cdf(3));
      assert.equal(1.0, n1.cdf(4));
      assert.equal(1.0, n1.cdf(5));
    });
    it('should evaluate the inverse cdf', function() {
      // extreme values
      assert.ok(isNaN(n1.icdf(-1)));
      assert.ok(isNaN(n1.icdf(2)));
      // in range values
      assert.equal(-1, n1.icdf(0));
      assert.equal(0, n1.icdf(0.2));
      assert.equal(1, n1.icdf(0.4));
      assert.equal(2, n1.icdf(0.6));
      assert.equal(3, n1.icdf(0.8));
      assert.equal(4, n1.icdf(1.0));
    });
  });

  describe('random normal', function() {
    var n1 = gen.random.normal();
    function normalTest(u, s, samples) {
      var sum = samples.reduce(function(a,b) { return a+b; }, 0);
      var avg = sum / samples.length;
      var dev = samples.reduce(function(a,b) { return a+(b-avg)*(b-avg); }, 0);
      dev = dev / (samples.length-1);
      // mean within 99.9% confidence interval
      assert.closeTo(u, avg, 4*dev/Math.sqrt(samples.length));
    }
    it('should generate normal samples', function() {
      normalTest(0, 1, gen.random.normal().samples(1000));
      normalTest(5, 1, gen.random.normal(5).samples(1000));
      normalTest(1, 10, gen.random.normal(1, 10).samples(1000));
    });
    it('should evaluate the pdf', function() {
      assert.closeTo(0.40, n1.pdf(0), 1e-2);
      assert.closeTo(0.24, n1.pdf(-1), 1e-2);
      assert.equal(n1.pdf(5), n1.pdf(-5));
    });
    it('should approximate the cdf', function() {
      // extreme values
      assert.equal(0, n1.cdf(-38));
      assert.equal(1, n1.cdf(38));
      assert.closeTo(1, n1.cdf(8), 1e-5);
      // regular values
      assert.closeTo(0.680, n1.cdf(1) - n1.cdf(-1), 1e-2);
      assert.closeTo(0.950, n1.cdf(2) - n1.cdf(-2), 1e-2);
      assert.closeTo(0.997, n1.cdf(3) - n1.cdf(-3), 1e-2);
    });
    it('should approximate the inverse cdf',function() {
      // out of domain inputs
      assert.ok(isNaN(n1.icdf(-1)));
      assert.ok(isNaN(n1.icdf(2)));
      assert.ok(isNaN(n1.icdf(0)));
      assert.ok(isNaN(n1.icdf(1)));
      // regular values
      assert.equal(0, n1.icdf(0.5));
      assert.closeTo(1, n1.icdf(n1.cdf(1)), 1e-3);
      assert.closeTo(-1, n1.icdf(n1.cdf(-1)), 1e-3);
    });
  });

  describe("random bootstrap", function(){
    it('should accept an array', function(){
      var bs = gen.random.bootstrap([1,1,1]);
      assert.equal(1, bs())
      assert.deepEqual([1,1,1], bs.samples(3));
    });
    it('should accept an array and smoothing parameter',function(){
      var bs = gen.random.bootstrap([1], 5);
      var s = bs();
      assert.ok(Math.abs(1-s) >= 0);
    });
    it('should ignore invalid values',function(){
      var bs = gen.random.bootstrap([1,null]);
      assert.equal(1000, bs.samples(1000)
        .filter(function(x) { return x != null; }).length);
    });
  });
});
