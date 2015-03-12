var http    = require('http'),
    cluster = require('cluster'),
    Aquila  = require('aquila'), 
    Monitor = require('./monitor'),
    numCPUs = require('os').cpus().length;

var Master = {};

Master.start = function() {
  cluster.on('online', startNode);

  cluster.on('exit', function(node, code, signal) {
    console.log('worker ' + node.process.pid + ' died. ' + code);
  });

  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  startServer();

  var channel   = Aquila.Channel.create('chatter'),
      monitor   = new Monitor(channel);

  channel.connect().then(connectHandler).catch(errorHandler);

  function startNode(node) {
    console.log('Starting node ' + node.process.pid);
    node.send('start');
  }

  function connectHandler() {
    console.log("Master connected to cluster " + channel.cluster);
  }

  function errorHandler(reason) {
    console.error('ERROR (Master): ' + reason.toString());
    console.error(reason.stack);
  }

  function startServer() {
    http.createServer(function(req, res) {
      res.setHeader('Content-type', 'text/plain');
      res.writeHead(200);
      res.write("CLUSTER MEMBERS\n");
      res.write(monitor.view.join("\n"));
      res.end("\n");
      channel.publish('REQUEST FROM ' + req);
    }.bind(this)).listen(8000);
  }
};

module.exports = Master;
