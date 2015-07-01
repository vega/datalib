var util = require('./util');

var dl = {
  load:      require('./import/load'),
  read:      require('./import/read'),
  type:      require('./import/type'),
  bins:      require('./bins/bins'),
  $bin:      require('./bins/histogram').$bin,
  groupby:   require('./aggregate/groupby'),
  histogram: require('./bins/histogram').histogram,
  print:     require('./print'),
  template:  require('./template'),
  time:      require('./time')
};

util.extend(dl, util);
util.extend(dl, require('./generate'));
util.extend(dl, require('./stats'));
util.extend(dl, require('./import/readers'));

module.exports = dl;