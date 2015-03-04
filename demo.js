var Cluster = require('./cluster');
var channel = Cluster.createChannel('MyChannel', ['udp']);

channel.on('viewAccepted', function(view) {
  console.log('new view: ' + view);
});
channel.on('message', function(message) {
  console.log('received message: ' + message.data);
  messagePrompt();
});

channel.connect('ChatCluster');

function messagePrompt() {
  console.log('Enter a message to send to all nodes: ');
}

messagePrompt();

process.stdin.on('readable', function() {
  var data = process.stdin.read();
  if (data !== null) {
    channel.publish(data);
  }
});
