var http = require('http'),
    cluster = require('cluster'),
    Monitor = require('./monitor'),
    Aquila  = require('aquila');

var Worker = module.exports = function() {
  if (!(this instanceof Worker)) return new Worker();
  this.started = false;
  process.on('message', function(msg) {
    if (msg === 'start' && !this.started) {
      console.log("Starting worker " + cluster.worker.id);
      this.run();
    }
  }.bind(this));
};

Worker.prototype.run = function() {
  var channel = Aquila.Channel.create('chatter');
  channel.connect().then(connectHandler, errorHandler);
  this.started = true;
};

function connectHandler(channel) {
  console.log("Worker " + cluster.worker.id + " connected to cluster");
}

function errorHandler(reason) {
  console.error('ERROR (' + cluster.worker.id + '): ' + reason.toString());
  console.error(reason.stack);
}



