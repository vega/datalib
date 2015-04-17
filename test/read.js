'use strict';

var assert = require('chai').assert;
var util = require('../src/util');
var tree = require('../src/tree');
var read = require('../src/import/read');

var fs = require('fs');
var topojson = require('topojson');

var fields = ['a', 'b', 'c', 'd'];
var data = [
  {a:1, b:"aaa", c:true,  d:"1/1/2001"},
  {a:2, b:"bbb", c:false, d:"1/2/2001"},
  {a:3, b:"ccc", c:false, d:"1/3/2001"},
  {a:4, b:"ddd", c:true,  d:"1/4/2001"},
];
var strings = data.map(function(x) {
  return {a:String(x.a), b:x.b, c:String(x.c), d:x.d};
});
var parsed = data.map(function(x) {
  return {a:x.a, b:x.b, c:x.c, d:Date.parse(x.d)};
});
var format = {
  a: "number",
  c: "boolean",
  d: "date"
};

function toDelimitedText(data, delimiter) {
  var head = fields.join(delimiter);
  var body = data.map(function(row) {
    return fields.map(function(f) {
      var v = row[f];
      return util.isString(v) ? ('"'+v+'"') : v;
    }).join(delimiter);
  });
  return head + "\n" + body.join("\n");
}

describe('read', function() {

  describe('json', function() {
    var json = JSON.stringify(data);
    it('should read json data', function() {
      assert.deepEqual(read(json, {type:'json'}), data);
    });
    it('should parse json fields', function() {
      assert.deepEqual(read(json, {type:'json', parse: format}), parsed);
    });
    it('should auto-parse json fields', function() {
      assert.deepEqual(read(json, {type:'json', parse:'auto'}), parsed);
    });
    it('should read json from property', function() {
      var json = JSON.stringify({foo: data});
      assert.deepEqual(read(json, {type:'json', property:'foo'}), data);
    });
  });

  describe('csv', function() {
    var csv = toDelimitedText(data, ',');
    it('should read csv data', function() {
      assert.deepEqual(read(csv, {type:'csv'}), strings);
    });
    it('should parse csv fields', function() {
      assert.deepEqual(read(csv, {type:'csv', parse: format}), parsed);
    });
    it('should auto-parse csv fields', function() {
      assert.deepEqual(read(csv, {type:'csv', parse:'auto'}), parsed);
    });
  });

  describe('tsv', function() {
    var tsv = toDelimitedText(data, '\t');
    it('should read tsv data', function() {
      assert.deepEqual(read(tsv, {type:'tsv'}), strings);
    });
    it('should parse tsv fields', function() {
      assert.deepEqual(read(tsv, {type:'tsv', parse: format}), parsed);
    });
    it('should auto-parse tsv fields', function() {
      assert.deepEqual(read(tsv, {type:'tsv', parse:'auto'}), parsed);
    });
  });

  describe('topojson', function() {
    var world = fs.readFileSync('./test/data/world-110m.json', 'utf8');
    var json = JSON.parse(world);

    it('should read topojson mesh', function() {
      var mesh = read(world, {type:'topojson', mesh: "countries"});
      var tj = topojson.mesh(json, json.objects["countries"]);
      assert.equal(JSON.stringify(tj), JSON.stringify(mesh[0]));
    });

    it('should read topojson feature', function() {
      var feature = read(world, {type:'topojson', feature: "countries"});
      var tj = topojson.feature(json, json.objects["countries"]).features;
      assert.equal(JSON.stringify(tj), JSON.stringify(feature));
    });
  });
  
  describe('treejson', function() {
    var flare = fs.readFileSync('./test/data/flare.json', 'utf8');
    var json = JSON.parse(flare);

    it('should read treejson data', function() {
      assert.doesNotThrow(function() { read(flare, {type:'treejson'}); });
      var data = read(flare, {type:'treejson'});
      assert.equal(-1, data[0][tree.fields.parent]);
      assert.equal(json.name, data[0].name);
    });
  });
});
