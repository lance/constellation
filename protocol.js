module.exports = Protocol;

function Protocol() {
}

Protocol.prototype.getProtocolStack = function() {
  return this.stack;
};

Protocol.prototype.setProtocolStack = function(stack) {
  this.stack = stack;
};

Protocol.prototype.getUpProtocol = function() {
  return this.upProtocol;
};

Protocol.prototype.setUpProtocol = function(upProtocol) {
  this.upProtocol = upProtocol;
};

Protocol.prototype.getDownProtocol = function() {
  return this.downProtocol;
};

Protocol.prototype.setDownProtocol = function(downProtocol) {
  this.downProtocol = downProtocol;
};

Protocol.prototype.init = function() {
};

Protocol.prototype.up = function(event) {
  this.upProtocol.up(event);
};

Protocol.prototype.down = function(event) {
  this.downProtocol.down(event);
};

Protocol.prototype.toString = function() {
  return this.constructor.name;
};
