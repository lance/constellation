var Cluster = require('./lib/cluster');
var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('What cluster would you like to join? ', function(name) {
  var channel = Cluster.createChannel(name);
  channel.connect().then(connectHandler, errorHandler);
});

function connectHandler(channel) {
  var cluster = channel.cluster;
  console.log("Connected to " + cluster);

  channel.on('message', function(message) {
    console.log('received message: ' + message);
  });

  channel.on('viewChanged', function(members) {
    console.log('cluster members are: ' + members);
  });

  function prompt() {
    var p = 'Enter a message for all nodes on ' + cluster + ': ';
    rl.question(p, function(answer) {
      if (answer) channel.publish(answer);
      prompt();
    });
  }

  prompt();
}

function errorHandler(reason) {
  console.error(reason);
}

