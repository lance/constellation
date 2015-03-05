var Protocol = require('./protocol');

module.exports = Ping;

function Ping() {
}

Ping.prototype = Object.create(Protocol.prototype);

Object.defineProperty(Ping.prototype, 'constructor', {
  value: Ping,
  enumerable: false
});

Ping.prototype.start = function() {
  // TODO: something
};

Ping.prototype.stop = function() {
  // TODO: something
};
