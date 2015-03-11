// emit viewChanged events once every X milliseconds
var VIEW_INTERVAL = 250;

function Ping() {
  if (!(this instanceof Ping)) return new Ping();
  this.members = [];
  this.pendingMessages = [];
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
  setInterval(this.processPendingMessages.bind(this), VIEW_INTERVAL).unref();
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
      this.sendDiscoverReply(message.source);
      // Add the member that just sent the request to our member list
      this.updateMembers(message);
    } else if (message.headers['members-response']) {
      this.updateMembers(message);
    }
    break;
  default:
    this.receiver(message);
  }
};

/** end Protocol methods **/

Ping.prototype.processPendingMessages = function() {
  var viewMsg = null;
  this.pendingMessages.forEach(function(message) {
    if (message.type === Message.VIEW_CHANGE) {
      // Only send the latest VIEW_CHANGE up the stack
      viewMsg = message;
    } else {
      this.receiver(message);
    }
  }.bind(this));
  if (viewMsg) {
    this.receiver(viewMsg);
  }
  this.pendingMessages = [];
};

Ping.prototype.sendDiscoverRequest = function() {
  var message = new Message({type: Message.FIND_MEMBERS});
  message.headers['members-request'] = true;
  this.sender(message);
};

Ping.prototype.sendDiscoverReply = function(destination) {
  var message = new Message({type: Message.FIND_MEMBERS,
                             destination: destination});
  message.headers['members-response'] = true;
  this.sender(message);
};

Ping.prototype.updateMembers = function(message) {
  var member = message.source;
  if (this.members.indexOf(member) < 0) {
    this.members.push(member);
    var viewMsg = new Message({type: Message.VIEW_CHANGE, body: this.members});
    this.pendingMessages.push(viewMsg);

    var memberMsg = new Message({type: Message.MEMBER_ADDED,
                                 body: [member, this.members]});
    this.pendingMessages.push(memberMsg);
  }
};
