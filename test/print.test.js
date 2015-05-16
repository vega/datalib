'use strict';

var assert = require('chai').assert;
var print = require('../src/print');

describe('print', function() {
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
    it('should print table', function() {
      var s = print.table(table);
      assert.equal(string, s);
    });

    it('should respect limit option', function() {
      var s = print.table(table, {limit:2});
      assert.equal(3, s.split('\n').length);
    });

    it('should respect minwidth option', function() {
      var s = print.table(table, {minwidth:4});
      assert.equal(0, s.indexOf('sym\u2026'));
    });

    it('should respect separator option', function() {
      var s = print.table(table, {separator:'\t'});
      assert.equal(table.length+2, s.split('\t').length);
    });
  });

});
