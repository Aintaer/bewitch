module.exports = (function() {
  'use strict';

  var fs = require('fs'),
      chokidar = require('chokidar'),
      debounce = require('./debounce'),
      rsync = require('./rsync');

  function Route(input, output, options) {
    if (!(input && output)) {
      throw new TypeError('Route requires input and output');
    }

    var src = input.path,
        dest = output.path;

    options = options || {};
    options.persistent = true;
    options.ignoreInitial = true;

    if (input instanceof chokidar.FSWatcher) {
      this.src = input.path;
      this.watcher = input;
    }
    else {
      src += fs.statSync(src).isDirectory() ? '/' : '';

      this.src = src;
      this.watcher = chokidar.watch(src, options);

      fs.exists(src+'.git', this._isCode.bind(this));
    }

    this.dest = dest;
    this.options = options;
    this.socket = output.socket;
    this.sync = debounce(this.sync, 150);

    this.watcher.on('all', this.change.bind(this));
  }

  (function(proto, ext) {
    var k;
    for (k in ext) { proto[k] = ext[k]; }
  }(Route.prototype, {
    change: function(event, path) {
      this.sync();
    },

    sync: function() {
      console.log('Syncing', this.src, '->', this.dest);
      rsync.copy(this.src, this.dest, this.options, function(err, stdout, stderr) {
        console.log('Synced ', this.src, '->', this.dest);

        if (stderr || err) {
          console.error(stderr);
          console.error(err);
        }

        console.log('');
      }.bind(this), this.socket);
    },

    _isCode : function(is) {
      if ( this.options.isCode === undefined ) {
        this.options.isCode = is;
      }
    },

    destroy : function() {
      if (this.watcher) {
        this.watcher.close();
      }
    }
  }));

  return Route;
}());
