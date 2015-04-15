'use strict';

var assert = require('chai').assert;
var stats = require('../src/util/stats');
var EPSILON = 1e-15;

describe('stats', function() {

  describe('unique', function() {
    it('should return unique values in the original order', function() {
      var u = stats.unique([3, 1, 2]);
      assert.deepEqual(u, [3, 1, 2]);
    });

    it('should filter out repeated occurrences of values', function() {
      var u = stats.unique([1, 1, 2, 1, 2, 3, 1, 2, 3, 3, 3]);
      assert.deepEqual(u, [1, 2, 3]);
    });

    it('should treat undefined as a value and remove duplicates', function() {
      var u = stats.unique([1, undefined, 2, undefined])
      assert.deepEqual(u, [1, undefined, 2]);
    });

    it('should apply transformation to array elements', function() {
      var u = stats.unique([1,2,3], function (d) { return -2 * d; });
      assert.deepEqual(u, [-2, -4, -6]);
    });

    it('should filter out repeated occurrences of transformed values', function() {
      var u = stats.unique([1,1,2,3], function (d) { return d<3 ? 1 : 3; });
      assert.deepEqual(u, [1, 3]);
    });
  });
  
  describe('distinct', function() {
    it('should count distinct values', function() {
      assert.equal(stats.distinct([3, 1, 2]), 3);
      assert.equal(stats.distinct([1, 1, 2, 1, 2, 3, 1, 2, 3, 3, 3]), 3);
    });
    
    it('should recognize null values', function() {
      assert.equal(stats.distinct([null, 1, 2]), 3);
    });

    it('should recognize undefined values', function() {
      assert.equal(stats.distinct([1, undefined, 2, undefined]), 3);
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
