var MULTICAST_PORT = 7600;
var MULTICAST_HOST = '228.8.8.8';

function Udp() {
  if (!(this instanceof Udp)) return new Udp();
}

var dgram   = require('dgram'),
    os      = require('os'),
    Q       = require('q');

module.exports = Udp;

/** begin Protocol methods **/

Udp.prototype.init = function(stack, sender, receiver) {
  this.stack = stack;
  this.sender = sender;
  this.receiver = receiver;
};

Udp.prototype.start = function(callback) {
  var deferred = Q.defer(),
      socket   = dgram.createSocket({type: 'udp4', reuseAddr: true});

  socket.on('message', this.onMessage.bind(this));
  socket.on('error', function(e) { deferred.reject(e); });

  socket.bind(MULTICAST_PORT, function() {
    socket.setMulticastTTL(8);
    socket.addMembership(MULTICAST_HOST);
    this.socket = socket;
    deferred.resolve();
  }.bind(this));

  return deferred.promise.nodeify(callback);
};

Udp.prototype.send = function(message, callback) {
  message.source = this.sourceAddress();

  var buffer   = new Buffer(JSON.stringify(message)),
      deferred = Q.defer();

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

Udp.prototype.receive = function(message) {
  // only useful if we ever add another protocol sitting at a lower
  // layer than Udp and other transport protocols
  this.receiver(message);
};

/** end Protocol methods **/

Udp.prototype.onMessage = function(message, remote) {
  message = JSON.parse(message);
  this.receiver(message);
};

Udp.prototype.sourceAddress = function() {
  return this.stack.cluster + '|' + os.hostname() + ':' + process.pid;
};
