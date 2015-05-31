'use strict';

var assert = require('chai').assert;
var units = require('../src/time-units');

describe('time-units', function() {

  function unitDist(name, dist, d1, d2) {
    var u = units[name],
        a = u.unit(d1),
        b = u.unit(d2);
    assert.equal(dist, b-a);
  }
  
  function dateMatch(name, d) {
    var u = units[name];
    assert.equal(+d, +u.date(u.unit(d)));
  }
  
  function distMatch(name, d1, d2) {
    var u = units[name],
        a = u.unit(d1),
        b = u.unit(d2),
        d = b - a,
        r1 = u.date(a),
        r2 = u.date(b),
        x = u.unit(r1),
        y = u.unit(r2),
        z = y - x;
    assert.equal(d, z);
  }

  describe('second', function() {
    var name = 'second';
    var d1 = new Date(Date.UTC(2000,1,1,10,30,1));
    var d2 = new Date(Date.UTC(2000,1,1,10,30,2));
    it('should compute units', function() {
      unitDist(name, 1, d1, d2);
    });
    it('should compute dates', function() {
      dateMatch(name, d1);
      dateMatch(name, d2);
    });
  });

  describe('minute', function() {
    var name = 'minute';
    var d1 = new Date(Date.UTC(2000,1,1,10,30));
    var d2 = new Date(Date.UTC(2000,1,1,10,31));
    it('should compute units', function() {
      unitDist(name, 1, d1, d2);
    });
    it('should compute dates', function() {
      dateMatch(name, d1);
      dateMatch(name, d2);
    });
  });

  describe('hour', function() {
    var name = 'hour';
    var d1 = new Date(Date.UTC(2000,1,1,10));
    var d2 = new Date(Date.UTC(2000,1,1,11));
    it('should compute units', function() {
      unitDist(name, 1, d1, d2);
    });
    it('should compute dates', function() {
      dateMatch(name, d1);
      dateMatch(name, d2);
    });
  });

  describe('day', function() {
    var name = 'day';
    var d1 = new Date(Date.UTC(2000,1,1));
    var d2 = new Date(Date.UTC(2000,1,2));
    it('should compute units', function() {
      unitDist(name, 1, d1, d2);
    });
    it('should compute dates', function() {
      dateMatch(name, d1);
      dateMatch(name, d2);
    });
  });

  describe('month', function() {
    var name = 'month';
    var d1 = new Date(Date.UTC(2000,1));
    var d2 = new Date(Date.UTC(2000,2));
    it('should compute units', function() {
      unitDist(name, 1, d1, d2);
    });
    it('should compute dates', function() {
      dateMatch(name, d1);
      dateMatch(name, d2);
    });
  });

  describe('year', function() {
    var name = 'year';
    var d1 = new Date(Date.UTC(2000,0,1));
    var d2 = new Date(Date.UTC(2001,0,1));
    it('should compute units', function() {
      unitDist(name, 1, d1, d2);
    });
    it('should compute dates', function() {
      dateMatch(name, d1);
      dateMatch(name, d2);
    });
  });

  describe('minuteOfHour', function() {
    var name = 'minuteOfHour';
    var d1 = new Date(Date.UTC(2000,1,1,10,30,1));
    var d2 = new Date(Date.UTC(2000,1,1,10,31,1));
    it('should compute units', function() {
      assert.equal(30, units[name].unit(d1));
      assert.equal(31, units[name].unit(d2));
    });
    it('should compute dates', function() {
      distMatch(name, d1, d2);
    });
  });

  describe('hourOfDay', function() {
    var name = 'hourOfDay';
    var d1 = new Date(Date.UTC(2000,1,1,10,30,1));
    var d2 = new Date(Date.UTC(2000,1,1,11,30,1));
    it('should compute units', function() {
      assert.equal(10, units[name].unit(d1));
      assert.equal(11, units[name].unit(d2));
    });
    it('should compute dates', function() {
      distMatch(name, d1, d2);
    });
  });

  describe('dayOfWeek', function() {
    var name = 'dayOfWeek';
    var d1 = new Date(Date.UTC(2000,1,1,10,30,1));
    var d2 = new Date(Date.UTC(2000,1,2,10,30,1));
    it('should compute units', function() {
      assert.equal(2, units[name].unit(d1));
      assert.equal(3, units[name].unit(d2));
    });
    it('should compute dates', function() {
      distMatch(name, d1, d2);
    });
  });

  describe('dayOfMonth', function() {
    var name = 'dayOfMonth';
    var d1 = new Date(Date.UTC(2000,1,1,10,30,1));
    var d2 = new Date(Date.UTC(2000,1,2,10,30,1));
    it('should compute units', function() {
      assert.equal(1, units[name].unit(d1));
      assert.equal(2, units[name].unit(d2));
    });
    it('should compute dates', function() {
      distMatch(name, d1, d2);
    });
  });

  describe('monthOfYear', function() {
    var name = 'monthOfYear';
    var d1 = new Date(Date.UTC(2000,1,1,10,30,1));
    var d2 = new Date(Date.UTC(2000,2,1,10,30,1));
    it('should compute units', function() {
      assert.equal(1, units[name].unit(d1));
      assert.equal(2, units[name].unit(d2));
    });
    it('should compute dates', function() {
      distMatch(name, d1, d2);
    });
  });

  describe('find', function() {
    it('should find appropriate span', function() {
      var min, max, span, unit;

      min = new Date(Date.UTC(2000,1,1,10,30,1,1));
      max = new Date(Date.UTC(2000,1,1,10,30,1,5));
      span = +max - +min;
      unit = units.find(span, 1, 10);
      assert.equal('second', unit.type);

      min = new Date(Date.UTC(2000,1,1));
      max = new Date(Date.UTC(2000,1,3));
      span = +max - +min;
      unit = units.find(span, 1, 10);
      assert.equal('day', unit.type);

      min = new Date(Date.UTC(2000,1,1));
      max = new Date(Date.UTC(2010,1,3));
      span = +max - +min;
      unit = units.find(span, 1, 20);
      assert.equal('year', unit.type);
    });
  });

});