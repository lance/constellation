var http = require('http'),
    cluster = require('cluster'),
    Monitor = require('./monitor'),
    Aquilla = require('aquilla').Cluster;

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
  var channel = Aquilla.createChannel('chatter');
  var monitor = new Monitor();

  channel.connect().then(connectHandler(monitor), errorHandler);

  http.createServer(function(req, res) {
    res.writeHead(200);
    res.setHeader('Content-type', 'text/plain');
    res.write("CLUSTER MEMBERS\n");
    res.write(monitor.view.join("\n"));
    res.end('NODE CLUSTER ID ' + cluster.worker.id);
  }).listen(8000);
  this.started = true;
};

function connectHandler(monitor) {
  return function(channel) {
    console.log("Worker " + 
        cluster.worker.id + 
        " connected to cluster " + 
        channel.cluster);
    channel.on('message', monitor.onMessage);
    channel.on('viewChanged', monitor.viewChanged);
  };
}

function errorHandler(reason) {
  console.error('ERROR (' + cluster.worker.id + '): ' + reason.toString());
}



