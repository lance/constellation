// timeout after which a suspected member will be marked as dead if it
// doesn't reply to our ARE_YOU_DEAD request
var TIMEOUT = 2000;

function VerifySuspect() {
  if (!(this instanceof VerifySuspect)) return new VerifySuspect();

  this.suspectTimers = {};
}

var Message = require('../message'),
    Q       = require('q');

module.exports = VerifySuspect;

/** begin Protocol methods **/

VerifySuspect.prototype.init = function(stack, sender, receiver) {
  this.stack = stack;
  this.sender = sender;
  this.receiver = receiver;
};

VerifySuspect.prototype.start = function(callback) {
  var deferred = Q.defer();
  deferred.resolve();
  return deferred.promise.nodeify(callback);
};

VerifySuspect.prototype.send = function(message) {
  this.sender(message);
};

VerifySuspect.prototype.receive = function(message) {
  switch(message.type) {
  case Message.SUSPECT:
    this.verifyMember(message.body);
    break;
  case Message.ARE_YOU_DEAD:
    this.replyNotDead(message.source);
    break;
  case Message.NOT_DEAD_YET:
    this.unsuspectMember(message.source);
    break;
  default:
    this.receiver(message);
  }
};

/** end Protocol methods **/

VerifySuspect.prototype.verifyMember = function(member) {
  this.suspectTimers[member] = setTimeout(this.memberDead.bind(this), TIMEOUT, member);
  this.suspectTimers[member].unref();
  this.sender(new Message({type: Message.ARE_YOU_DEAD, destination: member}));
};

VerifySuspect.prototype.replyNotDead = function(member) {
  this.sender(new Message({type: Message.NOT_DEAD_YET, destination: member}));
};

VerifySuspect.prototype.unsuspectMember = function(member) {
  clearTimeout(this.suspectTimers[member]);
  delete this.suspectTimers[member];
};

VerifySuspect.prototype.memberDead = function(member) {
  if (this.stack.members[member]) {
    delete this.stack.members[member];
    delete this.suspectTimers[member];

    var memberMsg = new Message({type: Message.MEMBER_REMOVED,
                                 body: [member, this.stack.memberList()]});
    this.receiver(memberMsg);

    var viewMsg = new Message({type: Message.VIEW_CHANGE,
                               body: this.stack.memberList()});
    this.receiver(viewMsg);
  }
};
