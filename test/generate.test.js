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
      assert.deepEqual([], gen.range(0, 2, -1));
    });
    it('should throw error for infinite range', function() {
      assert.throws(function() { return gen.range(0, +Infinity); });
    });
  });

  describe('random uniform', function() {
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
  });

  describe('random integer', function() {
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
  });

  describe('random normal', function() {
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
  });

});