'use strict';

var assert = require('chai').assert;
var util = require('../src/util');
var stats = require('../src/stats');
var groupby = require('../src/aggregate/groupby');

describe('aggregate', function() {

  describe('groupby', function() {
    var table = [
      {a: 1, b: 1},
      {a: 2, b: 2},
      {a: 3, b: 2},
      {a: 3, b: 1}
    ];

    it('should accept string argument', function() {
      assert.equal(3, groupby('a').execute(table).length);
      assert.equal(2, groupby('b').execute(table).length);
    });

    it('should accept array argument', function() {
      assert.equal(3, groupby(['a']).execute(table).length);
      assert.equal(2, groupby(['b']).execute(table).length);
      assert.equal(4, groupby(['a','b']).execute(table).length);
      assert.equal(4, groupby(['b','a']).execute(table).length);
    });

    it('should accept accessor arguments', function() {
      var a = util.accessor('a');
      var b = util.accessor('b');
      assert.equal(3, groupby(a).execute(table).length);
      assert.equal(2, groupby(b).execute(table).length);
      assert.equal(4, groupby([a,b]).execute(table).length);
      assert.equal(4, groupby([b,a]).execute(table).length);
    });

    it('should accept object arguments', function() {
      var a = {name:'a', get:util.accessor('a')};
      var b = {name:'a', get:util.accessor('b')};
      assert.equal(3, groupby(a).execute(table).length);
      assert.equal(2, groupby(b).execute(table).length);
      assert.equal(4, groupby([a,b]).execute(table).length);
      assert.equal(4, groupby([b,a]).execute(table).length);
    });

    it('should accept varargs', function() {
      assert.equal(4, groupby('a', 'b').execute(table).length);
      assert.equal(4, groupby('b', 'a').execute(table).length);
    });

    it('should collect tuples by default', function() {
      var g = groupby('b').execute(table);
      assert.deepEqual([table[0], table[3]], g[0].data);
      assert.deepEqual([table[1], table[2]], g[1].data);
    });
  });
  
  describe('summarize', function() {
    var values = [1, 2, 3, null, 4, 5, 6, undefined, NaN, 7, 8, 9];
    var table = values.map(function(x) { return {a:x}; });

    function run(obj) {
      return groupby().summarize(obj).execute(table)[0];
    }

    it('should accept object arguments', function() {
      var sum = run({'a':'sum'}).sum_a;
      var mean = run({'a':'mean'}).mean_a;
      var both = run({'a':['sum','mean']});
      assert.equal(sum, both.sum_a);
      assert.equal(mean, both.mean_a);
    });

    it('should accept array arguments', function() {
      var sum  = run([{name:'a', ops:['sum']}]).sum_a;
      var mean = run([{name:'a', ops:['mean']}]).mean_a;
      var both = run([{name:'a', ops:['sum','mean']}]);
      assert.equal(sum, both.sum_a);
      assert.equal(mean, both.mean_a);
    });

    it('should support output renaming', function() {
      var sum1 = run([{name:'a', ops:['sum']}]).sum_a;
      var sum2 = run([{name:'a', ops:['sum'], as:['hello']}]).hello;
      assert.equal(sum1, sum2);
    });

    it('should support getter argument', function() {
      var sum1 = run([{name:'a', ops:['sum']}]).sum_a;
      var sum2 = run([{name:'f', get:util.accessor('a'), ops:['sum']}]).sum_f;
      assert.equal(sum1, sum2);
    });

    it('should collect tuples', function() {
      assert.deepEqual(table, run({'*':'data'}).data);
    });

    it('should count all values', function() {
      assert.equal(stats.count(values), run({'*':'count'}).count);
    });

    it('should count null values', function() {
      assert.equal(stats.count.nulls(values), run({'a':'nulls'}).nulls_a);
    });

    it('should count valid values', function() {
      assert.equal(stats.count.valid(values), run({'a':'valid'}).valid_a);
    });

    it('should count distinct values', function() {
      assert.equal(stats.count.distinct(values), run({'a':'distinct'}).distinct_a);
    });

    it('should compute sum', function() {
      assert.equal(stats.sum(values), run({'a':'sum'}).sum_a);
    });

    it('should compute median', function() {
      assert.equal(stats.median(values), run({'a':'median'}).median_a);
    });

    it('should compute q1', function() {
      assert.equal(stats.quartile(values)[0], run({'a':'q1'}).q1_a);
    });

    it('should compute q3', function() {
      assert.equal(stats.quartile(values)[2], run({'a':'q3'}).q3_a);
    });

    it('should compute mean', function() {
      assert.equal(stats.mean(values), run({'a':'mean'}).mean_a);
    });

    it('should compute var', function() {
      assert.equal(stats.variance(values), run({'a':'var'}).var_a);
    });

    it('should compute stdev', function() {
      assert.equal(stats.stdev(values), run({'a':'stdev'}).stdev_a);
    });

    it('should compute varp', function() {
      var N = stats.count.valid(values);
      var v = stats.variance(values);
      assert.equal((N-1)*v/N, run({'a':'varp'}).varp_a);
    });

    it('should compute stdevp', function() {
      var N = stats.count.valid(values);
      var v = stats.variance(values);
      assert.equal(Math.sqrt((N-1)*v/N), run({'a':'stdevp'}).stdevp_a);
    });

    it('should compute modeskew', function() {
      assert.equal(stats.modeskew(values), run({'a':'modeskew'}).modeskew_a);
    });

    it('should compute min', function() {
      assert.equal(stats.extent(values)[0], run({'a':'min'}).min_a);
    });

    it('should compute max', function() {
      assert.equal(stats.extent(values)[1], run({'a':'max'}).max_a);
    });

    it('should compute argmin', function() {
      assert.strictEqual(table[0], run({'a':'argmin'}).argmin_a);
    });

    it('should compute argmax', function() {
      assert.strictEqual(table[table.length-1], run({'a':'argmax'}).argmax_a);
    });
  });

  describe('aggregator', function() {
    var table = [
      {a:1, b:1},
      {a:2, b:1},
      {a:3, b:2},
      {a:4, b:2}
    ];

    it('should accept streaming inserts', function() {
      var sum = groupby().summarize({'a':'sum'})
        .insert([table[0], table[1]])
        .insert([table[2], table[3]])
        .result();
      assert.equal(10, sum[0].sum_a);
    });

    it('should reject streaming removes if unrequested', function() {
      assert.throws(function() {
        var sum = groupby().summarize({'a':'sum'})
          .insert(table)
          .remove([table[2], table[3]])
          .result();
      });
    });

    it('should accept streaming removes if requested', function() {
      var sum = groupby()
        .stream(true)
        .summarize({'a':'sum'})
        .insert(table)
        .remove([table[2], table[3]])
        .result();
      assert.equal(3, sum[0].sum_a);
    });

    it('should support measure getter reconfiguration', function() {
      var sum = groupby().summarize({'a':'sum'}).insert(table)
        .accessors({'a':'b'}).insert(table).result();
      assert.equal(16, sum[0].sum_a);
      sum = groupby().summarize({'a':'sum'}).insert(table)
        .accessors({'a':util.accessor('b')}).insert(table).result();
      assert.equal(16, sum[0].sum_a);
    });
  });
});