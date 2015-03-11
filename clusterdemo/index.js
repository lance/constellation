var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var Worker = require('./worker');

if (cluster.isMaster) {
  cluster.on('online', startNode);
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', function(node, code, signal) {
    console.log('worker ' + node.process.pid + ' died. ' + code);
  });
  console.log('Master started');
} else {
  new Worker();
}

function startNode(node) {
  console.log('Starting node ' + node.process.pid);
  node.send('start');
}
