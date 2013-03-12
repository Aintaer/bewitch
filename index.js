#!/usr/bin/env node

(function() {
  'use strict';

  var Sweep = require('./lib/sweep'),
  watcher;

  watcher = new Sweep('test', console.log);
}());
