function Ping() {
  if (!(this instanceof Ping)) return new Ping();
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

Ping.prototype.start = function(callback) {
  var deferred = Q.defer();
  this.sendDiscoverRequest();
  deferred.resolve();

  return deferred.promise.nodeify(callback);
};

Ping.prototype.send = function(message) {
  this.sender(message);
};

Ping.prototype.receive = function(message) {
  switch(message.type) {
  case Message.FIND_MEMBERS:
    if (message.headers['members-request']) {
      this.sendDiscoverReply();
    } else if (message.headers['members-response']) {
      this.updateMembers(message);
    }
    break;
  default:
    this.receiver(message);
  }
};

/** end Protocol methods **/


Ping.prototype.sendDiscoverRequest = function() {
  var message = new Message({type: Message.FIND_MEMBERS});
  message.headers['members-request'] = true;
  this.sender(message);
};

Ping.prototype.sendDiscoverReply = function() {
  var message = new Message({type: Message.FIND_MEMBERS});
  message.headers['members-response'] = true;
  this.sender(message);
};

Ping.prototype.updateMembers = function(message) {
  var member = message.source;
  if (this.members.indexOf(member) < 0) {
    this.members.push(member);
    var viewMsg = new Message({type: Message.VIEW_CHANGE, body: this.members});
    this.receiver(viewMsg);
  }
};
