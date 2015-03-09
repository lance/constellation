function Ping() {
  this.members = [];
}

var Message = require('../message'),
    Q       = require('q');

module.exports = Ping;


/** begin Protocol methods **/

Ping.prototype.init = function(stack, sender, receiver) {
  this.stack = stack;
  this.sender = sender;
  this.receiver = receiver;
};

Ping.prototype.start = function(cluster, callback) {
  var deferred = Q.defer();
  this.sendDiscoverRequest();
  deferred.resolve();

  return deferred.promise.nodeify(callback);
};

Ping.prototype.send = function(message) {
  this.sender(message);
};

Ping.prototype.receive = function(message) {
  if (message.headers['discover-request']) {
    this.sendDiscoverReply();
  } else if (message.headers['discover-reply']) {
    this.updateMembers(message);
  } else {
    this.receiver(message);
  }
};

/** end Protocol methods **/


Ping.prototype.sendDiscoverRequest = function() {
  var message = new Message();
  message.headers['discover-request'] = true;
  this.sender(message);
};

Ping.prototype.sendDiscoverReply = function() {
  var message = new Message();
  message.headers['discover-reply'] = true;
  this.sender(message);
};

Ping.prototype.updateMembers = function(message) {
  var member = message.sourceAddress + ':' + message.sourcePort;
  if (this.members.indexOf(member) < 0) {
    this.members.push(member);
    this.stack.emit('viewChanged', this.members);
  }
};
