var d3_numbers = require('d3-format'),
    d3_times = require('d3-time-format'),
    numbers = d3_numbers, // inits to EN-US
    times = d3_times;

module.exports = {
  // Update number formatter to use provided locale configuration.
  // For more see https://github.com/d3/d3-format
  numberLocale: function(l) { numbers = d3_numbers.localeFormat(l); },
  number:       function(f) { return numbers.format(f); },

  // Update time formatter to use provided locale configuration.
  // For more see https://github.com/d3/d3-time-format
  timeLocale:   function(l) { times = d3_times.localeFormat(l); },
  time:         function(f) { return times.format(f); },  
  utc:          function(f) { return times.utcFormat(f); }
};
