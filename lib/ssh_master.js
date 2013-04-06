module.exports = (function() {
  'use strict';

  var baseSocket = '~/.ssh/bewitch-',
  spawn = require('child_process').spawn,
  exec = require('child_process').exec,
  util = require('util'),
  fs = require('fs'),
  Emitter = require('events').EventEmitter;

  function Master(args) {
    var defaults = [
      //'-v', /* verbose */
      '-N', /* no shell */
      '-M', /* master mode */
      '-f', /* daemonize */
      '-S'  /* control socket file */
    ],
    emitter = new Emitter(),
    socket = baseSocket + args.replace(/\W/g, '-');
    defaults.push(socket);

    (function(proto, ext) {
      var k;
      for (k in ext) { proto[k] = ext[k]; }
    }(this, emitter));

    if (fs.existsSync(socket)) {
      fs.unlinkSync(socket);
    }

    this.master = spawn('ssh', defaults.concat(args), {stdio: 'inherit'});

    this.master.on('exit', function(code, signal) {
      this.host = args;
      this.socket = socket;
      this.master = null;
      this.emit('connection', socket);
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
        exec(util.format('ssh -S %s -O exit %s', this.socket, this.host));
      }
    }
  }));

  return Master;
}());
