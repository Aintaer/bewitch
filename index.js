#!/usr/bin/env node

/*global process */
(function() {
  'use strict';

  var config = require('./config.json'),
  Master = require('./lib/ssh_master'),
  Route = require('./lib/route'),
  masters = [],
  routes = [];

  function spawn(config) {
    // config.routes can be in two formats
    // Object of source : destination
    // Array of { source: '', destination: '' }
    if (!config.routes) { return; }
    var pathDefs = config.routes.length 
    ? config.routes 
    : Object.keys(config.routes).map(function(source) {
      return {source: source, destination: this[source]};
    }, config.routes);

    // async loop
    (function spawnNext() {
      if (!pathDefs.length) { return; }
      var pathDef = pathDefs.shift(),
      host = pathDef.destination.split(':'),
      master;

      function makeRoute(socket) {
        try {
          routes.push(new Route(
            {path: pathDef.source, ignore: pathDef.ignore},
            {path: pathDef.destination, socket: socket},
            {isCode: pathDef.isCode, include: pathDef.include, exclude: pathDef.exclude}
          ));
          console.log('Listening to '+pathDef.source);
        }
        catch (readErr) {
          console.error(readErr.toString());
        }
        spawnNext();
      }

      if (host.length > 1) {
        master = new Master( host[0] );
        master.on('connection', makeRoute);
        masters.push(master);
      }
      else {
        makeRoute();
      }
    }());
  }

  // Spawn all the routes!
  spawn(config);

  process.on('SIGINT', function() {
    process.exit();
  });

  process.on('exit', function destroy() {
    if (masters.length) {
      masters.forEach(function(master) {
        master.destroy();
      });
    }
    if (routes.length) {
      routes.forEach(function(route) {
        route.destroy();
      });
    }
  });

}());
