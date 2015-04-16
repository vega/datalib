var util = require('../util');
var formats = require('./formats');

var parsers = {
  "number": util.number,
  "boolean": util.boolean,
  "date": util.date
};

function read(data, format) {
  var type = (format && format.type) || "json";
  data = formats[type](data, format);
  if (format && format.parse) parse(data, format.parse);
  return data;
}

function parse(data, types) {
  var cols = util.keys(types),
      parser = cols.map(function(col) { return parsers[types[col]]; }),
      d, i, j, len = data.length, clen = cols.length;

  for (i=0; i<len; ++i) {
    d = data[i];
    for (j=0; j<clen; ++j) {
      d[cols[j]] = parser[j](d[cols[j]]);
    }
  }
}

read.formats = formats;
read.parse = parse;
module.exports = read;