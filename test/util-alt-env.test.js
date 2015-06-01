'use strict';

var assert = require('chai').assert;
var utilpath = process.cwd() + '/src/util.js';

// Test polyfills or other environment-specific code
// Manipulates the require cache to test alternatives
describe('util alternative environment', function() {

  describe('isBuffer', function() {
    it('should be false', function() {
      var buffer = require('buffer');
      var Buffer = buffer.Buffer;
      buffer.Buffer = null;
      delete require.cache[utilpath];
      var util = require(utilpath);
      buffer.Buffer = Buffer;

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

  describe('startsWith', function() {
    it('should check string prefixes', function() {
      var startsWith = String.prototype.startsWith;
      if (!startsWith) {
        String.prototype.startsWith = function(searchString) {
          return this.lastIndexOf(searchString, 0) === 0;
        };
      } else {
        String.prototype.startsWith = undefined;
      }
      delete require.cache[utilpath];
      var util = require(utilpath);

      assert.isTrue(util.startsWith('1234512345', '12345'));
      assert.isFalse(util.startsWith('1234554321', '54321'));

      String.prototype.startsWith = startsWith;
      delete require.cache[utilpath];
    });
  });

});