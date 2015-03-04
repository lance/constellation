
/*!
 * Copyright 2015 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var uuid = require('node-uuid');

var Event = require('./event');
var Message = require('./message');
var ProtocolStack = require('./protocol-stack');

/**
 * Create a new Channel
 */
function Channel(name, stackConfig, options) {
  if (!(this instanceof Channel)) return new Channel(name, stackConfig, options);
  this.name = name;
  this.stack = new ProtocolStack(stackConfig);
  this.options = options;

  this.stack.init();
  this.stack.setChannel(this);
}

/**
 * @ignore
 */

var EE = require('events').EventEmitter,
    util = require('util');

util.inherits(Channel, EE);

module.exports = Channel;
/**
 * Connect this Channel to a {Cluster}. Uses the protocol
 * stack which was used to create this Channel to connect
 * with other Channels with the same name in this cluster.
 * @param {string} cluster The cluster name to connect to.
 * @return {Channel} this
 */
Channel.prototype.connect = function(cluster) {
  this.cluster = cluster;
  if (!this.preConnect(cluster)) {
    return this;
  }
  if (cluster) {
    var connectEvent = new Event(Event.CONNECT, cluster);
    this._connect(connectEvent);
  }
  this.state = State.CONNECTED;
  // TODO: notifyChannelConnected
  return this;
};


/**
 * Returns true if `selector.name === this.name`.
 * Ultimately this should be a more sophisticated matching
 * system that allows selector to specify alternate properties
 * such as protocol and other options.
 *
 * @param {object} selector
 */
Channel.prototype.matches = function(selector) {
  return (!selector || (selector.name === this.name));
};

/**
 * Publishes a message to all Channel subscribers. 
 * @param {string} message the message to send
 * @return {Channel} this
 */
Channel.prototype.publish = function(message) {
  this.send(null, message);
  return this;
};

Channel.prototype.send = function(recipient, data) {
  this.checkClosedOrNotConnected();
  // TODO: handle non-string message payloads
  var message = new Message(recipient, data.toString());
  this.down(new Event(Event.MSG, message));
};

Channel.prototype.preConnect = function(cluster) {
  if (this.state === State.CONNECTED) {
    return false;
  }
  this.checkClosed();
  this.setAddress();
  var oldState = this.state;
  this.state = State.CONNECTING;
  try {
    this.startStack(cluster);
  } catch (e) {
    this.state = oldState;
    throw e;
  }
  return true;
};

Channel.prototype._connect = function(connectEvent) {
  try {
    this.down(connectEvent);
  } catch (e) {
    this.stopStack(true, false);
    this.state = State.OPEN;
    this.init();
    // TODO: channel name in exception
    throw('connecting to channel failed', e);
  }
};

Channel.prototype.up = function(event) {
  return this.invokeCallback(event.getType(), event.getArg());
};

Channel.prototype.down = function(event) {
  if (!event) {
    return null;
  }
  return this.stack.down(event);
};

Channel.prototype.invokeCallback = function(type, arg) {
  switch(type) {
    case Event.MSG:
      this.emit('message', arg);
      break;
    case Event.VIEW_CHANGE:
      this.emit('viewAccepted', arg);
      break;
    // TODO: other event types
  }
};

Channel.prototype.checkClosed = function() {
  if (this.state === State.CLOSED) {
    // TODO: exception object?
    throw 'channel is closed';
  }
};

Channel.prototype.checkClosedOrNotConnected = function() {
  if (this.state === State.CLOSED) {
    // TODO: exception object?
    throw 'channel is closed';
  }
  if (!(this.state === State.CONNECTING || this.state === State.CONNECTED)) {
    // TODO: exception object?
    throw 'channel is disconnected';
  }
};

Channel.prototype.setAddress = function() {
  var oldAddress = this.localAddress;
  this.localAddress = this.generateAddress();
  if (oldAddress) {
    this.down(new Event(Event.REMOVE_ADDRESS, oldAddress));
  }
  // TODO: rest of setAddress
};

Channel.prototype.generateAddress = function() {
  // TODO: configurable address generators?
  return uuid.v4();
};

Channel.prototype.init = function() {
  // TODO: REMOVE_ADDRESS event
  this.localAddress = null;
  this.cluster = null;
  this.myView = null;
};

Channel.prototype.startStack = function(cluster) {
  this.checkClosed();
  // TODO: unicast clusterName check
  this.cluster = cluster;
  // TODO: socket factory?
  this.stack.startStack(cluster, this.localAddress);

  // TODO: temporary view
};

Channel.prototype.stopStack = function(stop, destroy) {
  if (this.stack) {
    try {
      if (stop) {
        this.stack.stopStack(this.cluster);
      }
      if (destroy) {
        this.stack.destroy();
      }
    } catch (e) {
      console.error('StackDestroyFailure ' + e);
    }
  }
};

var State = {
  OPEN: 'open',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  CLOSED: 'closed'
};

