var util = require('./util');

var dl = {
  load:      require('./import/load'),
  read:      require('./import/read'),
  bin:       require('./bin'),
  histogram: require('./histogram'),
  summary:   require('./summary'),
  template:  require('./template'),
  dateunits: require('./date-units'),
  groupby:   require('./aggregate/groupby')
};

util.extend(dl, util);
util.extend(dl, require('./generate'));
util.extend(dl, require('./stats'));
util.extend(dl, require('./import/loaders'));

module.exports = dl;