var util = require('../../util');
var tree = require('../../util/tree');
var json = require('./json');

module.exports = function(data, format) {
  data = json(data, format);
  return tree.makeTree(data, format.children);
};