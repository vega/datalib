var d3 = require('d3');

module.exports = function(data, format) {
  var d = d3.csv.parse(data);
  return d;
};
