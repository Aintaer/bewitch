module.exports = (function() {
  'use strict';

  var exec = require('child_process').exec,
  cmd = 'rsync',
  opts = '-rltz --executability',
  rsh = '-e ssh';

  function copy(source, destination, cb, socket) {
    var transport = socket ? '-e "ssh -S '+socket+'"' : rsh;
    return exec(
      [cmd, opts, transport, source, destination].join(' '),
      {cwd:process.cwd()},
      cb
    );
  }

  return {
    copy: copy
  };
}());
