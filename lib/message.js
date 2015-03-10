function Message(obj) {
  if (!(this instanceof Message)) return new Message(obj);

  // These are here purely to document the properties we expect to exist
  this.headers = {};
  this.body = null;
  this.destination = null;
  this.source = null;

  for (var prop in obj) {
    this[prop] = obj[prop];
  }
}

module.exports = Message;

Message.prototype.isMulticast = function() {
  return this.destination === null;
};
