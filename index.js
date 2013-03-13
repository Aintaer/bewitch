#!/usr/bin/env node

/*jslint stupid:true */
/*global process */
(function() {
  'use strict';

  var Watcher = require('./lib/watcher'),
  fs = require('fs'),
  exec = require('child_process').exec,
  watcher, src, dest;

  src = 'test';
  src = fs.realpathSync(src /*, cache */);
  dest = 'aintaer@solid.be.lan:/home/aintaer/test';

  watcher = new Watcher(src, function(o) {
    exec('rsync -rltz -e ssh --executability . '+dest, 
         {cwd: src}, 
         function(err, stdout, stderr) {
    });
    console.log(src, Object.keys(o), '->', dest);
  });
}());
