module.exports=(function() {
  'use strict';

  var
  Master = require('./lib/ssh_master'),
  Route = require('./lib/route');

  function merge(globalConf, pathDef) {
    var allowed = {ignore:1, include:1, exclude:1};
    return Array.prototype.reduce.call(arguments, function(obj, source) {
      var i;
      for (i in source) {
        if (allowed.hasOwnProperty(i)) {
          obj[i] = source[i];
        }
      }
      return obj;
    }, {});
  }

  return {
    routes : [],
    masters : {},
    spawn : function spawn(config) {
      if (!config.routes) { return; }
      // config.routes can be in two formats
      // Object of source : destination
      // Array of { source: '', destination: '' }
      var pathDefs = config.routes.length 
      ? /* array  */ config.routes
      : /* object */ Object.keys(config.routes).map(function(source) {
        return {source: source, destination: this[source]};
      }, config.routes),
      routes = this.routes,
      masters = this.masters;

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
              merge(config, pathDef)
            ));
            console.log('Listening to '+pathDef.source);
          }
          catch (readErr) {
            console.error(readErr.toString());
          }
          spawnNext();
        }

        if (host.length > 1) {
          // There's a hostname, try to use a master connection
          if ((master = masters[host[0]]) != null) {
            makeRoute(master.socket);
            return;
          }
          // No existing master connection, try to make one
          master = new Master( host[0] );
          master.on('connection', makeRoute);
          masters[host[0]] = master;
        }
        else {
          // Just make the route
          makeRoute();
        }
      }());
    },
    destroy : function() {
      var i;
      if (Object.keys(this.masters).length) {
        for (i in this.masters) {
          this.masters[i].destroy();
        }
      }
      if (this.routes.length) {
        this.routes.forEach(function(route) {
          route.destroy();
        });
      }
    }
  };
}());
