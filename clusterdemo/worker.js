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
};

function connectHandler(channel) {
  console.log("Worker " + channel.address + " connected to cluster");
}

module.exports = Worker;
