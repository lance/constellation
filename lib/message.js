module.exports = Message;

function Message(destination, data) {
  this.destination = destination;
  this.data = data;
}


Message.prototype.getDestination = function() {
  return this.destination;
};

Message.prototype.getSource = function() {
  return this.source;
};
