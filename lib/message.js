function Message(obj) {
  if (!(this instanceof Message)) return new Message(obj);

  // These are here purely to document the properties we expect to exist
  this.headers = {};
  this.type = Message.MSG;
  this.body = null;
  this.destination = null;
  this.source = null;

  for (var prop in obj) {
    this[prop] = obj[prop];
  }
}

module.exports = Message;

Message.MSG            = 'MSG';
Message.VIEW_CHANGE    = 'VIEW_CHANGE';
Message.FIND_MEMBERS   = 'FIND_MEMBERS';
Message.MEMBER_ADDED   = 'MEMBER_ADDED';
Message.MEMBER_REMOVED = 'MEMBER_REMOVED';
Message.HEARTBEAT      = 'HEARTBEAT';
Message.SUSPECT        = 'SUSPECT';
Message.ARE_YOU_DEAD   = 'ARE_YOU_DEAD';
Message.NOT_DEAD_YET   = 'NOT_DEAD_YET';

Message.prototype.isMulticast = function() {
  return this.destination === null;
};
