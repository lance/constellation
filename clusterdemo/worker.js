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
  var channel = Aquila.create('chatter');
  var monitor = new Monitor();

  channel.connect().then(connectHandler(monitor), errorHandler);

  http.createServer(function(req, res) {
    res.setHeader('Content-type', 'text/plain');
    res.writeHead(200);
    res.write('CLUSTER ID ' + this.id().cluster + "\n");
    res.write('PROCESS ID ' + this.id().pid + "\n");
    res.write("CLUSTER MEMBERS\n");
    res.write(monitor.view.join("\n"));
    res.end("\n");
    channel.publish('REQUEST FROM ' + req);
  }.bind(this)).listen(8000);
  this.started = true;
};

Worker.prototype.id = function() {
  return {
    cluster: cluster.worker.id,
    pid: cluster.worker.process.pid
  };
};

function connectHandler(monitor) {
  return function(channel) {
    console.log("Worker " + 
        cluster.worker.id + 
        " connected to cluster " + 
        channel.cluster);
    channel.on('message', monitor.onMessage.bind(monitor));
    channel.on('viewChanged', monitor.viewChanged.bind(monitor));
  };
}

function errorHandler(reason) {
  console.error('ERROR (' + cluster.worker.id + '): ' + reason.toString());
  console.error(reason.stack);
}



