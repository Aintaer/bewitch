module.exports = (function() {
  'use strict';

  var fs = require('fs'),
  Watcher = require('./watcher'),
  rsync = require('./rsync');

  function Route(input, output, options) {
    if (!(input && output)) {
      throw new TypeError('Route requires input and output');
    }

    var src = input.path,
    dest = output.path;
    options = options || {};
    src += fs.statSync(src).isDirectory() ? '/' : '';

    this.src = src;
    this.dest = dest;
    this.options = options || {};
    this.socket = output.socket;

    fs.exists(src+'.git', this._isCode.bind(this));
    this.watcher = new Watcher(src, {ignore:input.ignore}, this.copy.bind(this));
  }

  (function(proto, ext) {
    var k;
    for (k in ext) { proto[k] = ext[k]; }
  }(Route.prototype, {
    copy : function(o) {
      console.log.apply(console, Object.keys(o));
      rsync.copy(this.src, this.dest, this.options, function() {
        console.log(this.src, '->', this.dest);
      }.bind(this), this.socket);
    },

    _isCode : function(is) {
      if ( this.options.isCode === undefined ) {
        this.options.isCode = is;
      }
    },

    destroy : function() {
      if (this.watcher) {
        this.watcher.destroy();
      }
    }
  }));

  return Route;
}());