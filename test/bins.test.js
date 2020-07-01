'use strict';

var assert = require('chai').assert;
var bins = require('../src/bins/bins');
var $bin = require('../src/bins/histogram').$bin;
var histogram = require('../src/bins/histogram').histogram;
var time = require('../src/time');
var units = time.utc;
var util = require('../src/util');
var gen = require('../src/generate');


describe('binning', function() {

  describe('bins', function() {
    it('should throw error if called without options', function() {
      assert.throws(function() { return bins(); });
    });

    it('should bin integer values', function() {
      var b = bins({min:0, max:10, minstep:1});
      assert.equal(b.start, 0);
      assert.equal(b.stop, 10);
      assert.equal(b.step, 1);

      b = bins({min:-1, max:10, minstep:1});
      assert.equal(b.start, -1);
      assert.equal(b.stop, 10);
      assert.equal(b.step, 1);
    });

    it('should bin numeric values', function() {
      var b = bins({min:1.354, max:98.432, maxbins: 11});
      assert.equal(b.start, 0);
      assert.equal(b.stop, 100);
      assert.equal(b.step, 10);

      b = bins({min:1.354, max:98.432, maxbins: 6});
      assert.equal(b.start, 0);
      assert.equal(b.stop, 100);
      assert.equal(b.step, 20);

      b = bins({min:1.354, max:98.432, maxbins: 21, div:[5,2]});
      assert.equal(b.start, 0);
      assert.equal(b.stop, 100);
      assert.equal(b.step, 5);

      b = bins({min:9, max:46.6, maxbins:10});
      assert.equal(b.start, 5);
      assert.equal(b.stop, 50);
      assert.equal(b.step, 5);
    });

    it('should accept minimum step size', function() {
      var b = bins({min:0, max:10, minstep: 1, maxbins: 101});
      assert.equal(b.start, 0);
      assert.equal(b.stop, 10);
      assert.equal(b.step, 1);

      b = bins({min:0, max:10, maxbins: 110});
      assert.equal(b.start, 0);
      assert.equal(b.stop, 10);
      assert.equal(b.step, 0.1);
    });

    it('should accept fixed step size', function() {
      var b = bins({min:0, max:9, step: 3});
      assert.equal(b.start, 0);
      assert.equal(b.stop, 9);
      assert.equal(b.step, 3);
    });

    it('should use given step options', function() {
      var b = bins({min:0, max:20, steps: [4,10]});
      assert.equal(b.start, 0);
      assert.equal(b.stop, 20);
      assert.equal(b.step, 4);

      b = bins({min:0, max:20, steps: [4,10], maxbins:3});
      assert.equal(b.start, 0);
      assert.equal(b.stop, 20);
      assert.equal(b.step, 10);
    });
  });

  describe('bins.date', function() {
    it('should throw error if called without options', function() {
      assert.throws(function() { return bins.date(); });
    });

    it('should bin across years', function() {
      var b = bins.date({
        min: Date.parse('1/1/2000'),
        max: Date.parse('1/1/2010')
      });
      assert.equal(b.step, 1);
      assert.equal(b.unit.type, 'year');
      assert.equal(+b.value(2000), +(new Date(2000,0,1)));
    });

    it('should bin across utc years', function() {
      var b = bins.date({
        min: Date.parse('1/1/2000'),
        max: Date.parse('1/1/2010'),
        utc: true
      });
      assert.equal(b.step, 1);
      assert.equal(b.unit.type, 'year');
      assert.equal(+b.value(2000), Date.UTC(2000,0,1));
    });

    it('should accept explicit units', function() {
      var b = bins.date({
        min:  Date.parse('1/1/2000'),
        max:  Date.parse('1/1/2001'),
        unit: 'month'
      });
      assert.equal(b.step, 1);
      assert.equal(b.unit.type, 'month');

      b = bins.date({
        min:  Date.parse('1/1/2000'),
        max:  Date.parse('1/1/2010'),
        unit: 'month'
      });
      assert.equal(b.step, 6);
      assert.equal(b.unit.type, 'month');

      b = bins.date({
        min:  Date.parse('1/1/2000'),
        max:  Date.parse('1/1/2010'),
        unit: 'weekdays'
      });
      assert.equal(b.step, 1);
      assert.equal(b.unit.type, 'weekdays');
    });

    it('should support raw values', function() {
      var b = bins.date({
        min: Date.parse('1/1/2000'),
        max: Date.parse('1/1/2010'),
        raw: true
      });
      assert.equal(b.step, 1);
      assert.equal(b.unit.type, 'year');
      assert.equal(b.value(2000), 2000);
    });
  });

  describe('$bin', function() {
    var num = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    var str = ['a', 'b', 'c'];
    var mon  = [Date.UTC(2000, 0, 1), Date.UTC(2001, 0, 1)];
    var year = [Date.UTC(2000, 0, 1), Date.UTC(2010, 0, 1)];

    it('should bin numeric values', function() {
      var b = $bin({min:1, max:9});
      assert.equal(1, b(1.00));
      assert.equal(1, b(1.75));
      assert.equal(2, b(2.01));
      assert.equal(3, b(3.14));

      var b = $bin(num);
      assert.equal(1, b(1.00));
      assert.equal(1, b(1.75));
      assert.equal(2, b(2.01));
      assert.equal(3, b(3.14));

      b = $bin(num, {maxbins:5});
      assert.equal(0, b(1.00));
      assert.equal(0, b(1.75));
      assert.equal(2, b(2.01));
      assert.equal(2, b(3.14));
    });

    it('should bin date values', function() {
      function test(b) {
        assert.equal(year[0], +b(year[0]));
        assert.equal(year[1], +b(year[1]));
        assert.equal(Date.UTC(2005, 0, 1), +b(Date.UTC(2005, 5, 15)));
      }
      test($bin(year, {type:'date', utc:true}));
      test($bin(year.map(function(d) { return new Date(d); }), {utc:true}));

      var b = $bin(mon, {type:'date', unit:'month', utc:true});
      assert.equal(mon[0], +b(mon[0]));
      assert.equal(mon[1], +b(mon[1]));
      assert.equal(Date.UTC(2000, 4, 1), +b(Date.UTC(2000, 4, 15)));
    });

    it('should bin string values', function() {
      var b = $bin(str);
      for (var i=0; i<str.length; ++i) {
        assert.equal(str[i], b(str[i]));
      }
      var o = str.map(function(x) { return {a:x}; });
      b = $bin(o, 'a');
      for (var i=0; i<o.length; ++i) {
        assert.equal(o[i].a, b(o[i]));
      }
      assert.equal('foo', b({a:'foo'}));
    });

    it('should bin object properties', function() {
      var o = num.map(function(x) { return {a:x}; });
      function test(b) {
        for (var i=0; i<o.length; ++i) {
          assert.equal(o[i].a, b(o[i]));
        }
        assert.equal(1, b({a:1.00}));
        assert.equal(1, b({a:1.75}));
        assert.equal(2, b({a:2.01}));
        assert.equal(3, b({a:3.14}));
      }
      test($bin(o, 'a'));
      test($bin(o, util.$('a')));
      test($bin(o, 'a', {minstep:1}));
    });
  });

  describe('histogram', function() {
    it('should bin numeric values', function() {
      var numbers = [1,2,3,4,5,6,7,1,2,3,4,5,1,2,3];
      var h = histogram(numbers, {maxbins: 10});
      assert.deepEqual([1,2,3,4,5,6,7], h.map(util.accessor('value')));
      assert.deepEqual([3,3,3,2,2,1,1], h.map(util.accessor('count')));
    });

    it('should bin many small numeric values', function() {
      var numbers = require('./data/fatality-rates.json');
      var epsilon = 1e-14;
      var h = histogram(numbers, {maxbins: 100});
      const results = h.map(util.accessor('value'));
      [...Array(63).keys()].map(d => (d) / 100).forEach((val, idx) => {
        assert.isBelow(Math.abs(val - results[idx]), epsilon);
      });
    });

    it('should ignore null values among numbers', function() {
      var numbers = [null,1,2,3,NaN,4,5,6,undefined,7,1,2,3,4,5,1,null,2,3];
      var h = histogram(numbers, {maxbins: 10});
      assert.deepEqual([1,2,3,4,5,6,7], h.map(util.accessor('value')));
      assert.deepEqual([3,3,3,2,2,1,1], h.map(util.accessor('count')));
    });

    it('should bin integer values', function() {
      var numbers = [1,2,3,4,5,6,7,1,2,3,4,5,1,2,3];
      var h = histogram(numbers, {type: 'integer', maxbins: 20});
      assert.deepEqual([1,2,3,4,5,6,7], h.map(util.accessor('value')));
      assert.deepEqual([3,3,3,2,2,1,1], h.map(util.accessor('count')));
    });

    it('should handle accessor', function() {
      var vals = [1,2,3,4,5,6,7,1,2,3,4,5,1,2,3].map(function(x) {
        return {a: x};
      });
      var h = histogram(vals, util.$('a'), {type: 'integer', maxbins: 20});
      assert.deepEqual([1,2,3,4,5,6,7], h.map(util.accessor('value')));
      assert.deepEqual([3,3,3,2,2,1,1], h.map(util.accessor('count')));
    });

    it('should bin date values', function() {
      var dates = [
        new Date(1979, 5, 15),
        new Date(1982, 2, 19),
        new Date(1985, 4, 20)
      ];
      var h = histogram(dates, {utc: true});
      assert(h.bins.unit.type, 'year');
      assert.deepEqual(
        gen.range(1979, 1986).map(units.year.date),
        h.map(util.accessor('value'))
      );
      assert.deepEqual([1,0,0,1,0,0,1], h.map(util.accessor('count')));
    });

    it('should ignore invalid values among dates', function() {
      var dates = [
        null,
        new Date(1979, 5, 15),
        undefined,
        new Date(1982, 2, 19),
        NaN,
        new Date(1985, 4, 20),
        new Date(NaN)
      ];
      var h = histogram(dates);
      assert(h.bins.unit.type, 'year');
      assert.deepEqual(
        gen.range(1979, 1986).map(time.year.date),
        h.map(util.accessor('value'))
      );
      assert.deepEqual([1,0,0,1,0,0,1], h.map(util.accessor('count')));
    });

    it('should bin string values', function() {
      var strings = 'aaaaaabbbbbccccccccdddddeeeeeeefffff'.split('');
      var h = histogram(strings);
      assert.deepEqual(['a','b','c','d','e','f'], h.map(util.accessor('value')));
      assert.deepEqual([6,5,8,5,7,5], h.map(util.accessor('count')));
    });

    it('should support sorting binned string values', function() {
      var strings = 'aaaaaabbbbbccccccccdddddeeeeeeefffff'.split('');
      var h = histogram(strings, {sort: true});
      assert.deepEqual(['c','e','a','b','d','f'], h.map(util.accessor('value')));
      assert.deepEqual([8,7,6,5,5,5], h.map(util.accessor('count')));
    });
  });

});
