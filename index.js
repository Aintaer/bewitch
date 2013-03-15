#!/usr/bin/env node

/*jslint stupid:true */
/*global process */
(function() {
  'use strict';

  var routes = require('./config.json'),
  Watcher = require('./lib/watcher'),
  Master = require('./lib/ssh_master'),
  rsync = require('./lib/rsync'),
  fs = require('fs'),
  masters = [],
  watchers = [];

  function spawn(routes) {
    var sources = Object.keys(routes);

    (function spawnMaster() {
      if (!sources.length) { return; }
      var src = sources.shift(),
      dest = routes[src],
      master;

      src = fs.realpathSync(src);

      master = new Master( dest.split(':')[0] );
      master.on('connection', function(socket) {
        console.log('Listening to '+src);
        var watcher = new Watcher(src, function(o) {
          console.log.apply(console, Object.keys(o));
          rsync.copy(src, dest, function() {
            console.log(src, '->', dest);
          }, socket);
        });
        watchers.push(watcher);

        spawnMaster();
      });
      masters.push(master);
    }());
  }

  // Spawn all the routes!
  spawn( routes );

  process.on('SIGINT', function() {
    process.exit();
  });

  process.on('exit', function destroy() {
    if (masters.length) {
      masters.forEach(function(master) {
        master.destroy();
      });
    }
    if (watchers.length) {
      watchers.forEach(function(watcher) {
        watcher.destroy();
      });
    }
  });

}());
