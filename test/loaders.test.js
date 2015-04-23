'use strict';

var assert = require('chai').assert;
var util = require('../src/util');
var read = require('../src/import/read');
var loaders = require('../src/import/loaders');

var file = './test/data/stocks.csv';
var text = require('fs').readFileSync(file, 'utf8');
var csv = read(text, {type: 'csv', parse: 'auto'});

describe('loaders', function() {

  it('should read synchronously', function() {
    var data = loaders.csv("file://" + file);
    assert.deepEqual(csv, data);
  });

  it('should read asynchronously', function(done) {
    loaders.csv("file://" + file, function(error, data) {
      assert.deepEqual(csv, data);
      done();
    });
  });

  it('should read using options hash', function() {
    var data = loaders.csv({
      url: "//" + file,
      defaultProtocol: "file"
    });
    assert.deepEqual(csv, data);
  });
  
  it('should read synchronously using format argument', function() {
    var data = loaders.csv("file://" + file, {type: 'csv', parse: 'auto'});
    assert.deepEqual(csv, data);
  });
  
  it('should read asynchronously using format argument', function(done) {
    loaders.csv("file://" + file, {type: 'csv', parse: 'auto'}, function(error, data) {
      assert.deepEqual(csv, data);
      done();
    });
  });

});
