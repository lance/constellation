function Monitor() {
  if (!(this instanceof Monitor)) return new Monitor();
  this.view = [];
  this.log = [];
}

Monitor.prototype.viewChanged = function(members) {
  this.view = members;
  console.log('cluster members are: ' + members);
};

Monitor.prototype.onMessage = function(message) {
  this.log.push(message);
};

module.exports = Monitor;
