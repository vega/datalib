'use strict';

var chai = require('chai');
var assert = chai.assert;
var util = require('../src/util');
var read = require('../src/import/read');
var type = require('../src/import/type');

var fs = require('fs');
var topojson = require('topojson-client');
var d3_timeF = require('d3-time-format');

chai.config.truncateThreshold = 0;

var fields = ['a', 'b', 'c', 'd', 'e', 'f.g'];
var data = [
  {a:1, b:'aaa', c:true,  d:'1/1/2001', e:1.2, 'f.g': 1},
  {a:2, b:'bbb', c:false, d:'1/2/2001', e:3.4, 'f.g': 2},
  {a:3, b:'ccc', c:false, d:'1/3/2001', e:5.6, 'f.g': 3},
  {a:4, b:'ddd', c:true,  d:'1/4/2001', e:7.8, 'f.g': 4},
];
var strings = data.map(function(x) {
  return {a:String(x.a), b:x.b, c:String(x.c), d:x.d, e:String(x.e), 'f.g':String(x['f.g'])};
});
strings.columns = fields;

// d3-dsv includes "columns" annotation, json parse does not
// so create two versions of parsed columns for testing
var parsed = data.map(function(x) {
  return {a:x.a, b:x.b, c:x.c, d:Date.parse(x.d), e:x.e, 'f.g': x['f.g']};
});
var parsedNoColumns = util.duplicate(parsed);
parsed.columns = fields;

var typeAnnotations = {
  a: 'integer',
  b: 'string',
  c: 'boolean',
  d: 'date',
  e: 'number',
  'f.g': 'integer'
};
type.annotation(parsed, typeAnnotations);
type.annotation(parsedNoColumns, typeAnnotations);

function toDelimitedText(data, delimiter) {
  var head = fields.join(delimiter);
  var body = data.map(function(row) {
    return fields.map(function(f) {
      var v = row[f];
      return util.isString(v) ? ('"'+v+'"') : v;
    }).join(delimiter);
  });
  return head + '\n' + body.join('\n');
}

