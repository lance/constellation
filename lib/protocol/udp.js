var MULTICAST_PORT = 7600;
var MULTICAST_HOST = '228.8.8.8';
var MULTICAST_TTL = 8;
var PORT_RANGE = 100;

function Udp() {
  if (!(this instanceof Udp)) return new Udp();

  this.remotes = {};
}

var Message = require('../message'),
    dgram   = require('dgram'),
    Q       = require('q');

module.exports = Udp;

/** begin Protocol methods **/

Udp.prototype.init = function(stack, sender, receiver) {
  this.stack = stack;
  this.sender = sender;
  this.receiver = receiver;
};

Udp.prototype.start = function() {
  return this.bindMcast()
    .then(this.bindUcast.bind(this));
};

Udp.prototype.send = function(message) {
  message.source = this.stack.address;
  message.cluster = this.stack.cluster;

  var buffer   = new Buffer(JSON.stringify(message)),
      deferred = Q.defer(),
      remote   = {address: MULTICAST_HOST, port: MULTICAST_PORT};

  if (message.destination) {
    remote = this.destinationToRemote(message.destination);
  }

  this.ucastSock.send(buffer, 0, buffer.length, remote.port, remote.address, function(err) {
    if(err) {
      console.error(err);
      deferred.reject(err);
    } else {
      deferred.resolve();
    }
  });
  return deferred.promise;
};

Udp.prototype.receive = function(message) {
  // only useful if we ever add another protocol sitting at a lower
  // layer than Udp and other transport protocols
  this.receiver(message);
};

/** end Protocol methods **/

Udp.prototype.bindMcast = function() {
  var deferred = Q.defer(),
      socket   = dgram.createSocket({type: 'udp4', reuseAddr: true});

  socket.on('message', this.onMessage.bind(this));
  socket.on('error', deferred.reject);

  socket.bind({port: MULTICAST_PORT, exclusive: true}, function() {
    socket.addMembership(MULTICAST_HOST);
    this.mcastSock = socket;
    deferred.resolve();
  }.bind(this));
  return deferred.promise;
};

Udp.prototype.bindUcast = function() {
  var socket   = dgram.createSocket({type: 'udp4', reuseAddr: false}),
      bindPort = MULTICAST_PORT,
      maxPort  = bindPort + PORT_RANGE,
      deferred = Q.defer();

  function bindSuccess(udp) {
    udp.ucastSock.setMulticastTTL(MULTICAST_TTL);
    udp.ucastSock.on('message', udp.onMessage.bind(udp));
    deferred.resolve();
  }

  function bindError(er, udp) {
    if(er.errno === 'EADDRINUSE') {
      if (bindPort < maxPort) {
        bindPort++;
        tryBind(udp);
      } else {
        deferred.reject(err);
      }
    } else {
      deferred.reject(err);
    }
  }

  function tryBind(udp) {
    var socket = dgram.createSocket({type: 'udp4', reuseAddr: false});
    socket.on('error', function(er) {
      socket.close();
      bindError(er, udp);
    });
    socket.bind({port: bindPort, exclusive:true}, function() {
      udp.ucastSock = socket;
      bindSuccess(udp);
    });
  }

  tryBind(this);
  return deferred.promise;
};

Udp.prototype.onMessage = function(message, remote) {
  message = new Message(JSON.parse(message));
  if (message.source) {
    this.remotes[message.source] = {address: remote.address, port: remote.port};
  }
  this.receiver(message);
};

Udp.prototype.destinationToRemote = function(destination) {
  var remote = this.remotes[destination];
  if (!remote) {
    // TODO: something better
    throw 'cannot send message to unknown destination ' + destination;
  }
  return remote;
};
