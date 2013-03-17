#!/usr/bin/env node

/*global process */
(function() {
  'use strict';

  var argv = require('optimist')
    .usage('Watch directories to copy to a remote location\nUsage: $0 [-c file] [source] [destination]')
    .alias('c', 'config')
    .describe('c', "Configuration file")
    .argv,
  //argv._ [0] and [1] are command-line src and dest
  //argv.c should be path to config.json
  routes = require('./routes'),
  fs = require('fs'),
  util = require('util'),
  config = {routes:{}};

  function _argv(_) {
    if (util.isArray(config.routes)) {
      config.routes.push({source: _[0], destination: _[1]});
    }
    else if (typeof config.routes === 'object') {
      config.routes[_[0]] = _[1];
    }
  }

  process.on('SIGINT', function() {
    process.exit();
  });

  process.on('exit', function destroy() {
    routes.destroy();
  });

  if (argv.c) {
    // config file
    fs.readFile(argv.c, {encoding: 'utf8'}, function(err, data) {
      if (err) { 
        console.error(err.toString());
        process.exit();
      }
      config = JSON.parse(data);
      if (argv._.length >= 2) {
       _argv(argv._);
      }
      // Spawn all the routes!
      routes.spawn(config.routes);
    });
  }
  else {
    // command line arguments only
    if (argv._.length < 2) {
      require('optimist').showHelp();
      process.exit();
    }
     _argv(argv._);
    routes.spawn(config.routes);
  }
}());
