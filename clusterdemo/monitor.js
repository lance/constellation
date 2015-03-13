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
  // Our view doesn't need to include us. If we're down,
  // then we're not really doing any of this anyway...
  this.view = members.filter(function(m) { 
    return m !== this.channel.address;
  }.bind(this));
};

Monitor.prototype.onMessage = function(body, message) {
  this.messages.push(message);
};

module.exports = Monitor;
