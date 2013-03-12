module.exports = (function() {
  'use strict';

  var fs = require('fs'),
  sweepDuration = 50, // 50ms default sweepDuration
  sweepIncrement = 5,
  sweepMaximum = 2500;

  function Watcher(dir, callback) {
    if (typeof dir !=='string') {
      throw new TypeError('Directory must be a pathname');
    }
    if (typeof callback !=='function') {
      throw new TypeError('callback must be a function');
    }
    this.path = dir + (/\/$/.test(dir) ? '' : '/');
    this.action = callback;
    this.duration = sweepDuration;
    this.collector = {};
    this.subdir = {};
    this.sweep = this.sweep.bind(this);

    var that = this;
    fs.watch(dir, this.changed.bind(this));
    fs.readdir(dir, function(err, files) {
      files.forEach(function(filename) {
        that.sub(filename);
      });
    });
  }
  
  (function(proto, ext) {
    var k;
    for (k in ext) { proto[k] = ext[k]; }
  }(Watcher.prototype, {
    changed : function(event, filename) {
      this.mark(filename);
    },
    sub : function(filename) {
      if (!filename) { return; }
      fs.stat(this.path + filename, function(err, stats) {
        if (err && this.subdir[filename]) {
          this.subdir[filename].destroy();
          delete this.subdir[filename];
        }
        if (stats && stats.isDirectory() && !this.subdir[filename]) {
          this.subdir[filename] = new Watcher( this.path + filename, this.mark.bind(this, filename) );
        }
      }.bind(this));
    },
    mark : function(filename) {
      if (this.active) { clearTimeout(this.active); }
      if (filename) {
        this.collector[filename] = this.collector[filename] || 0;
        this.duration += this.collector[filename]++ ? 0 : sweepIncrement;
        this.duration = Math.min(this.duration, sweepMaximum);
      }
      this.active = setTimeout(this.sweep, this.duration);
      this.sub(filename);
    },
    sweep : function() {
      this.action(this.collector);
      var k;
      for (k in this.collector) {
        delete this.collector[k];
      }
      this.duration = sweepDuration;
      this.active = false;
    },
    destroy : function() {
      var k;
      for (k in this.subdir) {
        this.subdir[k].destroy();
        delete this.subdir[k];
      }
    }
  }));

  return Watcher;
}());
