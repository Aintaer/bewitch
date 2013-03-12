module.exports = (function() {
  'use strict';

  var fs = require('fs'),
  sweepDuration = 50, // 50ms default sweepDuration
  sweepIncrement = 5,
  sweepMaximum = 2500;

  function Sweep(dir, callback) {
    if (typeof dir !=='string') {
      throw new TypeError('Directory must be a pathname');
    }
    if (typeof callback !=='function') {
      throw new TypeError('callback must be a function');
    }
    this.action = callback;
    this.duration = sweepDuration;
    this.collector = {};
    this.sweep = this.sweep.bind(this);
    fs.watch(dir, this.changed.bind(this));
  }
  
  (function(proto, ext) {
    var k;
    for (k in ext) { proto[k] = ext[k]; }
  }(Sweep.prototype, {
    changed : function(event, filename) {
      if (event === 'rename') { return; }
      if (filename) {
        this.collector[filename] = this.collector[filename] || 0;
        this.duration += this.collector[filename]++ ? 0 : sweepIncrement;
        this.duration = Math.min(this.duration, sweepMaximum);
      }
      this.mark();
    },
    mark : function() {
      if (this.active) { clearTimeout(this.active); }
      this.active = setTimeout(this.sweep, this.duration);
    },
    sweep : function() {
      this.action(this.collector);
      var k;
      for (k in this.collector) {
        delete this.collector[k];
      }
      this.duration = sweepDuration;
      this.active = false;
    }
  }));

  return Sweep;
}());
