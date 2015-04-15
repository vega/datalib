var util = require('./util');

var log = require('./log');
util.log = function(msg) { log(msg, log.LOG); };
util.log.silent = log.silent;
util.error = function(msg) { log(msg, log.ERR); };

module.exports = util;


