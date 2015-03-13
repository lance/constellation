var cluster = require('cluster'),
    Aquila  = require('aquila');

var Worker = module.exports = function(channel) {
  if (!(this instanceof Worker)) return new Worker();
  this.channel = Aquila.Channel.create(channel);
};

Worker.prototype.run = function() {

  this.channel.connect()
    .then(connectHandler)
    .catch(function(e) {
      console.error('ERROR (' + this.channel.address + '): ' + reason.toString());
      console.error(reason.stack);
    });

  this.channel.on('message', function(body) {
    var msg = body.split(' ');
    if (msg[0] === 'suicide' && msg[1] === this.channel.address) {
      console.log('Suicide message received. Offing myself ' + this.channel.address);
      process.exit(666);
    }
  }.bind(this));
};

function connectHandler(channel) {
  console.log("Worker " + channel.address + " connected to cluster");
}

if (!String.prototype.startsWith) {
  Object.defineProperty(String.prototype, 'startsWith', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function(searchString, position) {
      position = position || 0;
      return this.lastIndexOf(searchString, position) === position;
    }
  });
}
module.exports = Worker;
