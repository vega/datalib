var ONE_SECOND = 1e3,
    ONE_MINUTE = 6e4,
    ONE_HOUR = 36e5,
    ONE_DAY = 864e5,
    tempDate = new Date();

// coerce a date or timestamp to date to use for date-based calcs
// use a temp object to avoid allocation overhead
function date(d) {
  return (tempDate.setTime(+d), tempDate);
}

// get timezone offset for a date, in milliseconds
function tzo(d) {
  return date(d).getTimezoneOffset() * ONE_MINUTE;
}

// given a UTC-mapped timestamp, recover the original date
function offsetDate(t) {
  return new Date(t + tzo(t + tzo(t) + ONE_HOUR));
}

// create a time unit entry
function entry(type, date, unit, step, min, max) {
  var e = {
    type: type,
    date: date,
    unit: unit
  };
  if (step) {
    e.step = step;
  } else {
    e.minstep = 1;
  }
  if (min != null) e.min = min;
  if (max != null) e.max = max;
  return e;
}

var locale = [
  entry('second',
    function(d) { return new Date(d * ONE_SECOND); },
    function(d) { return (+d / ONE_SECOND); }
  ),
  entry('minute',
    function(d) { return new Date(d * ONE_MINUTE); },
    function(d) { return Math.floor(+d / ONE_MINUTE); }
  ),
  entry('hour',
    function(d) { return offsetDate(d * ONE_HOUR); },
    function(d) { return Math.floor((+d - tzo(d)) / ONE_HOUR); }
  ),
  entry('day',
    function(d) { return offsetDate(d * ONE_DAY); },
    function(d) { return Math.floor((+d - tzo(d)) / ONE_DAY); },
    [1, 7]
  ),
  entry('month',
    function(d) { return new Date(Math.floor(d / 12), d % 12, 1); },
    function(d) { return (d=date(d)).getMonth() + 12*d.getFullYear(); },
    [1, 3, 6]
  ),
  entry('year',
    function(d) { return new Date(d, 0, 1); },
    function(d) { return date(d).getFullYear(); }
  ),
  // periodic units
  entry('seconds',
    function(d) { return new Date(1970, 0, 1, 0, 0, d); },
    function(d) { return date(d).getSeconds(); },
    null, 0, 59
  ),
  entry('minutes',
    function(d) { return new Date(1970, 0, 1, 0, d); },
    function(d) { return date(d).getMinutes(); },
    null, 0, 59
  ),
  entry('hours',
    function(d) { return new Date(1970, 0, 1, d); },
    function(d) { return date(d).getHours(); },
    null, 0, 23
  ),
  entry('weekdays',
    function(d) { return new Date(1970, 0, 4+d); },
    function(d) { return date(d).getDay(); },
    [1], 0, 6
  ),
  entry('dates',
    function(d) { return new Date(1970, 0, d); },
    function(d) { return date(d).getDate(); },
    [1], 1, 31
  ),
  entry('months',
    function(d) { return new Date(1970, d % 12, 1); },
    function(d) { return date(d).getMonth(); },
    [1], 0, 11
  )
];

var utc = [
  entry('second', locale[0].date, locale[0].unit),
  entry('minute', locale[1].date, locale[1].unit),
  entry('hour',
    function(d) { return new Date(d * ONE_HOUR); },
    function(d) { return Math.floor(+d / ONE_HOUR); }
  ),
  entry('day',
    function(d) { return new Date(d * ONE_DAY); },
    function(d) { return Math.floor(+d / ONE_DAY); },
    [1, 7]
  ),
  entry('month',
    function(d) { return new Date(Date.UTC(Math.floor(d / 12), d % 12, 1)); },
    function(d) { return (d=date(d)).getUTCMonth() + 12*d.getUTCFullYear(); },
    [1, 3, 6]
  ),
  entry('year',
    function(d) { return new Date(Date.UTC(d, 0, 1)); },
    function(d) { return date(d).getUTCFullYear(); }
  ),
  // periodic units
  entry('seconds',
    function(d) { return new Date(Date.UTC(1970, 0, 1, 0, 0, d)); },
    function(d) { return date(d).getUTCSeconds(); },
    null, 0, 59
  ),
  entry('minutes',
    function(d) { return new Date(Date.UTC(1970, 0, 1, 0, d)); },
    function(d) { return date(d).getUTCMinutes(); },
    null, 0, 59
  ),
  entry('hours',
    function(d) { return new Date(Date.UTC(1970, 0, 1, d)); },
    function(d) { return date(d).getUTCHours(); },
    null, 0, 23
  ),
  entry('weekdays',
    function(d) { return new Date(Date.UTC(1970, 0, 4+d)); },
    function(d) { return date(d).getUTCDay(); },
    [1], 0, 6
  ),
  entry('dates',
    function(d) { return new Date(Date.UTC(1970, 0, d)); },
    function(d) { return date(d).getUTCDate(); },
    [1], 1, 31
  ),
  entry('months',
    function(d) { return new Date(Date.UTC(1970, d % 12, 1)); },
    function(d) { return date(d).getUTCMonth(); },
    [1], 0, 11
  )
];

var STEPS = [
  [31536e6, 5],  // 1-year
  [7776e6, 4],   // 3-month
  [2592e6, 4],   // 1-month
  [12096e5, 3],  // 2-week
  [6048e5, 3],   // 1-week
  [1728e5, 3],   // 2-day
  [864e5, 3],    // 1-day
  [432e5, 2],    // 12-hour
  [216e5, 2],    // 6-hour
  [108e5, 2],    // 3-hour
  [36e5, 2],     // 1-hour
  [18e5, 1],     // 30-minute
  [9e5, 1],      // 15-minute
  [3e5, 1],      // 5-minute
  [6e4, 1],      // 1-minute
  [3e4, 0],      // 30-second
  [15e3, 0],     // 15-second
  [5e3, 0],      // 5-second
  [1e3, 0]       // 1-second
];

function find(units, span, minb, maxb) {
  var step = STEPS[0], i, n, bins;

  for (i=1, n=STEPS.length; i<n; ++i) {
    step = STEPS[i];
    if (span > step[0]) {
      bins = span / step[0];
      if (bins > maxb) {
        return units[STEPS[i-1][1]];
      }
      if (bins >= minb) {
        return units[step[1]];
      }
    }
  }
  return units[STEPS[n-1][1]];
}

function toUnitMap(units) {
  var map = {}, i, n;
  for (i=0, n=units.length; i<n; ++i) {
    map[units[i].type] = units[i];
  }
  map.find = function(span, minb, maxb) {
    return find(units, span, minb, maxb);
  };
  return map;
}

module.exports = toUnitMap(locale);
module.exports.utc = toUnitMap(utc);
