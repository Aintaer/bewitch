module.exports = (function() {
  'use strict';

  var baseSocket = '~/.ssh/bewitch-',
  spawn = require('child_process').spawn,
  exec = require('child_process').exec,
  Emitter = require('events').EventEmitter;

  function getHost( host ) {
    var h = host.replace(/\W/g, '-');
    return h;
  }

  function Master( args ) {
    var hostname = getHost(args),
    defaults = [
      //'-v', /* verbose */
      '-N', /* no shell */
      '-M', /* master mode */
      '-f', /* daemonize */
      '-S'  /* control socket file */
    ],
    emitter = new Emitter(),
    socket = baseSocket + hostname;
    defaults.push(socket);

    (function(proto, ext) {
      var k;
      for (k in ext) { proto[k] = ext[k]; }
    }(this, emitter));

    this.master = spawn('ssh', defaults.concat(args), {stdio: 'inherit'});

    this.master.on('exit', function(code, signal) {
      this.host = args;
      this.socket = socket;
      this.master = null;
      emitter.emit('connection', socket);
    }.bind(this) );
  }

  (function(proto, ext) {
    var k;
    for (k in ext) { proto[k] = ext[k]; }
  }(Master.prototype, {
    destroy: function() {
      if (this.master) {
        this.master.kill();
      }
      if (this.socket) {
        exec('ssh -S '+this.socket+' -O exit '+this.host);
      }
    }
  }));

  return Master;
}());
