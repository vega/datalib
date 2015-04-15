var LOG = "LOG";
var ERR = "ERR";

var log;
var has_stderr = typeof process !== 'undefined'
              && typeof process.stderr !== 'undefined';

function prepare(msg, type) {
  return "[" + Date.now() + "] " + (type || LOG) + " " + msg;
}

if (has_stderr) {
  log = function(msg, type) {
    msg = prepare(msg, type);
    process.stderr.write(msg);
  };
} else {
  log = function(msg, type) {
    msg = prepare(msg, type);
    if (type === ERR) {
      console.error(msg)
    } else {
      console.log(msg);
    }
  }
}

log.LOG = LOG;
log.ERR = ERR;
module.exports = log;