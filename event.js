module.exports = Event;

function Event(type, arg) {
  this.type = type;
  this.arg = arg;
}

Event.MSG = 'MSG';
Event.CONNECT = 'CONNECT';
Event.DISCONNECT = 'DISCONNECT';
Event.VIEW_CHANGE = 'VIEW_CHANGE';

Event.prototype.getType = function() {
  return this.type;
};

Event.prototype.getArg = function() {
  return this.arg;
};
