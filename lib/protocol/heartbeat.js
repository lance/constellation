// how often to send a heartbeat to the cluster, in milliseconds
var HEARTBEAT_INTERVAL = 1000;

// timeout after which a node with no heartbeat will be suspected as down
var TIMEOUT_INTERVAL = 4000;

function Heartbeat() {
  if (!(this instanceof Heartbeat)) return new Heartbeat();

  this.heartbeats = {};
}

var Message = require('../message'),
    Q       = require('q');

module.exports = Heartbeat;

/** begin Protocol methods **/

Heartbeat.prototype.init = function(stack, sender, receiver) {
  this.stack = stack;
  this.sender = sender;
  this.receiver = receiver;
};

Heartbeat.prototype.start = function(callback) {
  var deferred = Q.defer();
  setInterval(this.sendHeartbeat.bind(this), HEARTBEAT_INTERVAL).unref();
  setInterval(this.verifyHeartbeats.bind(this), TIMEOUT_INTERVAL).unref();
  deferred.resolve();
  return deferred.promise.nodeify(callback);
};

Heartbeat.prototype.send = function(message) {
  this.sender(message);
};

Heartbeat.prototype.receive = function(message) {
  switch(message.type) {
  case Message.HEARTBEAT:
    this.updateMember(message.source);
    break;
  case Message.NOT_DEAD_YET:
    this.updateMember(message.source);
    this.receiver(message);
   break;
  default:
    this.receiver(message);
  }
};

/** end Protocol methods **/

Heartbeat.prototype.sendHeartbeat = function() {
  var message = new Message({type: Message.HEARTBEAT});
  this.sender(message);
};

Heartbeat.prototype.updateMember = function(member) {
  if (member && member !== this.stack.address) {
    this.heartbeats[member] = true;
  }
};

Heartbeat.prototype.verifyHeartbeats = function() {
  for (var member in this.heartbeats) {
    var seen = this.heartbeats[member];
    if (!seen) {
      delete this.heartbeats[member];
      this.receiver(new Message({type: Message.SUSPECT, body: member}));
    } else {
      this.heartbeats[member] = false;
    }
  }
};
