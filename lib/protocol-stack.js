function ProtocolStack(cluster, protocols) {
  if (!(this instanceof ProtocolStack)) return new ProtocolStack(protocols);
  this.cluster = cluster;
  this.protocols = protocols;
  this.initProtocols();
  this.top = protocols[0];
  this.bottom = protocols[protocols.length - 1];
}

var EE   = require('events').EventEmitter,
    util = require('util');

util.inherits(ProtocolStack, EE);

module.exports = ProtocolStack;

ProtocolStack.prototype.initProtocols = function() {
  // Set up/down protocols for each
  for (var i = 0; i < this.protocols.length; i++) {
    var current = this.protocols[i];
    if (i > 0) {
      current.upProtocol = this.protocols[i - 1];
    }
    if (i + 1 < this.protocols.length) {
      current.downProtocol = this.protocols[i + 1];
    }
  }

  // Initialize each protocol
  for (var j = 0; j < this.protocols.length; j++) {
    var sender = createSender(this, this.protocols[j]);
    var receiver = createReceiver(this, this.protocols[j]);
    this.protocols[j].init(this, sender, receiver);
  }
};

ProtocolStack.prototype.start = function(callback) {
  this._startProtocol(this.protocols.length - 1, callback);
};

ProtocolStack.prototype._startProtocol = function(i, callback) {
  var protocol = this.protocols[i];
  if (!protocol) {
    // finished starting all protocols without error
    callback();
    return;
  }
  protocol.start(function(er) {
    if (er) {
      callback(er);
    } else {
      this._startProtocol(i - 1, callback);
    }
  }.bind(this));
};


ProtocolStack.prototype.send = function(message) {
  this.top.send(message, createNext(this, this.top));
};

ProtocolStack.prototype.receive = function(message) {
  this.bottom.receive(message, createNext(this, this.bottom));
};


function createNext(stack, protocol) {
  return {
    send: function(message) {
    },
    receive: function(message) {
    }
  };
}

function createSender(stack, protocol) {
  return function(message) {
    if (protocol.downProtocol) {
      protocol.downProtocol.send(message);
    } else {
      console.log('end of the line, discarding sent message');
    }
  };
}

function createReceiver(stack, protocol) {
  return function(message) {
    if (protocol.upProtocol) {
      protocol.upProtocol.receive(message);
    } else {
      stack.emit('message', message);
    }
  };
}