describe('read', function() {

  describe('type checks', function() {
    it('should check nulls', function() {
      assert.equal(null, type([null]));
    });
    it('should check booleans', function() {
      assert.equal('boolean', type([NaN, null, true, false]));
    });
    it('should check numbers', function() {
      assert.equal('number', type([NaN, null, 1, 2]));
      assert.equal('number', type([NaN, null, 1.4, 2.3]));
    });
    it('should check dates', function() {
      assert.equal('date', type([NaN, null, new Date('1/1/2001'), new Date('Jan 5, 2001')]));
    });
    it('should check strings', function() {
      assert.equal('string', type([NaN, null, '', 'a', 'b']));
    });
    it('should support accessor', function() {
      assert.equal('string', type([{a:null}, {a:'a'}, {a:'b'}], util.$('a')));
      assert.equal('string', type([{a:null}, {a:'a'}, {a:'b'}], 'a'));
    });
    it('should recover type annotations', function() {
      assert.isNull(type.annotation([]));
      assert.isUndefined(type.all([]));
      var types = type.all(parsed);
      assert.deepEqual(type.annotation(parsed), types);
    });
    it('should use existing type annotations', function() {
      var d = data.slice();
      var types = type.inferAll(d);
      type.annotation(d, types);
      assert.equal('integer', type(d, 'a'));
      types.a = 12345;
      assert.equal('number', type(d, 'a'));
    });
  });

  describe('type parsers', function() {
    var p = type.parsers;
    it('should parse booleans', function() {
      assert.equal(true, p.boolean('true'));
      assert.equal(false, p.boolean('false'));
      assert.equal(null, p.boolean(null));
    });
    it('should parse numbers', function() {
      assert.equal(1, p.number('1'));
      assert.equal(3.14, p.number('3.14'));
      assert.equal(100, p.number('1e2'));
      assert.equal(null, p.number(null));
    });
    it('should parse date', function() {
      assert.equal(+(new Date(2000, 0, 1)), +p.date('1/1/2000'));
      assert.equal(null, p.date(null));
    });
    it('should parse date with format', function() {
      assert.equal(+(new Date(1990, 6, 18)),
        +p.date('18.07.1990', d3_timeF.format('%d.%m.%Y')));
      assert.equal(+(new Date(1990, 6, 18)),
        +p.date('07.18.1990', d3_timeF.format('%m.%d.%Y')));
      assert.equal(null, p.date(null, '%d.%m.%Y'));
    });
    it('should parse strings', function() {
      assert.equal('a', p.string('a'));
      assert.equal('bb', p.string('bb'));
      assert.equal(null, p.string(''));
      assert.equal(null, p.string(null));
    });
  });

  describe('type inference', function() {
    it('should infer booleans', function() {
      assert.equal('boolean', type.infer(['true', 'false', NaN, null]));
      assert.equal('boolean', type.infer([true, false, null]));
    });
    it('should infer integers', function() {
      assert.equal('integer', type.infer(['0', '1', null, '3', NaN, undefined, '-5']));
      assert.equal('integer', type.infer([1, 2, 3]));
    });
    it('should infer numbers', function() {
      assert.equal('number', type.infer(['0', '1', null, '3.1415', NaN, 'Infinity', '1e-5']));
      assert.equal('number', type.infer([1, 2.2, 3]));
    });
    it('should infer dates', function() {
      assert.equal('date', type.infer(['1/1/2001', null, NaN, 'Jan 5, 2001']));
      assert.equal('date', type.infer([new Date('1/1/2001'), null, new Date('Jan 5, 2001')]));
    });
    it('should infer strings when all else fails', function() {
      assert.equal('string', type.infer(['hello', '', '1', 'true', null]));
    });
    it('should handle function accessors', function() {
      var data = [
        {a: '1', b: 'true'},
        {a: '2', b: 'false'},
        {a: '3', b: null}
      ];
      assert.equal('integer', type.infer(data, 'a'));
      assert.equal('boolean', type.infer(data, 'b'));
      assert.equal('integer', type.infer(data, util.accessor('a')));
      assert.equal('boolean', type.infer(data, util.accessor('b')));
    });
    it('should infer types for all fields', function() {
      assert.deepEqual(type.annotation(parsed), type.inferAll(data));
      assert.deepEqual(type.annotation(parsed), type.inferAll(strings));
    });
  });

  describe('json', function() {
    var json = JSON.stringify(data);
    it('should read json data', function() {
      assert.deepEqual(read(json), data);
      assert.deepEqual(read(json, {type:'json'}), data);
    });
    it('should parse json fields', function() {
      assert.deepEqual(read(json, {type:'json', parse: type.annotation(parsed)}), parsedNoColumns);
    });
    it('should auto-parse json fields', function() {
      assert.deepEqual(read(json, {type:'json', parse:'auto'}), parsedNoColumns);
    });
    it('should read json from property', function() {
      var json = JSON.stringify({foo: data});
      assert.deepEqual(read(json, {type:'json', property:'foo'}), data);
    });

    it('should parse date with format %d.%m.%Y', function() {
      var expected = [{foo: new Date(1990, 6, 18)}];
      var json = [{foo: '18.07.1990'}];
      var types = {foo: 'date:"%d.%m.%Y"'};
      type.annotation(expected, types);
      assert.deepEqual(
        read(json, {type:'json', parse: types}),
        expected);

      // repeat with single quoted pattern
      expected = [{foo: new Date(1990, 6, 18)}];
      json = [{foo: '18.07.1990'}];
      types = {foo: "date:'%d.%m.%Y'"};
      type.annotation(expected, types);
      assert.deepEqual(
        read(json, {type:'json', parse: types}),
        expected);
    });
    it('should parse date with format %m.%d.%Y', function() {
      var expected = [{foo: new Date(1990, 6, 18)}];
      var json = [{foo: '07.18.1990'}];
      var types = {foo: 'date:"%m.%d.%Y"'};
      type.annotation(expected, types);
      assert.deepEqual(
        read(json, {type:'json', parse: types}),
        expected);

      // repeat with single quoted pattern
      expected = [{foo: new Date(1990, 6, 18)}];
      json = [{foo: '07.18.1990'}];
      types = {foo: "date:'%m.%d.%Y'"};
      type.annotation(expected, types);
      assert.deepEqual(
        read(json, {type:'json', parse: types}),
        expected);
    });
    it('should parse time with format %H:%M', function() {
      var expected = [{foo: new Date(1900, 0, 1, 13, 15)}];
      var json = [{foo: '13:15'}];
      var types = {foo: 'date:"%H:%M"'};
      type.annotation(expected, types);
      assert.deepEqual(
        read(json, {type:'json', parse: types}),
        expected);

      // repeat with single quoted pattern
      var expected = [{foo: new Date(1900, 0, 1, 13, 15)}];
      var json = [{foo: '13:15'}];
      var types = {foo: "date:'%H:%M'"};
      type.annotation(expected, types);
      assert.deepEqual(
        read(json, {type:'json', parse: types}),
        expected);
    });
    it('should throw error if format is not escaped', function() {
      var json = [{foo: '18.07.1990'}];
      var types = {foo: 'date:%d.%m.%Y'};
      assert.throws(function() {
        read(json, {type:'json', parse: types});
      });
    });
    it('should throw error if format is unrecognized', function() {
      var json = [{foo: '18.07.1990'}];
      var types = {foo: 'notAType'};
      assert.throws(function() {
        read(json, {type:'json', parse: types});
      });
    });
  });

  describe('csv', function() {
    var csv = toDelimitedText(data, ',');
    it('should read csv data', function() {
      assert.deepEqual(read(csv, {type:'csv'}), strings);
    });
    it('should parse csv fields', function() {
      assert.deepEqual(read(csv, {type:'csv', parse:type.annotation(parsed)}), parsed);
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
      assert.deepEqual(read(tsv, {type:'tsv', parse:type.annotation(parsed)}), parsed);
    });
    it('should auto-parse tsv fields', function() {
      assert.deepEqual(read(tsv, {type:'tsv', parse:'auto'}), parsed);
    });
  });

  describe('dsv', function() {
    var psv = toDelimitedText(data, '|');
    it('should read dsv data', function() {
      assert.deepEqual(read(psv, {type:'dsv', delimiter:'|'}), strings);
      assert.equal(read('', {type:'dsv', delimiter:'|'}), '');
    });
    it('should support delimiter constructor', function() {
      var reader = read.formats.dsv.delimiter('|');
      assert.deepEqual(reader(psv), strings);
    });
    it('should accept header parameter', function() {
      var body = psv.slice(psv.indexOf('\n')+1);
      assert.deepEqual(read(body, {
        type: 'dsv',
        delimiter: '|',
        header: fields
      }), strings);
    });
    it('should parse dsv fields', function() {
      assert.deepEqual(read(psv, {type:'dsv', delimiter:'|', parse:type.annotation(parsed)}), parsed);
    });
    it('should auto-parse dsv fields', function() {
      assert.deepEqual(read(psv, {type:'dsv', delimiter:'|', parse:'auto'}), parsed);
    });
  });

  describe('topojson', function() {
    var world = fs.readFileSync('./test/data/world-110m.json', 'utf8');
    var json = JSON.parse(world);

    it('should read topojson mesh', function() {
      var mesh = read(world, {type:'topojson', mesh: 'countries'});
      var tj = topojson.mesh(json, json.objects['countries']);
      assert.equal(JSON.stringify(tj), JSON.stringify(mesh[0]));
    });

    it('should read topojson feature', function() {
      var feature = read(world, {type:'topojson', feature: 'countries'});
      var tj = topojson.feature(json, json.objects['countries']).features;
      assert.equal(JSON.stringify(tj), JSON.stringify(feature));
    });

    it('should throw error if topojson library unavailable', function() {
      read.formats.topojson.topojson = null;
      assert.throws(function() {
        read(world, {type:'topojson', mesh: 'countries'});
      });
      read.formats.topojson.topojson = topojson;
    });

    it('should throw error if topojson is invalid', function() {
      var data = {objects: {}};
      assert.throws(function() {
        read(data, {type:'topojson', feature: 'countries'});
      });
      assert.throws(function() {
        read(data, {type:'topojson', mesh: 'countries'});
      });
    });

    it('should throw error if topojson parameters are missing', function() {
      assert.throws(function() { read(world, {type:'topojson'}); });
    });
  });

  describe('treejson', function() {
    var flare = fs.readFileSync('./test/data/flare.json', 'utf8');
    var json = JSON.parse(flare);

    it('should read treejson data', function() {
      var data = null;
      assert.doesNotThrow(function() { data = read(flare, {type:'treejson'}); });
      assert.equal(json.name, data[0].name);
      assert.equal(data[0].hasOwnProperty('parent'), true);
      assert.equal(data[0].parent, null);
    });
  });
});
