var Channel = require('./lib/channel');
var readline = require('readline');

var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('What cluster would you like to join? ', function(name) {
  var channel = Channel.create(name);
  channel.connect().then(connectHandler, errorHandler);
});

rl.on('SIGINT', function() {
  rl.close();
  console.log('\nGoodbye');
  process.exit();
});


function connectHandler(channel) {
  var cluster = channel.cluster;
  console.log("Connected to " + cluster);

  channel.on('message', function(message) {
    console.log('\nreceived message: ' + message);
    prompt();
  });

  channel.on('viewChanged', function(members) {
    console.log('\ncluster members are: ' + members);
    prompt();
  });

  channel.on('memberAdded', function(member, members) {
    if (member !== channel.address) {
      console.log('\nnew cluster member is ' + member);
      channel.send(member, channel.address + ' greets you');
      prompt();
    }
  });

  channel.on('memberRemoved', function(member, members) {
    console.log('\nremoved cluster member ' + member);
    prompt();
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

