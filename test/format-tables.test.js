'use strict';

var assert = require('chai').assert;
var tables = require('../src/format-tables');
var stats = require('../src/stats');

describe('format tables', function() {

  // format tables
  var table = [
    {symbol:'DATA', value: 300.57},
    {symbol:'DATA', value: 12.3},
    {symbol:'DATA', value: 27},
  ];

  var string = 'symbol  value  \n' +
               'DATA   300.5700\n' +
               'DATA    12.3000\n' +
               'DATA    27.0000';

  describe('table', function() {
    it('should format table', function() {
      var s = tables.table(table);
      assert.equal(string, s);
    });

    it('should respect limit option', function() {
      var s = tables.table(table, {limit:2});
      assert.equal(3, s.split('\n').length);
    });

    it('should respect start option', function() {
      var s = tables.table(table, {start:2});
      assert.equal(2, s.split('\n').length);
    });

    it('should respect minwidth option', function() {
      var s = tables.table(table, {minwidth:4});
      assert.equal(0, s.indexOf('sym\u2026'));
    });

    it('should respect maxwidth option', function() {
      var s = tables.table(table, {maxwidth:4});
      assert.equal(0, s.indexOf('sym\u2026'));
      s = tables.table(table, {maxwidth:-1});
      assert.equal(-1, s.indexOf('\u2026'));
    });

    it('should respect separator option', function() {
      var s = tables.table(table, {separator:'\t'});
      assert.equal(table.length+2, s.split('\t').length);
    });
  });

  describe('summary', function() {
    function count(string, pattern) {
      var count = 0, idx = 0;
      while ((idx = string.indexOf(pattern, idx) + 1) > 0) {
        count += 1;
      }
      return count;
    }

    var data = [
      {symbol:'DATA', value: 300.57},
      {symbol:'DATA', value: 12.3},
      {symbol:'DATA', value: 27},
      {symbol:'DATA', value: 1},
      {symbol:'DATA', value: 2},
      {symbol:'DATA', value: 3},
      {symbol:'DATA', value: 4},
      {symbol:'DATA', value: 5},
      {symbol:'DATA', value: 6},
      {symbol:'DATA', value: 7},
      {symbol:'DATA', value: 8},
      {symbol:'DATA', value: NaN},
      {symbol:'ATAD', value: 0},
    ];

    it('should format summary', function() {
      var summary = stats.summary(data);
      var s1 = tables.summary(data);
      var s2 = tables.summary(summary);
      var s3 = (summary.toString = tables.summary, summary.toString());
      assert.strictEqual(s1, s2);
      assert.strictEqual(s1, s3);
      assert.equal(2, count(s1, '-- '));
      assert.equal(2, count(s1, 'valid'));
      assert.equal(1, count(s1, 'top values'));
      assert.equal(1, count(s1, 'median'));
    });
  });

});