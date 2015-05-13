var d3 = require('d3');

module.exports = function(data) {
  var d = d3.tsv.parse(data ? data.toString() : data);
  return d;
};
