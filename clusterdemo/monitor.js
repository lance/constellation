var cluster = require('cluster');

function Monitor(channel) {
  if (!(this instanceof Monitor)) return new Monitor(channel);
  this.view = [];
  this.messages = [];
  this.channel = channel;
  channel.on('viewChanged', this.onViewChanged.bind(this));
  channel.on('message', this.onMessage.bind(this));
}

Monitor.prototype.onViewChanged = function(members) {
  this.view = members;
  console.log('View changed: ' + members);
};

Monitor.prototype.onMessage = function(body, message) {
  this.messages.push(message);
  console.log('Message from ' + message.source);
  console.log('Received by ' + this.channel.address);
  console.log('Body ' + body);
};

module.exports = Monitor;
