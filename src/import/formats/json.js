var util = require('../../util');

module.exports = function(data, format) {
  var d = util.isObject(data) 
    && !(data.constructor
        && data.constructor.isBuffer 
        && data.constructor.isBuffer(data))
    ? data : JSON.parse(data);
  if (format && format.property) {
    d = util.accessor(format.property)(d);
  }
  return d;
};
