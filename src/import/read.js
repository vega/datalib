var util = require('../util');
var type = require('./type');
var formats = require('./formats');

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
      var a = types[c].split(':', 2);
      return {
        parser: type.parsers[a[0]],
        // optional arguments to be passed to the parser
        opt: a.length > 1 ? a[1] : null
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
