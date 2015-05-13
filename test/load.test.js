'use strict';

var assert = require('chai').assert;
var util = require('../src/util');
var load = require('../src/import/load');

var host = 'uwdata.github.io';
var dir = '/datalib/';
var base = 'http://' + host + dir;
var uri = 'data/flare.json';
var url = base + uri;
var rel = '//' + host + dir + uri;
var file = './test/' + uri;
var text = require('fs').readFileSync(file, 'utf8');

describe('load', function() {

  it('should load from file path', function(done) {
    load({file: file}, function(error, data) {
      assert.equal(text, data);
      done();
    });
  });
  
  it('should load from file path synchronously', function() {
    assert.equal(text, load({file: file}));
  });

  it('should load from file url', function(done) {
    load({url: "file://" + file}, function(error, data) {
      assert.equal(text, data);
      done();
    });
  });

  it('should load from http url', function(done) {
    load({url: url}, function(error, data) {
      assert.equal(text, data);
      done();
    });
  });

  it('should load from http url synchronously', function() {
    assert.equal(text, load({url: url}));
  });

  it('should load from http base url + uri', function(done) {
    load(
      {baseURL: base, url: uri},
      function(error, data) {
        assert.equal(text, data);
        done();
      }
    );
  });

  it('should load from relative protocol http url', function(done) {
    load({url: rel},
      function(error, data) {
        assert.equal(text, data);
        done();
      }
    );
  });

  it('should load from relative protocol file url', function(done) {
    load({url: "//"+file, defaultProtocol: 'file'},
      function(error, data) {
        assert.equal(text, data);
        done();
      }
    );
  });

  it('should load from white-listed http domain', function(done) {
    load({url: url, domainWhiteList: [host]},
      function(error, data) {
        assert.equal(text, data);
        done();
      }
    );
  });

  it('should not load from un-white-listed http domain', function(done) {
    load({url: url, domainWhiteList: []},
      function(error, data) {
        assert.isNotNull(error);
        done();
      }
    );
  });
});
