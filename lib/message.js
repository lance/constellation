function Message(body) {
  if (!(this instanceof Message)) return new Message(body);
  this.body = body;
  this.headers = {};
  this.destination = null;
  this.source = null;
}

module.exports = Message;
