var util = require('../../util');
var json = require('./json');
var d3 = require('d3');
var topojson = require('topojson');

module.exports = function(data, format) {
  if (topojson == null) {
    util.error("TopoJSON library not loaded.");
    return [];
  }    
  var t = json(data, format),
      obj = [];

  if (format && format.feature) {
    obj = (obj = t.objects[format.feature])
      ? topojson.feature(t, obj).features
      : (util.error("Invalid TopoJSON object: "+format.feature), []);
  } else if (format && format.mesh) {
    obj = (obj = t.objects[format.mesh])
      ? [topojson.mesh(t, t.objects[format.mesh])]
      : (util.error("Invalid TopoJSON object: " + format.mesh), []);
  }
  else { util.error("Missing TopoJSON feature or mesh parameter."); }

  return obj;
};
