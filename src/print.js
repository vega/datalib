var util = require('./util');
var type = require('./import/type');
var stats = require('./stats');
var template = require('./template');

var FMT = {
  'date':    '|time:"%m/%d/%Y %H:%M:%S"',
  'number':  '|number:".4f"',
  'integer': '|number:"d"'
};

var POS = {
  'number':  'left',
  'integer': 'left'
};

module.exports.table = function(data, opt) {
  opt = util.extend({sep:' ', minwidth: 8}, opt);
  var fields = util.keys(data[0]),
      types = type.all(data);

  if (opt.limit) data = data.slice(0, opt.limit);

  // determine char width of fields
  var lens = fields.map(function(name) {
    var format = FMT[types[name]] || '';
    var t = template('{{' + name + format + '}}');
    var l = stats.max(data, function(x) { return t(x).length; });
    return Math.max(Math.min(name.length, opt.minwidth), l);
  });

  // print header row
  var head = fields.map(function(name, i) {
    return util.truncate(util.pad(name, lens[i], 'center'), lens[i]);
  }).join(opt.sep);

  // build template function for each row
  var tmpl = fields.map(function(name, i) {
    var format = FMT[types[name]] || '';
    var pad = '|pad:' + lens[i] + ',' + POS[types[name]] || 'right';
    return '{{' + name + format + pad + '}}';
  }).join(opt.sep);

  // print table
  return head + "\n" + data.map(template(tmpl)).join('\n');
};