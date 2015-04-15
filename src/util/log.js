var LOG = "LOG";
var ERR = "ERR";
var silent = false;

function prepare(msg, type) {
  return '[' + [
    '"'+(type || LOG)+'"',
    Date.now(),
    '"'+msg+'"'
  ].join(", ") + ']';
}

function log(msg, type) {
  if (!silent) {
    msg = prepare(msg, type);
    console.error(msg);
  }
}

log.silent = function(val) { silent = !!val; };

log.LOG = LOG;
log.ERR = ERR;
module.exports = log;