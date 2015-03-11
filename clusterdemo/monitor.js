var cluster = require('cluster');

function Monitor() {
  if (!(this instanceof Monitor)) return new Monitor();
  this.view = [];
  this.messages = [];
}

Monitor.prototype.viewChanged = function(members) {
  this.view = members;
};

Monitor.prototype.onMessage = function(message) {
  this.messages.push(cluster.worker.id + ': ' + message);
};

module.exports = Monitor;
