'use strict';

var assert = require('chai').assert;
var util = require('../src/util');

describe('util', function() {

  describe('isNode', function() {
    it('should be true', function() {
      assert.isTrue(util.isNode);
    });
  });

  describe('type checkers', function() {
    it('isNumber(0) should be true', function() {
      assert.isTrue(util.isNumber(0));
    });

    it('isBuffer should recognize Buffers', function() {
      var b = new Buffer('[{"a":1, "b":2}]');
      assert.isTrue(util.isBuffer(b));
      assert.isFalse(util.isBuffer(null));
      assert.isFalse(util.isBuffer(0));
      assert.isFalse(util.isBuffer("string"));
      assert.isFalse(util.isBuffer({}));
    });
  });
  
  describe('comparison function', function() {
    it('should compare numbers', function() {
      assert(util.cmp(1, 0) > 0);
      assert(util.cmp(0, 1) < 0);
      assert.strictEqual(util.cmp(12, 12), 0);
    });

    it('should compare strings', function() {
      assert(util.cmp('a', 'b') < 0);
      assert(util.cmp('b', 'a') > 0);
      assert.strictEqual(util.cmp('foo', 'foo'), 0);
    });

    it('should compare numbers to null', function() {
      assert(util.cmp(1, null) > 0);
      assert(util.cmp(null, 1) < 0);
      assert.strictEqual(util.cmp(null, null), 0);
    });

    it('should compare strings to null', function() {
      assert(util.cmp(null, 'b') < 0);
      assert(util.cmp('b', null) > 0);
    });
  });
  
  describe('comparator generator', function() {
    it('should always return 0 when called without arguments', function() {
      assert.equal(util.comparator()('a', 'b'), 0);
    });

    it('should handle single argument without prefix', function() {
      var comparator = util.comparator(['p']);
      assert.equal(comparator({'p': 1}, {'p': 0}), 1);
      assert.equal(comparator({'p': 0}, {'p': 1}), -1);
      assert.equal(comparator({'p': 1}, {'p': 1}), 0);
    });
    
    it('should handle single argument with "+" prefix', function() {
      var comparator = util.comparator(['+p']);
      assert.equal(comparator({'p': 1}, {'p': 0}), 1);
      assert.equal(comparator({'p': 0}, {'p': 1}), -1);
      assert.equal(comparator({'p': 1}, {'p': 1}), 0);
    });

    it('should handle single argument with "-" prefix', function() {
      var comparator = util.comparator(['-p']);
      assert.equal(comparator({'p': 1}, {'p': 0}), -1);
      assert.equal(comparator({'p': 0}, {'p': 1}), 1);
      assert.equal(comparator({'p': 1}, {'p': 1}), 0);
    });

    it('should handle two arguments without prefix', function() {
      var comparator = util.comparator(['p', 'q']);
      assert.equal(comparator({'p': 1}, {'p': 0}), 1);
      assert.equal(comparator({'p': 0}, {'p': 1}), -1);
      assert.equal(comparator({'p': 1, 'q': 2}, {'p': 1, 'q': -2}), 1);
      assert.equal(comparator({'p': 1, 'q': -2}, {'p': 1, 'q': 2}), -1);
      assert.equal(comparator({'p': 1, 'q': 5}, {'p': 1, 'q': 5}), 0);
    });
  });
  
  describe('number', function() {
    it('should convert numeric String to number', function() {
      assert.strictEqual(util.number('2.2'), 2.2);
    });

    it('should return NaN for unparseable Strings', function() {
      assert(isNaN(util.number('not a number')));
    });

    it('should return NaN for objects', function() {
      assert(isNaN(util.number({})));
    });

    it('should return 0 for empty arrays', function() {
      assert.strictEqual(util.number([]), 0);
    });

    it('should return value of single-item numerical arrays', function() {
      assert.strictEqual(util.number([2.2]), 2.2);
    });

    it('should return value of single-item String arrays if it can be converted', function() {
      assert.strictEqual(util.number(['2.2']), 2.2);
    });

    it('should return NaN for single-item String arrays that cannot be parsed', function() {
      assert(isNaN(util.number(['not a number'])));
    });

    it('should return NaN for arrays with several elements', function() {
      assert(isNaN(util.number([5, 2])));
    });

    it('should return NaN for functions', function() {
      assert(isNaN(util.number(function () {})));
    });

    it('should return number argument', function() {
      assert.strictEqual(util.number(2.2), 2.2);
    });
  });
  
  describe('boolean', function() {
    it('should convert string "true" to true', function() {
      assert.strictEqual(util.boolean("true"), true);
    });
    
    it('should convert string "false" to false', function() {
      assert.strictEqual(util.boolean("false"), false);
    });
    
    it('should convert string "1" to true', function() {
      assert.strictEqual(util.boolean("1"), true);
    });
    
    it('should convert string "0" to true', function() {
      assert.strictEqual(util.boolean("0"), true);
    });
    
    it('should convert number 1 to true', function() {
      assert.strictEqual(util.boolean(1), true);
    });
    
    it('should convert number 0 to false', function() {
      assert.strictEqual(util.boolean(0), false);
    });
    
    it('should return null for null argument', function() {
      assert.strictEqual(util.boolean(null), null);
      assert.strictEqual(util.boolean(undefined), null);
    });
  });
  
  describe('array', function() {
    it('should return an empty array for null argument', function() {
      assert.deepEqual(util.array(null), []);
    });

    it('should return an empty array for undefined argument', function() {
      assert.deepEqual(util.array(), []);
    });

    it('should return an unmodified array argument', function() {
      var value = [1, 2, 3];
      assert.strictEqual(util.array(value), value);
    });

    it('should return an array for non-array argument', function() {
      assert.deepEqual(util.array(1), [1]);
    });
  });
  
  describe('str', function() {
    it('should wrap string arguments in single quotation marks', function() {
      assert.strictEqual(util.str('test'), "'test'");
    });

    it('should wrap arrays in square brackets', function() {
      assert.equal(util.str(['1', '2']), "['1','2']");
    });

    it('should return boolean arguments as they are', function() {
      assert.equal(util.str(true), true);
      assert.equal(util.str(false), false);
    });

    it('should return number arguments as they are', function() {
      assert.equal(util.str(2), 2);
      assert.equal(util.str(-2), -2);
      assert.equal(util.str(-5.32), -5.32);
    });

    it('should recursively wrap arrays in square brackets', function() {
      assert.equal(util.str([['1', 3], '2']), "[['1',3],'2']");
    });
  });

  describe("keys", function() {
    it("should enumerate every defined key", function() {
      assert.deepEqual(util.keys({a: 1, b: 1}), ["a", "b"]);
    });

    it("should include keys defined on prototypes", function() {
      function Abc() {
        this.a = 1;
        this.b = 2;
      }
      Abc.prototype.c = 3;
      assert.deepEqual(util.keys(new Abc()), ["a", "b", "c"]);
    });

    it("should include keys with null or undefined values", function() {
      assert.deepEqual(util.keys({a: undefined, b: null, c: NaN}), ["a", "b", "c"]);
    });
  });
  
  describe('vals', function() {
    it("should enumerate every defined value", function() {
      assert.deepEqual(util.vals({a: 1, b: 1}), [1, 1]);
    });

    it("should include values defined on prototypes", function() {
      function Abc() {
        this.a = 1;
        this.b = 2;
      }
      Abc.prototype.c = 3;
      assert.deepEqual(util.vals(new Abc()), [1, 2, 3]);
    });

    it("should include values with null or undefined values", function() {
      assert.deepEqual(util.vals({a: undefined, b: null, c: NaN}), [undefined, null, NaN]);
    });
  });

  describe('toMap', function() {
    it("should return a boolean map of array values", function() {
      var m = util.toMap([1,3,5]);
      assert.deepEqual({'1':1, '3':1, '5':1}, m);
    });
  });

  describe('keystr', function() {
    it("should construct valid key strings", function() {
      assert.strictEqual('', util.keystr([]));
      assert.strictEqual('a', util.keystr(['a']));
      assert.strictEqual('1', util.keystr([1]));
      assert.strictEqual('null', util.keystr([null]));
      assert.strictEqual('undefined', util.keystr([undefined]));
      assert.strictEqual('NaN', util.keystr([NaN]));
      assert.strictEqual('a|2|c|true', util.keystr(['a',2,'c',true]));
    });
  });

  describe('field', function() {
    it('should treat \\. as . in field name', function() {
      assert.deepEqual(util.field('a\\.b\\.c'), ['a.b.c' ]);
    });

    it('should separate fields on .', function() {
      assert.deepEqual(util.field('a.b.c'), ['a', 'b', 'c' ]);
    });
    
    it('should support mix of \\. and .', function() {
      assert.deepEqual(
        util.field('a\\.b\\.c.a2\\.b2.a3\\.b3\\.c3'),
        ['a.b.c', 'a2.b2', 'a3.b3.c3' ]);
    });
  });
  
  describe('accessor', function() {
    it('should return null argument', function() {
      assert.isNull(util.accessor(null));
      assert.isUndefined(util.accessor(undefined));
    });

    it('should return function argument', function() {
      var f = function() {};
      assert.strictEqual(util.accessor(f), f);
    });

    it('should handle property of simple String argument', function() {
      assert.equal(util.accessor('test')({ 'test': 'value'}), 'value');
    });

    it('should resolve property paths for String arguments with "."', function() {
      assert.equal(util.accessor('a\\.b.c.d')({ 'a.b': { 'c': { 'd': 'value'}}}), 'value');
    });

    it('should handle property for number arguments', function() {
      assert.equal(util.accessor(1)(['a', 'b']), 'b');
    });
  });

  describe('mutator', function() {
    it('should handle property of simple String argument', function() {
      var o = {a: 1};
      util.mutator('a')(o, 2);
      assert.equal(2, o.a);
    });

    it('should resolve property paths for String arguments with "."', function() {
      var o = {'a.b': {'c': {'d': 'value'}}};
      util.mutator('a\\.b.c.d')(o, 'hello');
      assert.equal(o['a.b'].c.d, 'hello');
    });

    it('should handle property for number arguments', function() {
      var o = [1,2,3];
      util.mutator(0)(o, 2);
      util.mutator(1)(o, 3);
      util.mutator(2)(o, 1);
      assert.deepEqual([2,3,1], o);
    });
  });

  describe('extend', function() {
    var topic = (function() {
      function createChild(o) {
        var F = function () {
        };
        F.prototype = o;
        return new F();
      }
      var grandParent = { 'p2_1': 'vp2_1', 'p2_2': 'vp2_2' },
        parent = createChild(grandParent),
        object1 = createChild(parent),
        object2 = { 'o2_1': 'vo2_1', 'override_1': 'overridden' };
      object1['o1_1'] = 'vo1_1';
      object1['o1_2'] = 'vo1_2';
      object1['override_1'] = 'x';
      parent['p1_1'] = 'vp1_1';
      return util.extend({ 'c1': 'vc1', 'p2_2': 'x', 'o1_1': 'y'}, object1, object2);
    })();

    it('should inherit all direct properties', function() {
      assert.equal(topic['o1_1'], 'vo1_1');
      assert.equal(topic['o1_2'], 'vo1_2');
      assert.equal(topic['o2_1'], 'vo2_1');
    });

    it('should inherit all parent properties', function() {
      assert.equal(topic['p1_1'], 'vp1_1');
      assert.equal(topic['p2_1'], 'vp2_1');
      assert.equal(topic ['p2_2'], 'vp2_2');
    });

    it('should override object properties', function() {
      assert.equal(topic['o1_1'], 'vo1_1');
      assert.equal(topic['p2_2'], 'vp2_2');
    });

    it('should override values from previous arguments', function() {
      assert.equal(topic['override_1'], 'overridden');
    });
  });

  describe('duplicate', function() {
    it('should perform a deep clone of the argument', function() {
      var original = {
        'number': -3.452,
        'string': 'text',
        'boolean': true,
        'array': [ 'arrayvalue' ],
        'child': { 'value': 'original value' }
      };
      var topic = {
        'original': original,
        'clone': util.duplicate(original)
      };
      var clone = topic.clone;

      assert.strictEqual(clone.child.value, 'original value');
      assert.strictEqual(clone.number, -3.452);
      assert.strictEqual(clone.string, 'text');
      assert.strictEqual(clone.boolean, true);
      assert.deepEqual(clone.array, [ 'arrayvalue' ]);
      
      topic.clone.child.value = 'changed value';
      assert.equal(topic.original.child.value, 'original value');

      topic.clone.child.value = 'original value';
      topic.original.child.value = 'changed value';
      assert.equal(topic.clone.child.value, 'original value');
    });

    it('duplicating functions should throw error', function() {
      var f = function() { util.duplicate(function() {}); };
      assert.throws(f);
    });

    it('duplicating objects with circular dependencies should throw error', function() {
      var f = function() {
        var o1 = {}, o2 = { 'o1': o1 };
        o1['o2'] = o2;
        util.duplicate(o1);
      };
      assert.throws(f);
    });
  });

  describe('startsWith', function() {
    it('should check string prefixes', function() {
      assert.isTrue(util.startsWith('1234512345', '12345'));
      assert.isFalse(util.startsWith('1234554321', '54321'));
    });
  });

  describe('truncate', function() {
    it('should reduce string length', function() {
      assert.equal(util.truncate('123456789', 5), '1234…');
      assert.equal(util.truncate('123456789', 5, null, null, ""), '12345');
    });

    it('should respect position argument', function() {
      assert.equal(util.truncate('123456789', 5, 'right'), '1234…');
      assert.equal(util.truncate('123456789', 5, 'left'), '…6789');
      assert.equal(util.truncate('123456789', 5, 'middle'), '12…89');
    });

    it('should truncate on word boundary', function() {
      assert.equal(util.truncate('hello there', 10, 'right', true), 'hello…');
      assert.equal(util.truncate('hello there', 10, 'left', true), '…there');
      assert.equal(util.truncate('hello there friend', 15, 'middle', true), 'hello…friend');
    });
  });
});
