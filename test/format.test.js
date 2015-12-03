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

  it('should auto-format linear ranges', function() {
    var f = format.auto.linear([0.0, 0.1]);
    assert.equal(f(0.01), '0.01');
    assert.equal(f(0.05), '0.05');

    f = format.auto.linear([1000, 0], 10000, ',f');
    assert.equal(f(1000), '1,000.0');

    f = format.auto.linear([0, 20], 10, '.1f');
    assert.equal(f(10), '10.0');
    f = format.auto.linear([0, 50], 10, '.1f');
    assert.equal(f(10), '10.0');
    f = format.auto.linear([0, 99], 10, '.1f');
    assert.equal(f(10), '10.0');

    f = format.auto.linear([0, 1000], 10, '.1r');
    assert.equal(f(100), '100');
    assert.equal(f(150), '200');

    f = format.auto.linear([0, 20], 10, 's');
    assert.equal(f(5),   '5');
    assert.equal(f(10), '10');
    assert.equal(f(15), '15');
    f = format.auto.linear([0, 1000], null, '.3s');
    assert.equal(f(5),    '0.005k');
    assert.equal(f(10),   '0.010k');
    assert.equal(f(15),   '0.015k');
    assert.equal(f(1000), '1.000k');
    f = format.auto.linear([0, 1000], 200, 's');
    assert.equal(f(5),    '0.005k');
    assert.equal(f(10),   '0.010k');
    assert.equal(f(15),   '0.015k');
    assert.equal(f(1000), '1.000k');

    f = format.auto.linear([0, 20], 10);
    assert.equal(f(0.1), '0');
    assert.equal(f(1),   '1');
    assert.equal(f(10), '10');
    assert.equal(f(1000), '1,000');

    f = format.auto.linear([0, 20], 10, '');
    assert.equal(f(10), '10');
    assert.equal(f(1e12), '1e+12');
    f = format.auto.linear([0, 20], 10, 'e');
    assert.equal(f(10), '1.0e+1');
    f = format.auto.linear([0, 20], 10, '.1e');
    assert.equal(f(10), '1.0e+1');
    f = format.auto.linear([0, 20], 10, 'p');
    assert.equal(f(10), '1000%');
    f = format.auto.linear([0, 20], 10, '%');
    assert.equal(f(10), '1000%');

    f = format.auto.linear([]);
    assert.equal(f(10), '10');
    assert.equal(f(0.01), '0');

    f = format.auto.linear([0.01, NaN]);
    assert.equal(f(10), '10.00');
    assert.equal(f(0.01), '0.01');

    f = format.auto.linear([NaN, 0.01]);
    assert.equal(f(10), '10.00');
    assert.equal(f(0.01), '0.01');

    f = format.auto.linear([0.01, 0.01]);
    assert.equal(f(10), '10.00');
    assert.equal(f(0.01), '0.01');
  });

  it('should auto-format numbers', function() {
    var a = [0.1, 1, 10, 100, 1000, 10000, 100000, 1000000];
    var b = [0.1, 1, 15, 150, 1500, 15000, 150000, 1500000];
    var c = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20];

    // no format type
    var f = format.auto.number();
    assert.deepEqual(a.map(f),
      ['0.1', '1', '10', '100', '1,000', '10,000', '100,000', '1,000,000']);
    assert.deepEqual(b.map(f),
      ['0.1', '1', '15', '150', '1,500', '15,000', '150,000', '1,500,000']);
    assert.deepEqual([0, 1, 15, 132].map(f),
      ['0', '1', '15', '132']);
    assert.deepEqual(
      [1e-2, 1.2e-1, 1.234e-1, 1.236e-1, 1e3, 1.2e3, 1.234e3, 1.236e3, 0.236e3].map(f),
      ['0.01', '0.12', '0.1234', '0.1236', '1,000', '1,200', '1,234', '1,236', '236']
    );

    // with suffixes
    f = format.auto.number('($f');
    assert.equal(f(-1.23), '($1.23)');

    format.numberLocale(deDE.number);
    f = format.auto.number('($f');
    assert.equal(f(-1.23), '(1,23 €)');
    format.numberLocale(enUS.number);

    // 'r'
    f = format.auto.number('r');
    assert.deepEqual(c.map(f),
      ['0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20']);

    f = format.auto.number('.3r');
    assert.equal(f(1e3), '1000');
    assert.equal(f(1e13), '10000000000000');

    // 's'
    f = format.auto.number('s');
    assert.deepEqual(
      [1e-4, 1.2e-4, 1.234e-4, 1.236e-4, 1e5, 1.2e5, 1.234e5, 1.236e5, 0.2346e5].map(f),
      ['100µ', '120µ', '123.4µ', '123.6µ', '100k', '120k', '123.4k', '123.6k', '23.46k']
    );
    assert.deepEqual(b.map(f),
      ['100m', '1', '15', '150', '1.5k', '15k', '150k', '1.5M']);
    assert.deepEqual(c.map(f),
      ['0', '2', '4', '6', '8', '10', '12', '14', '16', '18', '20']);

    f = format.auto.number('.1s');
    assert.deepEqual(a.map(f),
      ['100m', '1', '10', '100', '1k', '10k', '100k', '1M']);

    // 'e'
    f = format.auto.number('e');
    assert.deepEqual(a.map(f),
      ['1e-1', '1e+0', '1e+1', '1e+2', '1e+3', '1e+4', '1e+5', '1e+6']);
    assert.deepEqual(b.map(f),
      ['1e-1', '1e+0', '1.5e+1', '1.5e+2', '1.5e+3', '1.5e+4', '1.5e+5', '1.5e+6']);

    // '%'
    f = format.auto.number('%');
    assert.deepEqual([1e-4, 1e-3, 1.5e-2, 1.23e-1, 1e0, 1.23e1].map(f),
      ['0.01%', '0.1%', '1.5%', '12.3%', '100%', '1230%']);
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

  it('should format full month names', function() {
    for (var i = 0; i < 12; i++) {
      var expected = enUS.time.months[i];
      assert.equal(format.month(i), expected);
    }
  });

  it('should format abbreviated month names', function() {
    for (var i = 0; i < 12; i++) {
      var expected = enUS.time.shortMonths[i];
      assert.equal(format.month(i, true), expected);
    }
  });

  it('should format full day names', function() {
    for (var i = 0; i < 7; i++) {
      var expected = enUS.time.days[i];
      assert.equal(format.day(i), expected);
    }
  });

  it('should format abbreviated day names', function() {
    for (var i = 0; i < 7; i++) {
      var expected = enUS.time.shortDays[i];
      assert.equal(format.day(i, true), expected);
    }
  });

});
