var Cluster = require('./lib/cluster');
var channel = Cluster.createChannel('MyChannel');

channel.connect('ChatCluster', function(e, ch) {

  if (e) { 
    return console.error("Cannot connect: " + e);
  }

  ch.on('message', function(message) {
    console.log('received message: ' + message);
    messagePrompt();
  });


  messagePrompt();

  process.stdin.on('readable', function() {
    var data = process.stdin.read();
    if (data !== null) {
      channel.publish(data);
    }
  });

});

function messagePrompt() {
  console.log('Enter a message to send to all nodes: ');
}
