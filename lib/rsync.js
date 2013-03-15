module.exports = (function() {
  'use strict';

  var exec = require('child_process').exec,
  cmd = 'rsync',
  opts = '-rltz --executability -e',
  rsh = 'ssh',
  src = '.';

  function copy(source, destination, cb, socket) {
    var transport = socket ? '"ssh -S '+socket+'"' : rsh;
    return exec(
      [cmd, opts, transport, src, destination].join(' '),
      {cwd:source},
      cb
    );
  }

  return {
    copy: copy
  };
}());
