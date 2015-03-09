var MULTICAST_PORT = 7600;
var MULTICAST_HOST = '228.8.8.8';

function Udp() {
}

var EE    = require('events').EventEmitter,
    dgram = require('dgram'),
    util  = require('util'),
    Q     = require('q');

util.inherits(Udp, EE);

module.exports = Udp;

Udp.prototype.start = function(cluster, callback) {
  this.cluster = cluster;

  var deferred = Q.defer(),
      socket   = dgram.createSocket({type: 'udp4', reuseAddr: true});

  socket.on('message', this.onMessage.bind(this));
  socket.on('error', function(e) { deferred.reject(e); });

  socket.bind(MULTICAST_PORT, function() {
    socket.setMulticastTTL(8);
    socket.addMembership(MULTICAST_HOST);
    this.socket = socket;
    deferred.resolve();
  });
  return deferred.promise.nodeify(callback);
};

Udp.prototype.stop = function() {
  this.socket.close();
};

Udp.prototype.publish = function(message, callback) {
  var payload = {
    message: message,
    cluster: this.cluster
  }, deferred = Q.defer();
  var buffer = new Buffer(JSON.stringify(payload));
  this.socket.send(buffer, 0, buffer.length, MULTICAST_PORT, MULTICAST_HOST, function(err) {
    if(err) {
      console.error(err);
      deferred.reject(err);
    } else {
      deferred.resolve();
    }
  });
  return deferred.promise.nodeify(callback);
};

Udp.prototype.onMessage = function(message, remote) {
  var payload = JSON.parse(message);
  if (payload.cluster == this.cluster) {
    this.emit('message', payload.message);
  }
};
