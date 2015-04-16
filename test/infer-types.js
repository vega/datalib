'use strict';

var assert = require('chai').assert;
var util = require('../src/util/');
var infer = require('../src/import/infer-types');

describe('infer-types', function() {

  it('should infer booleans', function() {
    assert.equal("boolean", infer(["true", "false", null]));
    assert.equal("boolean", infer([true, false, null]));
  });

  it('should infer numbers', function() {
    assert.equal("number", infer(["0", "1", null, "3.1415", "Infinity", "1e-5"]));
    assert.equal("number", infer([1, 2, 3]));
  });

  it('should infer dates', function() {
    assert.equal("date", infer(["1/1/2001", null, "Jan 5, 2001"]));
    assert.equal("date", infer([new Date("1/1/2001"), null, new Date("Jan 5, 2001")]));
  });
  
  it('should infer strings when all else fails', function() {
    assert.equal("string", infer(["hello", "1", "true", null]));
  });
  
  it('should handle function accessors', function() {
    var data = [
      {a: "1", b: "true"},
      {a: "2", b: "false"},
      {a: "3", b: null}
    ];
    assert.equal("number", infer(data, util.accessor("a")));
    assert.equal("boolean", infer(data, util.accessor("b")));
  });

});