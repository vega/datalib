'use strict';

var assert = require('chai').assert;
var format = require('../src/format');

describe('format', function() {

  var enUS = {
    number: {
      decimal: ".",
      thousands: ",",
      grouping: [3],
      currency: ["$", ""]
    },
    time: {
      dateTime: "%a %b %e %X %Y",
      date: "%m/%d/%Y",
      time: "%H:%M:%S",
      periods: ["AM", "PM"],
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
      shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    }
  };

  var deDE = {
    number: {
      decimal: ",",
      thousands: ".",
      grouping: [3],
      currency: ["", "\xa0€"]
    },
    time: {
      dateTime: "%A, der %e. %B %Y, %X",
      date: "%d.%m.%Y",
      time: "%H:%M:%S",
      periods: ["AM", "PM"], // unused
      days: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"],
      shortDays: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
      months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
      shortMonths: ["Jan", "Feb", "Mrz", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"]
    }
  };

  it('should set number locale', function() {
    format.numberLocale(deDE.number);
    var f = format.number(',.1f');
    assert.equal(f(1000), '1.000,0');
    format.numberLocale(enUS.number);

    format.numberLocale('de-DE');
    var f = format.number(',.1f');
    assert.equal(f(1000), '1.000,0');
    format.locale('en-US');

    assert.throws(function() { format.numberLocale('foo-bar'); });
  });

  it('should set time locale', function() {
    format.timeLocale(deDE.time);
    var f = format.time('%b %Y');
    assert.equal(f(new Date(2000, 9)), 'Okt 2000');
    format.timeLocale(enUS.time);

    format.timeLocale('de-DE');
    var f = format.time('%b %Y');
    assert.equal(f(new Date(2000, 9)), 'Okt 2000');
    format.locale('en-US');

    assert.throws(function() { format.timeLocale('foo-bar'); });
  });

  it('should format numbers', function() {
    var f = format.number(',.1f');
    assert.equal(f(1000), '1,000.0');
  });

  it('should format number prefix', function() {
    var f = format.numberPrefix(',.0', 1e-6);
    assert.equal(f(.00042), '420µ');
    assert.equal(f(.0042), '4,200µ');
  });

  it('should format times', function() {
    var f = format.time('%b %Y');
    assert.equal(f(new Date(2000, 9)), 'Oct 2000');
  });

  it('should format UTC times', function() {
    var f = format.utc('%b %Y %H:%M');
    assert.equal(f(new Date(Date.UTC(2000, 9, 1, 10))), 'Oct 2000 10:00');
  });

  it('should auto-format numbers', function() {
    var a = [0, 1, 10, 100, 1000, 10000, 100000, 1000000];
    var b = [0, 1, 15, 150, 1500, 15000, 150000, 1500000];

    var f = format.auto.number([0.0, 0.1]);
    assert.equal(f(0.01), '0.01');
    assert.equal(f(0.05), '0.05');

    f = format.auto.number([1000, 0], 10000, ',f');
    assert.equal(f(1000), '1,000.0');

    f = format.auto.number([0, 20], 10, '.1f');
    assert.equal(f(10), '10.0');
    f = format.auto.number([0, 50], 10, '.1f');
    assert.equal(f(10), '10.0');
    f = format.auto.number([0, 99], 10, '.1f');
    assert.equal(f(10), '10.0');

    f = format.auto.number([0, 20], 10, 's');
    assert.equal(f(10), '10');
    f = format.auto.number([0, 20], 10, '.3s');
    assert.equal(f(10), '10.0');

    f = format.auto.number(a, 10, 's');
    assert.deepEqual(a.map(f), ['0', '1', '10', '100', '1k', '10k', '100k', '1M']);
    f = format.auto.number(b, 10, 's');
    assert.deepEqual(b.map(f), ['0.0', '1.0', '15', '150', '1.5k', '15k', '150k', '1.5M']);

    f = format.auto.number([0, 20], 10, '');
    assert.equal(f(10), '10');
    f = format.auto.number([0, 20], 10, 'e');
    assert.equal(f(10), '1.0e+1');
    f = format.auto.number([0, 20], 10, '.1e');
    assert.equal(f(10), '1.0e+1');
    f = format.auto.number([0, 20], 10, 'p');
    assert.equal(f(10), '1000%');
    f = format.auto.number([0, 20], 10, '%');
    assert.equal(f(10), '1000%');

    f = format.auto.number([]);
    assert.equal(f(10), '10');
    assert.equal(f(0.01), '0');

    f = format.auto.number([0.01, NaN]);
    assert.equal(f(10), '10.00');
    assert.equal(f(0.01), '0.01');

    f = format.auto.number([NaN, 0.01]);
    assert.equal(f(10), '10.00');
    assert.equal(f(0.01), '0.01');

    f = format.auto.number([0.01, 0.01]);
    assert.equal(f(10), '10.00');
    assert.equal(f(0.01), '0.01');
  });

  it('should auto-format times', function() {
    var f = format.auto.time();
    assert.equal(f(new Date(2000, 0, 1, 7, 30, 12, 123)), '.123');
    assert.equal(f(new Date(2000, 0, 1, 7, 30, 12)), ':12');
    assert.equal(f(new Date(2000, 0, 1, 7, 30)), '07:30');
    assert.equal(f(new Date(2000, 0, 1, 7)), '07 AM');
    assert.equal(f(new Date(2000, 0, 0)), 'Fri 31');
    assert.equal(f(new Date(2000, 0, 2)), 'Jan 02');
    assert.equal(f(new Date(2000, 1, 1)), 'February');
    assert.equal(f(new Date(2000, 0, 1)), '2000');
  });

  it('should auto-format UTC times', function() {
    var f = format.auto.utc();
    assert.equal(f(new Date(Date.UTC(2000, 0, 1, 7, 30, 12, 123))), '.123');
    assert.equal(f(new Date(Date.UTC(2000, 0, 1, 7, 30, 12))), ':12');
    assert.equal(f(new Date(Date.UTC(2000, 0, 1, 7, 30))), '07:30');
    assert.equal(f(new Date(Date.UTC(2000, 0, 1, 7))), '07 AM');
    assert.equal(f(new Date(Date.UTC(2000, 0, 0))), 'Fri 31');
    assert.equal(f(new Date(Date.UTC(2000, 0, 2))), 'Jan 02');
    assert.equal(f(new Date(Date.UTC(2000, 1, 1))), 'February');
    assert.equal(f(new Date(Date.UTC(2000, 0, 1))), '2000');
  });

});