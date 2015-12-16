'use strict';

var assert = require('chai').assert;
var util = require('../src/util');
var acc = require('../src/accessor');

describe('time accessors', function() {

    // utc
    var tu = {t: Date.UTC(2005, 2, 3, 13, 17, 29)};
    var du = {d: new Date(tu.t)};

    // locale
    var dl = {d: new Date(2005, 2, 3, 13, 17, 29)};
    var tl = {t: +dl.d};

    it('should support year extraction', function() {
      assert.equal(2005, acc.$year('t')(tl));
      assert.equal(2005, acc.$year('d')(dl));
      assert.equal(2005, acc.$year()(dl.d));
      assert.equal('year_t', util.name(acc.$year('t')));
      assert.equal('year', util.name(acc.$year()));
    });

    it('should support month extraction', function() {
      assert.equal(2, acc.$month('t')(tl));
      assert.equal(2, acc.$month('d')(dl));
      assert.equal(2, acc.$month()(dl.d));
      assert.equal('month_t', util.name(acc.$month('t')));
      assert.equal('month', util.name(acc.$month()));
    });

    it('should support date extraction', function() {
      assert.equal(3, acc.$date('t')(tl));
      assert.equal(3, acc.$date('d')(dl));
      assert.equal(3, acc.$date()(dl.d));
      assert.equal('date_t', util.name(acc.$date('t')));
      assert.equal('date', util.name(acc.$date()));
    });

    it('should support day extraction', function() {
      var day = dl.d.getUTCDay();
      assert.equal(day, acc.$day('t')(tl));
      assert.equal(day, acc.$day('d')(dl));
      assert.equal(day, acc.$day()(dl.d));
      assert.equal('day_t', util.name(acc.$day('t')));
      assert.equal('day', util.name(acc.$day()));
    });

    it('should support hour extraction', function() {
      assert.equal(13, acc.$hour('t')(tl));
      assert.equal(13, acc.$hour('d')(dl));
      assert.equal(13, acc.$hour()(dl.d));
      assert.equal('hour_t', util.name(acc.$hour('t')));
      assert.equal('hour', util.name(acc.$hour()));
    });

    it('should support minute extraction', function() {
      assert.equal(17, acc.$minute('t')(tl));
      assert.equal(17, acc.$minute('d')(dl));
      assert.equal(17, acc.$minute()(dl.d));
      assert.equal('minute_t', util.name(acc.$minute('t')));
      assert.equal('minute', util.name(acc.$minute()));
    });

    it('should support second extraction', function() {
      assert.equal(29, acc.$second('t')(tl));
      assert.equal(29, acc.$second('d')(dl));
      assert.equal(29, acc.$second()(dl.d));
      assert.equal('second_t', util.name(acc.$second('t')));
      assert.equal('second', util.name(acc.$second()));
    });

    it('should support utc year extraction', function() {
      assert.equal(2005, acc.$utcYear('t')(tu));
      assert.equal(2005, acc.$utcYear('d')(du));
      assert.equal(2005, acc.$utcYear()(du.d));
      assert.equal('utcYear_t', util.name(acc.$utcYear('t')));
      assert.equal('utcYear', util.name(acc.$utcYear()));
    });

    it('should support utc month extraction', function() {
      assert.equal(2, acc.$utcMonth('t')(tu));
      assert.equal(2, acc.$utcMonth('d')(du));
      assert.equal(2, acc.$utcMonth()(du.d));
      assert.equal('utcMonth_t', util.name(acc.$utcMonth('t')));
      assert.equal('utcMonth', util.name(acc.$utcMonth()));
    });

    it('should support utc date extraction', function() {
      assert.equal(3, acc.$utcDate('t')(tu));
      assert.equal(3, acc.$utcDate('d')(du));
      assert.equal(3, acc.$utcDate()(du.d));
      assert.equal('utcDate_t', util.name(acc.$utcDate('t')));
      assert.equal('utcDate', util.name(acc.$utcDate()));
    });

    it('should support utc day extraction', function() {
      var day = du.d.getUTCDay();
      assert.equal(day, acc.$utcDay('t')(tu));
      assert.equal(day, acc.$utcDay('d')(du));
      assert.equal(day, acc.$utcDay()(du.d));
      assert.equal('utcDay_t', util.name(acc.$utcDay('t')));
      assert.equal('utcDay', util.name(acc.$utcDay()));
    });

    it('should support utc hour extraction', function() {
      assert.equal(13, acc.$utcHour('t')(tu));
      assert.equal(13, acc.$utcHour('d')(du));
      assert.equal(13, acc.$utcHour()(du.d));
      assert.equal('utcHour_t', util.name(acc.$utcHour('t')));
      assert.equal('utcHour', util.name(acc.$utcHour()));
    });

    it('should support utc minute extraction', function() {
      assert.equal(17, acc.$utcMinute('t')(tu));
      assert.equal(17, acc.$utcMinute('d')(du));
      assert.equal(17, acc.$utcMinute()(du.d));
      assert.equal('utcMinute_t', util.name(acc.$utcMinute('t')));
      assert.equal('utcMinute', util.name(acc.$utcMinute()));
    });

    it('should support utc second extraction', function() {
      assert.equal(29, acc.$utcSecond('t')(tu));
      assert.equal(29, acc.$utcSecond('d')(du));
      assert.equal(29, acc.$utcSecond()(du.d));
      assert.equal('utcSecond_t', util.name(acc.$utcSecond('t')));
      assert.equal('utcSecond', util.name(acc.$utcSecond()));
    });
});