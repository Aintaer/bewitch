#!/usr/bin/env node

/*jslint stupid:true */
/*global process */
(function() {
  'use strict';

  var config = require('./config.json'),
  Watcher = require('./lib/watcher'),
  Master = require('./lib/ssh_master'),
  rsync = require('./lib/rsync'),
  fs = require('fs'),
  masters = [],
  watchers = [];

  function spawn(routes) {
    var sources = Object.keys(routes);

    (function spawnNext() {
      if (!sources.length) { return; }
      var src = sources.shift(),
      dest = routes[src],
      host = dest.split(':'),
      master;

      try {
        src += fs.statSync(src).isDirectory() ? '/' : '';
      } catch (readErr) {
        spawnNext();
        return;
      }

      function watch(socket) {
        console.log('Listening to '+src);
        var watcher = new Watcher(src, function(o) {
          console.log.apply(console, Object.keys(o));
          rsync.copy(src, dest, function() {
            console.log(src, '->', dest);
          }, socket);
        });
        watchers.push(watcher);

        spawnNext();
      }

      if (host.length > 1) {
        master = new Master( host[0] );
        master.on('connection', watch);
        masters.push(master);
      }
      else {
        watch();
      }
    }());
  }

  // Spawn all the routes!
  spawn( config.routes );

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
