'use strict';

var assert = require('chai').assert;
var time = require('../src/time');
var utc = time.utc;
var locale = time;

describe('time', function() {

  function unitDist(units, name, dist, d1, d2) {
    var u = units[name],
        a = u.unit(d1),
        b = u.unit(d2);
    assert.equal(dist, b-a);
  }

  function dateMatch(units, name, d) {
    var u = units[name];
    assert.equal(+d, +u.date(u.unit(d)));
  }

  function distMatch(units, name, d1, d2) {
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

  describe('utc', function() {

    describe('second', function() {
      var name = 'second';
      var d1 = new Date(Date.UTC(2000,1,1,10,30,1));
      var d2 = new Date(Date.UTC(2000,1,1,10,30,2));
      it('should compute units', function() {
        unitDist(utc, name, 1, d1, d2);
      });
      it('should compute dates', function() {
        dateMatch(utc, name, d1);
        dateMatch(utc, name, d2);
      });
    });

    describe('minute', function() {
      var name = 'minute';
      var d1 = new Date(Date.UTC(2000,1,1,10,30));
      var d2 = new Date(Date.UTC(2000,1,1,10,31));
      it('should compute units', function() {
        unitDist(utc, name, 1, d1, d2);
      });
      it('should compute dates', function() {
        dateMatch(utc, name, d1);
        dateMatch(utc, name, d2);
      });
    });

    describe('hour', function() {
      var name = 'hour';
      var d1 = new Date(Date.UTC(2000,1,1,10));
      var d2 = new Date(Date.UTC(2000,1,1,11));
      it('should compute units', function() {
        unitDist(utc, name, 1, d1, d2);
      });
      it('should compute dates', function() {
        dateMatch(utc, name, d1);
        dateMatch(utc, name, d2);
      });
    });

    describe('day', function() {
      var name = 'day';
      var d1 = new Date(Date.UTC(2000,1,1));
      var d2 = new Date(Date.UTC(2000,1,2));
      it('should compute units', function() {
        unitDist(utc, name, 1, d1, d2);
      });
      it('should compute dates', function() {
        dateMatch(utc, name, d1);
        dateMatch(utc, name, d2);
      });
    });

    describe('month', function() {
      var name = 'month';
      var d1 = new Date(Date.UTC(2000,1));
      var d2 = new Date(Date.UTC(2000,2));
      it('should compute units', function() {
        unitDist(utc, name, 1, d1, d2);
      });
      it('should compute dates', function() {
        dateMatch(utc, name, d1);
        dateMatch(utc, name, d2);
      });
    });

    describe('year', function() {
      var name = 'year';
      var d1 = new Date(Date.UTC(2000,0,1));
      var d2 = new Date(Date.UTC(2001,0,1));
      it('should compute units', function() {
        unitDist(utc, name, 1, d1, d2);
      });
      it('should compute dates', function() {
        dateMatch(utc, name, d1);
        dateMatch(utc, name, d2);
      });
    });

    describe('seconds', function() {
      var name = 'seconds';
      var d1 = new Date(Date.UTC(2000,1,1,10,30,28));
      var d2 = new Date(Date.UTC(2000,1,1,10,30,29));
      it('should compute units', function() {
        assert.equal(28, utc[name].unit(d1));
        assert.equal(29, utc[name].unit(d2));
      });
      it('should compute dates', function() {
        distMatch(utc, name, d1, d2);
      });
    });

    describe('minutes', function() {
      var name = 'minutes';
      var d1 = new Date(Date.UTC(2000,1,1,10,30,1));
      var d2 = new Date(Date.UTC(2000,1,1,10,31,1));
      it('should compute units', function() {
        assert.equal(30, utc[name].unit(d1));
        assert.equal(31, utc[name].unit(d2));
      });
      it('should compute dates', function() {
        distMatch(utc, name, d1, d2);
      });
    });

    describe('hours', function() {
      var name = 'hours';
      var d1 = new Date(Date.UTC(2000,1,1,10,30,1));
      var d2 = new Date(Date.UTC(2000,1,1,11,30,1));
      it('should compute units', function() {
        assert.equal(10, utc[name].unit(d1));
        assert.equal(11, utc[name].unit(d2));
      });
      it('should compute dates', function() {
        distMatch(utc, name, d1, d2);
      });
    });

    describe('weekdays', function() {
      var name = 'weekdays';
      var d1 = new Date(Date.UTC(2000,1,1,10,30,1));
      var d2 = new Date(Date.UTC(2000,1,2,10,30,1));
      it('should compute units', function() {
        assert.equal(2, utc[name].unit(d1));
        assert.equal(3, utc[name].unit(d2));
      });
      it('should compute dates', function() {
        distMatch(utc, name, d1, d2);
      });
    });

    describe('dates', function() {
      var name = 'dates';
      var d1 = new Date(Date.UTC(2000,1,1,10,30,1));
      var d2 = new Date(Date.UTC(2000,1,2,10,30,1));
      it('should compute units', function() {
        assert.equal(1, utc[name].unit(d1));
        assert.equal(2, utc[name].unit(d2));
      });
      it('should compute dates', function() {
        distMatch(utc, name, d1, d2);
      });
    });

    describe('months', function() {
      var name = 'months';
      var d1 = new Date(Date.UTC(2000,1,1,10,30,1));
      var d2 = new Date(Date.UTC(2000,2,1,10,30,1));
      it('should compute units', function() {
        assert.equal(1, utc[name].unit(d1));
        assert.equal(2, utc[name].unit(d2));
      });
      it('should compute dates', function() {
        distMatch(utc, name, d1, d2);
      });
    });

    describe('find', function() {
      it('should find appropriate span', function() {
        var min, max, span, unit;

        min = new Date(Date.UTC(2000,1,1,10,30,1,1));
        max = new Date(Date.UTC(2000,1,1,10,30,1,5));
        span = +max - +min;
        unit = utc.find(span, 1, 10);
        assert.equal('second', unit.type);

        min = new Date(Date.UTC(2000,1,1));
        max = new Date(Date.UTC(2000,1,3));
        span = +max - +min;
        unit = utc.find(span, 1, 10);
        assert.equal('day', unit.type);

        min = new Date(Date.UTC(2000,1,1));
        max = new Date(Date.UTC(2010,1,3));
        span = +max - +min;
        unit = utc.find(span, 1, 20);
        assert.equal('year', unit.type);

        min = new Date(Date.UTC(2000,1,1));
        max = new Date(Date.UTC(2005,1,1));
        span = +max - +min;
        unit = utc.find(span, 50, 200);
        assert.equal('month', unit.type);
      });
    });

  });

  describe('locale', function() {

    describe('second', function() {
      var name = 'second';
      var d1 = new Date(2000,1,1,10,30,1);
      var d2 = new Date(2000,1,1,10,30,2);
      it('should compute units', function() {
        unitDist(locale, name, 1, d1, d2);
      });
      it('should compute dates', function() {
        dateMatch(locale, name, d1);
        dateMatch(locale, name, d2);
      });
    });

    describe('minute', function() {
      var name = 'minute';
      var d1 = new Date(2000,1,1,10,30);
      var d2 = new Date(2000,1,1,10,31);
      it('should compute units', function() {
        unitDist(locale, name, 1, d1, d2);
      });
      it('should compute dates', function() {
        dateMatch(locale, name, d1);
        dateMatch(locale, name, d2);
      });
    });

    describe('hour', function() {
      var name = 'hour';
      var d1 = new Date(2000,1,1,10);
      var d2 = new Date(2000,1,1,11);
      it('should compute units', function() {
        unitDist(locale, name, 1, d1, d2);
      });
      it('should compute dates', function() {
        dateMatch(locale, name, d1);
        dateMatch(locale, name, d2);
      });
      it('should respect daylight saving', function() {
        dateMatch(locale, name, new Date(2015, 10, 1, 0));
        dateMatch(locale, name, new Date(2015, 10, 1, 1));
        dateMatch(locale, name, new Date(2015, 10, 1, 2));
      });
    });

    describe('day', function() {
      var name = 'day';
      var d1 = new Date(2000,1,1);
      var d2 = new Date(2000,1,2);
      it('should compute units', function() {
        unitDist(locale, name, 1, d1, d2);
      });
      it('should compute dates', function() {
        dateMatch(locale, name, d1);
        dateMatch(locale, name, d2);
      });
      it('should respect daylight saving', function() {
        dateMatch(locale, name, new Date(2015, 10, 0));
        dateMatch(locale, name, new Date(2015, 10, 1));
        dateMatch(locale, name, new Date(2015, 10, 2));
      });
    });

    describe('month', function() {
      var name = 'month';
      var d1 = new Date(2000,1);
      var d2 = new Date(2000,2);
      it('should compute units', function() {
        unitDist(locale, name, 1, d1, d2);
      });
      it('should compute dates', function() {
        dateMatch(locale, name, d1);
        dateMatch(locale, name, d2);
      });
    });

    describe('year', function() {
      var name = 'year';
      var d1 = new Date(2000,0,1);
      var d2 = new Date(2001,0,1);
      it('should compute units', function() {
        unitDist(locale, name, 1, d1, d2);
      });
      it('should compute dates', function() {
        dateMatch(locale, name, d1);
        dateMatch(locale, name, d2);
      });
    });

    describe('seconds', function() {
      var name = 'seconds';
      var d1 = new Date(2000,1,1,10,30,28);
      var d2 = new Date(2000,1,1,10,30,29);
      it('should compute units', function() {
        assert.equal(28, locale[name].unit(d1));
        assert.equal(29, locale[name].unit(d2));
      });
      it('should compute dates', function() {
        distMatch(locale, name, d1, d2);
      });
    });

    describe('minutes', function() {
      var name = 'minutes';
      var d1 = new Date(2000,1,1,10,30,1);
      var d2 = new Date(2000,1,1,10,31,1);
      it('should compute units', function() {
        assert.equal(30, locale[name].unit(d1));
        assert.equal(31, locale[name].unit(d2));
      });
      it('should compute dates', function() {
        distMatch(locale, name, d1, d2);
      });
    });

    describe('hours', function() {
      var name = 'hours';
      var d1 = new Date(2000,1,1,10,30,1);
      var d2 = new Date(2000,1,1,11,30,1);
      it('should compute units', function() {
        assert.equal(10, locale[name].unit(d1));
        assert.equal(11, locale[name].unit(d2));
      });
      it('should compute dates', function() {
        distMatch(locale, name, d1, d2);
      });
    });

    describe('weekdays', function() {
      var name = 'weekdays';
      var d1 = new Date(2000,1,1,10,30,1);
      var d2 = new Date(2000,1,2,10,30,1);
      it('should compute units', function() {
        assert.equal(2, locale[name].unit(d1));
        assert.equal(3, locale[name].unit(d2));
      });
      it('should compute dates', function() {
        distMatch(locale, name, d1, d2);
      });
    });

    describe('dates', function() {
      var name = 'dates';
      var d1 = new Date(2000,1,1,10,30,1);
      var d2 = new Date(2000,1,2,10,30,1);
      it('should compute units', function() {
        assert.equal(1, locale[name].unit(d1));
        assert.equal(2, locale[name].unit(d2));
      });
      it('should compute dates', function() {
        distMatch(locale, name, d1, d2);
      });
    });

    describe('months', function() {
      var name = 'months';
      var d1 = new Date(2000,1,1,10,30,1);
      var d2 = new Date(2000,2,1,10,30,1);
      it('should compute units', function() {
        assert.equal(1, locale[name].unit(d1));
        assert.equal(2, locale[name].unit(d2));
      });
      it('should compute dates', function() {
        distMatch(locale, name, d1, d2);
      });
    });

    describe('find', function() {
      it('should find appropriate span', function() {
        var min, max, span, unit;

        min = new Date(2000,1,1,10,30,1,1);
        max = new Date(2000,1,1,10,30,1,5);
        span = +max - +min;
        unit = locale.find(span, 1, 10);
        assert.equal('second', unit.type);

        min = new Date(2000,1,1);
        max = new Date(2000,1,3);
        span = +max - +min;
        unit = locale.find(span, 1, 10);
        assert.equal('day', unit.type);

        min = new Date(2000,1,1);
        max = new Date(2010,1,3);
        span = +max - +min;
        unit = locale.find(span, 1, 20);
        assert.equal('year', unit.type);

        min = new Date(2000,1,1);
        max = new Date(2005,1,1);
        span = +max - +min;
        unit = locale.find(span, 50, 200);
        assert.equal('month', unit.type);
      });
    });

  });
});