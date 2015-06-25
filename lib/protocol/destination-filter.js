function DestinationFilter() {
  if (!(this instanceof DestinationFilter)) return new DestinationFilter();
}

var Q = require('q');

module.exports = DestinationFilter;

/** begin Protocol methods **/

DestinationFilter.prototype.init = function(stack, sender, receiver) {
  this.stack = stack;
  this.sender = sender;
  this.receiver = receiver;
};

DestinationFilter.prototype.start = function() {
  return Q();
};

DestinationFilter.prototype.stop = function() {
  return Q();
};

DestinationFilter.prototype.send = function(message) {
  return this.sender(message);
};

DestinationFilter.prototype.receive = function(message) {
  if (message.cluster === this.stack.cluster &&
      (message.isMulticast() || message.destination === this.stack.address)) {
    this.receiver(message);
  }
};

/** end Protocol methods **/
