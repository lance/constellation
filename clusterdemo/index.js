var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var Worker = require('./worker');

if (cluster.isMaster) {
  for (var i = 0; i < numCPUs; i++) {
    cluster.on('online', startNode);
    cluster.fork();
  }
  cluster.on('exit', function(node, code, signal) {
    console.log('worker ' + node.process.pid + ' died');
  });
} else {
  new Worker();
}

function startNode(node) {
  console.log('Starting node ' + node.process.pid);
  node.send('start');
}
