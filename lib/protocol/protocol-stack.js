var Protocol = require('./protocol');
var Udp = require('./udp');
var Ping = require('./ping');

module.exports = ProtocolStack;

function ProtocolStack(config) {
  // TODO: Don't hardcode protocols - look at config
  this.addProtocols([new Udp(), new Ping()]);
}

ProtocolStack.prototype = Object.create(Protocol.prototype);

Object.defineProperty(ProtocolStack.prototype, 'constructor', {
  value: ProtocolStack,
  enumerable: false
});

ProtocolStack.prototype.setChannel = function(channel) {
  this.channel = channel;
};

ProtocolStack.prototype.getProtocols = function() {
  var list = [];
  var protocol = this.topProtocol;
  while(protocol) {
    list.push(protocol);
    protocol = protocol.getDownProtocol();
  }
  return list;
};

ProtocolStack.prototype.addProtocol = function(protocol) {
  protocol.setProtocolStack(this);
  protocol.setUpProtocol(this);
  if (!this.bottomProtocol) {
    this.topProtocol = this.bottomProtocol = protocol;
    return;
  }
  protocol.setDownProtocol(this.topProtocol);
  protocol.getDownProtocol().setUpProtocol(protocol);
  this.topProtocol = protocol;
};

ProtocolStack.prototype.addProtocols = function(protocols) {
  var stack = this;
  protocols.forEach(function(protocol) {
    stack.addProtocol(protocol);
  });
};

ProtocolStack.prototype.getBottomProtocol = function() {
  var currentProtocol = this;
  while(currentProtocol && currentProtocol.getDownProtocol()) {
    currentProtocol = currentProtocol.getDownProtocol();
  }
  return currentProtocol;
};

ProtocolStack.prototype.init = function() {
  // TODO: reverse, Configurator, setDefaultValues
  this.topProtocol = this.connectProtocols(this.getProtocols().reverse());
  this.topProtocol.setUpProtocol(this);
  this.setDownProtocol(this.topProtocol);
  this.bottomProtocol = this.getBottomProtocol();
  this.initProtocolStack();
};

ProtocolStack.prototype.initProtocolStack = function() {
  this.getProtocols().reverse().forEach(function(protocol) {
    if (!protocol.getProtocolStack) {
      protocol.setProtocolStack(this);
    }
    protocol.init();
  });
};

ProtocolStack.prototype.startStack = function(clusterName, localAddress) {
  if (this.stopped === false) {
    return;
  }
  this.getProtocols().forEach(function(protocol) {
    protocol.start();
  });
  this.stopped = false;
};

ProtocolStack.prototype.up = function(event) {
  this.channel.up(event);
};

ProtocolStack.prototype.down = function(event) {
  if (this.topProtocol) {
    return this.topProtocol.down(event);
  }
  return null;
};

ProtocolStack.prototype.connectProtocols = function(protocols) {
  var currentLayer = null;
  var nextLayer = null;
  for (var i = 0; i < protocols.length; i++) {
    currentLayer = protocols[i];
    if (i + 1 >= protocols.length) {
      break;
    }
    nextLayer = protocols[i+1];
    nextLayer.setDownProtocol(currentLayer);
    currentLayer.setUpProtocol(nextLayer);
  }
  return currentLayer;
};

ProtocolStack.prototype.start = function() {
  this.getProtocols().forEach(function(protocol) {
    protocol.start();
  });
};

ProtocolStack.prototype.send = function(dest, data) {
  // TODO: This is completely wrong - stack sends messages up/down the
  // stack and not to each one like this
  this.getProtocols().forEach(function(protocol) {
    protocol.send(dest, data);
  });
};
