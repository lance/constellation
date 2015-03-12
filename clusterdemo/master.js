var http     = require('http'),
    cluster  = require('cluster'),
    express  = require('express'),
    socketio = require('socket.io'),
    Aquila   = require('aquila'), 
    Monitor  = require('./monitor'),
    numCPUs  = require('os').cpus().length,
    app      = express(),
    server   = http.createServer(app),
    io       = socketio(server);

var Master = {
};

Master.start = function(port, channelName) {

  // create a clustered message channel, and monitor
  // it with a simple in-memory message store
  var channel   = Aquila.Channel.create(channelName),
      monitor   = new Monitor(channel);

  // connect to the channel
  channel.connect().then(connectHandler).catch(errorHandler);

  // start the HTTP server
  server.listen(port, function() {
    console.log("Master HTTP server started on port " + port);
  });

  // static routing for HTTP
  app.use(express.static(__dirname + '/public'));

  // websockets with socket.io to communicate with a browser app
  io.on('connection', function(socket) {
    socket.on('add client', function() {
      socket.emit('view', monitor.view);
    });
    channel.on('viewChanged', function(members) {
      socket.emit('view', monitor.view);
    });
  });

  // log when workers go down
  cluster.on('exit', function(node, code, signal) {
    console.log('worker ' + node.process.pid + ' died. ' + code);
  });

  // fork our worker processes
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  function connectHandler() {
    console.log("Master connected to cluster " + channel.cluster);
  }

  function errorHandler(reason) {
    console.error('ERROR (Master): ' + reason.toString());
    console.error(reason.stack);
  }

};

module.exports = Master;
