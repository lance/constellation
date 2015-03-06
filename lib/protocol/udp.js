var MULTICAST_PORT = 7600;
var MULTICAST_HOST = '228.8.8.8';

function Udp() {
}

var EE    = require('events').EventEmitter,
    dgram = require('dgram'),
    util  = require('util');

util.inherits(Udp, EE);

module.exports = Udp;

Udp.prototype.start = function(cluster, callback) {
  this.cluster = cluster;

  var socket = dgram.createSocket({type: 'udp4', reuseAddr: true});
  socket.on('message', this.onMessage.bind(this));
  socket.on('error', callback);
  socket.bind(MULTICAST_PORT, function() {
    socket.setMulticastTTL(8);
    socket.addMembership(MULTICAST_HOST);
    callback();
  });
  this.socket = socket;
};

Udp.prototype.stop = function() {
  this.socket.close();
};

Udp.prototype.publish = function(message) {
  // TODO: Hook this up to a callback for errors?
  var payload = {
    message: message,
    cluster: this.cluster
  };
  var buffer = new Buffer(JSON.stringify(payload));
  this.socket.send(buffer, 0, buffer.length, MULTICAST_PORT, MULTICAST_HOST, function(err) {
    if(err) {
      console.error(err);
    }
  });
};

Udp.prototype.onMessage = function(message, remote) {
  var payload = JSON.parse(message);
  if (payload.cluster == this.cluster) {
    this.emit('message', payload.message);
  }
};
