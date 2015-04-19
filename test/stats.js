'use strict';

var assert = require('chai').assert;
var stats = require('../src/stats');
var EPSILON = 1e-15;

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
  
  describe('median', function() {
    it('should calculate median values', function() {
      assert.equal(stats.median([3, 1, 2]), 2);
      assert.equal(stats.median([-2, -2, -1, 1, 2, 2]), 0);
    });
    
    it('should ignore null values', function() {
      assert.equal(stats.median([1, 2, null]), 1.5);
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

});
