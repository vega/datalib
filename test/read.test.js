'use strict';

var assert = require('chai').assert;
var util = require('../src/util');
var read = require('../src/import/read');

var fs = require('fs');
var topojson = require('topojson');

var fields = ['a', 'b', 'c', 'd', 'e'];
var data = [
  {a:1, b:"aaa", c:true,  d:"1/1/2001", e:1.2},
  {a:2, b:"bbb", c:false, d:"1/2/2001", e:3.4},
  {a:3, b:"ccc", c:false, d:"1/3/2001", e:5.6},
  {a:4, b:"ddd", c:true,  d:"1/4/2001", e:7.8},
];
var strings = data.map(function(x) {
  return {a:String(x.a), b:x.b, c:String(x.c), d:x.d, e:String(x.e)};
});
var parsed = data.map(function(x) {
  return {a:x.a, b:x.b, c:x.c, d:Date.parse(x.d), e:x.e};
});
parsed.types = {
  a: "integer",
  b: "string",
  c: "boolean",
  d: "date",
  e: "number"
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

  describe('type inference', function() {
    it('should infer booleans', function() {
      assert.equal("boolean", read.type(["true", "false", NaN, null]));
      assert.equal("boolean", read.type([true, false, null]));
    });
    it('should infer integers', function() {
      assert.equal("integer", read.type(["0", "1", null, "3", NaN, undefined, "-5"]));
      assert.equal("integer", read.type([1, 2, 3]));
    });
    it('should infer numbers', function() {
      assert.equal("number", read.type(["0", "1", null, "3.1415", NaN, "Infinity", "1e-5"]));
      assert.equal("number", read.type([1, 2.2, 3]));
    });
    it('should infer dates', function() {
      assert.equal("date", read.type(["1/1/2001", null, NaN, "Jan 5, 2001"]));
      assert.equal("date", read.type([new Date("1/1/2001"), null, new Date("Jan 5, 2001")]));
    });
    it('should infer strings when all else fails', function() {
      assert.equal("string", read.type(["hello", "1", "true", null]));
    });
    it('should handle function accessors', function() {
      var data = [
        {a: "1", b: "true"},
        {a: "2", b: "false"},
        {a: "3", b: null}
      ];
      assert.equal("integer", read.type(data, util.accessor("a")));
      assert.equal("boolean", read.type(data, util.accessor("b")));
    });
    it('should infer types for all fields', function() {
      assert.deepEqual(parsed.types, read.types(data));
      assert.deepEqual(parsed.types, read.types(strings));
    });
  });

  describe('json', function() {
    var json = JSON.stringify(data);
    it('should read json data', function() {
      assert.deepEqual(read(json, {type:'json'}), data);
    });
    it('should parse json fields', function() {
      assert.deepEqual(read(json, {type:'json', parse: parsed.types}), parsed);
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
      assert.deepEqual(read(csv, {type:'csv', parse: parsed.types}), parsed);
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
      assert.deepEqual(read(tsv, {type:'tsv', parse: parsed.types}), parsed);
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
      var data = null;
      assert.doesNotThrow(function() { data = read(flare, {type:'treejson'}); });
      assert.equal(json.name, data[0].name);
    });
  });
});
