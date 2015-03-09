function Message(body) {
  this.body = body;
  this.headers = {};
  this.destination = null;
  this.sourceAddress = null;
  this.sourcePort = null;
}

module.exports = Message;
