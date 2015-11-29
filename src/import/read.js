var util = require('../util'),
  type = require('./type'),
  formats = require('./formats'),
  d3_timeF = require('d3-time-format');

function read(data, format) {
  var type = (format && format.type) || 'json';
  data = formats[type](data, format);
  if (format && format.parse) parse(data, format.parse);
  return data;
}

function parse(data, types) {
  var cols, parsers, d, i, j, clen, len = data.length;

  types = (types==='auto') ? type.inferAll(data) : util.duplicate(types);
  cols = util.keys(types);
  parsers = cols.map(function(c) {
    if (types[c]) {
      var t = types[c];
      var opt = null;  // optional format argument

      if (t.startsWith('date:')) {
        var parts = t.split(':', 2);
        var pattern = parts[1];
        if ((pattern[0] === '\'' && pattern[pattern.length-1] === '\'') ||
            (pattern[0] === '"'  && pattern[pattern.length-1] === '"')) {
          pattern = pattern.slice(1, -1);
        } else {
          throw Error('Format pattern must be quoted: ' + pattern);
        }

        t = parts[0];
        opt = d3_timeF.format(pattern);
      }

      return {
        parser: type.parsers[t],
        opt: opt
      };
    }
  });

  for (i=0, clen=cols.length; i<len; ++i) {
    d = data[i];
    for (j=0; j<clen; ++j) {
      var obj = parsers[j];
      d[cols[j]] = obj.parser(d[cols[j]], obj.opt);
    }
  }
  type.annotation(data, types);
}

read.formats = formats;
module.exports = read;
