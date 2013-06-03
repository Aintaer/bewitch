module.exports = (function() {
  'use strict';

  var exec = require('child_process').exec,
  util = require('util'),
  filter = "-C --filter=':- .gitignore'",
  rsh = '-e ssh',
  rsync;

  function execRsync(source, destination, options, callback) {
    /*global process*/
    callback = (callback === undefined && typeof options === 'function') ? options : callback;
    options = rsync.options.concat(options).join(' ');

    return exec(util.format('rsync %s %s %s', options, source, destination),
                {cwd: process.cwd()},
                callback);
  }

  function parseOptions( options ) {
    var includes = options.include &&
      (util.isArray(options.include) ? options.include.map(function(rule) {
        return util.format("--include='%s'", rule);
      }) : util.format("--include='%s'", options.include)),

    excludes = options.exclude &&
      (util.isArray(options.exclude) ? options.exclude.map(function(rule) {
        return util.format("--exclude='%s'", rule);
      }) : util.format("--exclude='%s'", options.exclude));

    return [].concat(excludes, includes).join(' ');
  }

  function copy(source, destination, options, cb, socket) {
    var transport = socket ? util.format('-e "ssh -S \'%s\'"', socket) : rsh,
    opts = [parseOptions(options)].concat(options.isCode ? [filter] : [], transport);
    return execRsync(source, destination, opts, cb);
  }
  rsync = {
    options: ['-rltz', '--executability'],
    copy: copy
  };

  return rsync;
}());
