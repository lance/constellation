var dgram = require('dgram');
var Event = require('./event');
var Protocol = require('./protocol');

module.exports = Udp;

function Udp() {
}

Udp.prototype = Object.create(Protocol.prototype);

Object.defineProperty(Udp.prototype, 'constructor', {
  value: Udp,
  enumerable: false
});

Udp.prototype.start = function() {
  var socket = dgram.createSocket({type: 'udp4', reuseAddr: true});
  socket.bind(7600, function() {
    socket.setMulticastTTL(8);
    socket.addMembership('228.8.8.8');
  });
  socket.on('message', this.onMessage.bind(this));
  socket.on('error', console.error);
  this.socket = socket;
};

Udp.prototype.stop = function() {
  this.socket.close();
};

Udp.prototype.down = function(event) {
  if (event.getType() !== Event.MSG) {
    return this.handleDownEvent(event);
  }

  var message = event.getArg();
  // TODO: header, sourceaddress, physicaladdress
  var destination = message.getDestination();
  var sender = message.getSource();
  var multicast = destination === null;
  var doSend = multicast || destination !== sender;
  var loopback = (multicast || destination === sender); // TODO: DONT_LOOPBACK

  if (doSend) {
    this._send(message, destination);
  }
  if (loopback) {
    this.loopback(message, multicast);
  }
};

Udp.prototype.loopback = function(message, multicast) {
  // TODO: something here, or remove it
};

Udp.prototype._send = function(message, destination) {
  try {
    this.send(message, destination);
  } catch (e) {
    // TODO: catch specific failures, do something more useful
    console.error(e.stack);
  }
};

Udp.prototype.handleDownEvent = function(event) {
  // TODO: something here, handling non-message event types
};

Udp.prototype.send = function(message, destination) {
  var buffer = new Buffer(JSON.stringify(message));
  // TODO: rest of writeMessage - version, multicast flag, etc
  this.doSend('clusternamegoeshere', buffer, destination);
};

Udp.prototype.doSend = function(clusterName, buffer, destination) {
  if (!destination) {
    this.sendMulticast(clusterName, buffer);
  }
};

Udp.prototype.sendMulticast = function(clusterName, buffer) {
  // TODO: a lot of other stuff - this just assumes mcast
  this.socket.send(buffer, 0, buffer.length, 7600, '228.8.8.8', function(err) {
    if(err) {
      console.error(err);
    }
  });
};

Udp.prototype.onMessage = function(message, remote) {
  this.receive(remote, message);
};

Udp.prototype.receive = function(sender, data) {
  //TODO: local loopback stuff, message lists
  this.handleSingleMessage(sender, data);
};

Udp.prototype.handleSingleMessage = function(sender, data) {
  // TODO: Lots of stuff here - this assumes multicast, hardcodes
  // cluster name
  var message = JSON.parse(data);
  var multicast = true;
  this.passMessageUp(message, 'clusternamegoeshere');
};

Udp.prototype.passMessageUp = function(message, clusterName) {
  var protocol = this.getUpProtocol();
  if (!protocol) {
    return;
  }
  protocol.up(new Event(Event.MSG, message));
};
