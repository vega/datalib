'use strict';

var assert = require('chai').assert;
var util = require('../src/util');
var format = require('../src/format');
var template = require('../src/template');

describe('template', function() {

  it('should handle zero interpolants', function() {
    var f = template('hello');
    assert.equal('hello', f({}));
  });

  it('should handle a single interpolant', function() {
    var f = template('{{a}}');
    assert.equal('hello', f({a: 'hello'}));

    f = template('hello {{a}}');
    assert.equal('hello there', f({a: 'there'}));

    f = template('{{a}} there');
    assert.equal('hello there', f({a: 'hello'}));
  });

  it('should handle nested property interpolants', function() {
    var f = template('hello {{a.b}}');
    assert.equal('hello there', f({a: {b:'there'}}));
  });

  it('should handle multiple interpolants', function() {
    var f = template('hello {{a}} {{b}}');
    assert.equal('hello there friend', f({a: 'there', b: 'friend'}));
  });

  it('should handle escape characters', function() {
    var f = template('\"{{a}}\"');
    assert.equal('\"hello\"', f({a: 'hello'}));

    f = template('\'{{a}}\'');
    assert.equal('\'hello\'', f({a: 'hello'}));
  });

  it('should handle lower filter', function() {
    var f = template('hello {{a|lower}}');
    assert.equal('hello there', f({a: 'THERE'}));
  });

  it('should handle upper filter', function() {
    var f = template('hello {{a|upper}}');
    assert.equal('hello THERE', f({a: 'there'}));
  });

  it('should handle lower-locale filter', function() {
    var f = template('hello {{a|lower-locale}}');
    assert.equal('hello there', f({a: 'THERE'}));
  });

  it('should handle upper-locale filter', function() {
    var f = template('hello {{a|upper-locale}}');
    assert.equal('hello THERE', f({a: 'there'}));
  });

  it('should handle trim filter', function() {
    var f = template('hello {{a|trim}}');
    assert.equal('hello there', f({a: ' there '}));
  });

  it('should handle left filter', function() {
    var f = template('hello {{a|left:5}}');
    assert.equal('hello there', f({a: 'there---'}));
  });

  it('should handle right filter', function() {
    var f = template('hello {{a|right:5}}');
    assert.equal('hello there', f({a: '---there'}));
  });

  it('should handle mid filter', function() {
    var f = template('hello {{a|mid:3,5}}');
    assert.equal('hello there', f({a: '---there---'}));
  });

  it('should handle slice filter', function() {
    var f = template('hello {{a|slice:3}}');
    assert.equal('hello there', f({a: '---there'}));

    f = template('hello {{a|slice:-5}}');
    assert.equal('hello there', f({a: '---there'}));

    f = template('hello {{a|slice:3,8}}');
    assert.equal('hello there', f({a: '---there---'}));

    f = template('hello {{a|slice:3,-3}}');
    assert.equal('hello there', f({a: '---there---'}));
  });

  it('should handle truncate filter', function() {
    var f = template('{{a|truncate:5}}');
    assert.equal('hello', f({a: 'hello'}));

    f = template('{{a|truncate:6}}');
    assert.equal('hello…', f({a: 'hello there'}));

    f = template('{{a|truncate:6,left}}');
    assert.equal('…there', f({a: 'hello there'}));

    f = template('hello {{a|truncate:5}}');
    assert.equal('hello 1234…', f({a: 123456}));
  });

  it('should handle pad filter', function() {
    var f = template('{{a|pad:8}}');
    assert.equal('hello   ', f({a: 'hello'}));

    f = template('{{a|pad:3}}');
    assert.equal('hello', f({a: 'hello'}));

    f = template('{{a|pad:8,left}}');
    assert.equal('   hello', f({a: 'hello'}));

    f = template('{{a|pad:8,middle}}');
    assert.equal(' hello  ', f({a: 'hello'}));

    f = template('hello {{a|pad:8}}');
    assert.equal('hello 12345   ', f({a: 12345}));
  });

  it('should parse arguments correctly', function() {
    var f = template('hello {{a|number:",.2f"}}');
    assert.equal('hello 1,000.00', f({a: 1000}));
    f = template("hello {{a|number:',.2f'}}");
    assert.equal('hello 1,000.00', f({a: 1000}));
  });

  it('should handle number filter', function() {
    var f = template('hello {{a|number:".3f"}}');
    assert.equal('hello 1.000', f({a: 1}));
    f = template("hello {{a|number:'.3f'}}");
    assert.equal('hello 1.000', f({a: 1}));
    assert.ok(template.format('.3f', 'number'));
  });

  it('should handle time filter', function() {
    var f = template('the date: {{a|time:"%Y-%m-%d"}}');
    assert.equal('the date: 2011-01-01', f({a: new Date(2011, 0, 1)}));
    f = template("the date: {{a|time:'%Y-%m-%d'}}");
    assert.equal('the date: 2011-01-01', f({a: new Date(2011, 0, 1)}));
  });

  it('should handle time-utc filter', function() {
    var f = template('the date: {{a|time-utc:"%Y-%m-%d"}}');
    assert.equal('the date: 2011-01-01',
      f({a: new Date(Date.UTC(2011, 0, 1))}));
    f = template("the date: {{a|time-utc:'%Y-%m-%d'}}");
    assert.equal('the date: 2011-01-01',
      f({a: new Date(Date.UTC(2011, 0, 1))}));
  });

  it('should handle month format filter', function() {
    var f = template('month: {{a|month}}');
    assert.equal('month: March', f({a: 2}));

    f = template('month: {{a|month-abbrev}}');
    assert.equal('month: Mar', f({a: 2}));
  });

  it('should handle day format filter', function() {
    var f = template('day: {{a|day}}');
    assert.equal('day: Tuesday', f({a: 2}));

    f = template('day: {{a|day-abbrev}}');
    assert.equal('day: Tue', f({a: 2}));
  });

  it('should handle quarter format filter', function() {
    var f = template('Quarter: Q{{a|quarter}}');
    // June
    assert.equal('Quarter: Q2',
      f({a: new Date(2011, 5, 1)}));
    // July
    assert.equal('Quarter: Q3',
      f({a: new Date(2011, 6, 1)}));
    // January
    assert.equal('Quarter: Q1',
      f({a: new Date(2011, 0, 1)}));
    // December
    assert.equal('Quarter: Q4',
      f({a: new Date(2011, 11, 1)}));
  });
  
  it('should handle utc quarter format filter', function() {
    var f = template('Quarter: Q{{a|quarter-utc}}');
    // June
    assert.equal('Quarter: Q2',
      f({a: new Date(Date.UTC(2011, 5, 1))}));
    // July
    assert.equal('Quarter: Q3',
      f({a: new Date(Date.UTC(2011, 6, 1))}));
    // January
    assert.equal('Quarter: Q1',
      f({a: new Date(Date.UTC(2011, 0, 1))}));
    // December
    assert.equal('Quarter: Q4',
      f({a: new Date(Date.UTC(2011, 11, 1))}));
  });

  it('should throw error if format pattern is unquoted', function() {
    assert.throws(function() { template('hello {{a|number:.3f}}'); });
  });

  it('should handle changing locale', function() {
    var enUS = {
      num: {
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
      num: {
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

    format.numberLocale(deDE.num);
    assert.equal('die Nummer: 1.000,00 €',
      template('die Nummer: {{a|number:"$,.2f"}}')({a: 1000}));

    format.timeLocale(deDE.time);
    assert.equal('das Datum: Samstag Januar 01',
      template('das Datum: {{a|time-utc:"%A %B %d"}}')
      ({a: new Date(Date.UTC(2011, 0, 1))}));

    format.numberLocale(enUS.num);
    format.timeLocale(enUS.time);
  });

  it('should handle multiple filters', function() {
    var f = template('{{a|lower|slice:3,-3}}');
    assert.equal('hello', f({a:'---HeLlO---'}));
    f = template('{{a|lower|slice:3,-3|length|number:".1f"}}');
    assert.equal('5.0', f({a:'---HeLlO---'}));
    f = template("{{a|lower|slice:3,-3|length|number:'.1f'}}");
    assert.equal('5.0', f({a:'---HeLlO---'}));
  });

  it('should throw error with unrecognized filter', function() {
    assert.throws(function() { template('{{a|fake}}'); });
  });

  it('should handle extraneous spaces', function() {
    var f = template('{{ a }}');
    assert.equal('hello', f({a: 'hello'}));

    f = template('{{a | lower }}');
    assert.equal('hello', f({a: 'HELLO'}));

    f = template('{{a | lower | mid : 3, 5 }}');
    assert.equal('hello', f({a: '---HELLO---'}));
  });

  it('should support clearing format cache', function() {
    var key = 'number:.3f';
    template.clearFormatCache();
    assert.equal(0, template.context.formats.length);
    assert.isUndefined(template.context.format_map[key]);
    var f = template('hello {{a|number:".3f"}}');
    assert.isDefined(template.context.format_map[key]);
    assert.equal(1, template.context.formats.length);
    template.clearFormatCache();
    assert.equal(0, template.context.formats.length);
    assert.isUndefined(template.context.format_map[key]);
  });

  function source(str, obj, p) {
    return 'var __t; return ' + template.source(str, obj, p) + ';';
  }

  it('should expose source code generator', function() {
    var f = new Function(source('hello'));
    assert.equal('hello', f({}));

    f = new Function('myvar', source('{{a}}', 'myvar'));
    assert.equal('hello', f({a: 'hello'}));
  });

  it('should collected referenced variables', function() {
    var props = {};
    var f = new Function('d', source('{{a}} {{b}}', 'd', props));
    assert.equal('1 2', f({a:1, b:2, c:3, d:4}));
    assert.isDefined(props['a']);
    assert.isDefined(props['b']);
    assert.isUndefined(props['c']);
    assert.isUndefined(props['d']);
  });
});
