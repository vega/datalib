'use strict';

var assert = require('chai').assert;
var utilpath = process.cwd() + '/src/util.js';

// Test polyfills or other environment-specific code
// Manipulates the require cache to test alternatives
describe('util alternative environment', function() {

  describe('isBuffer', function() {
    it('should be false', function() {
      var ib = Buffer.isBuffer;
      Buffer.isBuffer = null;
      delete require.cache[utilpath];
      var util = require(utilpath);
      Buffer.isBuffer = ib;

      assert.strictEqual(util.false, util.isBuffer);

      delete require.cache[utilpath];
    });
  });

  describe('isArray', function() {
    it('should recognize arrays', function() {
      var isArray = Array.isArray;
      Array.isArray = null;
      delete require.cache[utilpath];
      var util = require(utilpath);
      Array.isArray = isArray;

      assert.isTrue(util.isArray([]));
      assert.isTrue(util.isArray([1,2,3]));
      assert.isFalse(util.isArray(1));
      assert.isFalse(util.isArray('a'));
      assert.isFalse(util.isArray(null));

      delete require.cache[utilpath];
    });
  });

});