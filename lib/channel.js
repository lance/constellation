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

var ProtoStack = require('./protocol-stack'),
    DestFilter = require('./protocol/destination-filter'),
    Heartbeat  = require('./protocol/heartbeat'),
    Ping       = require('./protocol/ping'),
    Udp        = require('./protocol/udp'),
    VerSuspect = require('./protocol/verify-suspect'),
    Message    = require('./message');

/**
 * @module channel
 */

/**
 * Create a new Channel. Can be used directly if you want to manage
 * all of your own channels, or use the Channel.create utility.
 * @constructor
 * @see Channel.create
 * @param {string} cluster The name of the cluster to connect to.
 */
function Channel(cluster) {
  if (!(this instanceof Channel)) return new Channel(cluster );
  this.cluster = cluster;
  this.protocols = new ProtoStack(cluster, [new VerSuspect(), new Heartbeat(),
                                            new Ping(), new DestFilter(),
                                            new Udp()]);
  // TODO: Should address live on Channel and ProtocolStack have a reference?
  this.address = this.protocols.address;

  this.protocols.on('message', this.onMessage.bind(this));
  this.protocols.on('viewChanged', this.onViewChanged.bind(this));
  this.protocols.on('memberAdded', this.onMemberAdded.bind(this));
  this.protocols.on('memberRemoved', this.onMemberRemoved.bind(this));
}

/**
 * @ignore
 */

var EE   = require('events').EventEmitter,
    util = require('util'),
    Q    = require('q');

util.inherits(Channel, EE);

Channel._channels = [];

module.exports = Channel;

/**
 * Creates a new {module:channel~Channel} which may be connected to the cluster
 * identified by 'name'. If a {module:channel~Channel} already exists for 'name'
 * it will be returned.
 *
 * @param {String} name the name of the cluster to join once the 
 * {module:channel~Channel} has connected.
 * @returns {Channel} the {module:channel~Channel}
 */
Channel.create = function(name) {
  var lst = Channel.channels(name);
  if (!lst || lst.length < 1) {
    var channel = new Channel(name);
    Channel._channels.push(channel);
    return channel;
  }
  return lst.shift();
};

/**
 * Get a list of {module:channel~Channel}s in the cluster.
 *
 * @param {String} [name] The name for filtering which channels are returned.
 * If not supplied, all channels are returned.
 * @return {Array} the list of Channels matching the cluster name
 */
Channel.channels = function(name) {
  if (!name) return Channel._channels;
  return Channel._channels.filter(function(channel) {
    return channel.cluster === name;
  });
};

/**
 * Connect this Channel to the cluster. 
 *
 * @param {function} [callback] Optional function to call when 
 * connect completes.
 *
 * @return {object} A promise that is resolved when a connection has 
 * been made or an error occurs. If `callback` is supplied,
 * it will be called with this channel as its second parameter.
 *
 * @example
 *     // using node style callbacks
 *     channel.connect(function(err, ch) {
 *       if (err) {
 *         // handle error condition
 *       } else {
 *         ch.send("a message");
 *       }
 *     });
 *
 *     // using promises
 *     channel.connect().then(function(ch) {
 *       ch.send("a message");
 *     }).catch(function(err) {
 *       // handle error condition
 *     });
 */
Channel.prototype.connect = function(callback) {

  if (this.state === Channel.State.CONNECTED) {
    return Q(this);
  } else {
    this.state = Channel.State.CONNECTING;
    return this.protocols.start()
      .then(connected(this), failed(this)).nodeify(callback);
  }

  function connected(channel) {
    return function() {
      channel.state = Channel.State.CONNECTED;
      channel.emit('connected', channel);
      return Q(channel);
    };
  }

  function failed(channel) {
    return function(e) {
      channel.state = Channel.State.OPEN;
      return Q.reject(e);
    };
  }
};

/**
 * Publishes a message to all Channel subscribers. 
 *
 * @param {string} message the message to send
 * @param {function} [callback] Optional function to call when the message
 * has been published.
 * @return {object} A promise, that when resolved successfully will call
 * the callback function passing this channel as its only parameter.
 */
Channel.prototype.publish = function(message, callback) {
  // TODO: handle non-string messages
  return this.send(null, message, callback);
};

/**
 * Sends a message to the recipient
 *
 * @param {string} message the message to send
 * @param {string} recipient the node to send the message to
 * @param {function} [callback] Optional function to call when the message
 * has been sent.
 * @return {object} A promise, that when resolved successfully will call
 * the callback function passing this channel as its only parameter.
 */
Channel.prototype.send = function(recipient, message, callback) {
  // TODO: only multicast for now
  return this.protocols.send(new Message({destination: recipient,
                                   body: message.toString()}))
    .then(Q(this)).nodeify(callback);
};

/**
 * Emitted when a message is recieved on this channel.
 *
 * @event module:channel~Channel#message
 * @param {string} message.body The body of the message that was received
 * @param {object} message The message that was received
 */
Channel.prototype.onMessage = function(message) {
  this.emit('message', message.body, message);
};

/**
 * Emitted when a change is detected in the cluster. Typically, this is
 * when a node joins or leaves the cluster.
 *
 * @event module:channel~Channel.viewChanged
 * @param {object} view A view of the channel, which includes all current members
 * and metadata about what has changed.
 */
Channel.prototype.onViewChanged = function(view) {
  // view is a list of other nodes in the cluster
  // with some metadata about what has changed
  this.emit('viewChanged', view);
};


/**
 * Emitted when a node joins the cluster.
 * @event module:channel~Channel.memberAdded
 * @param {object} member An object describing the new node
 * @param {object} view A view of the channel, which includes all current members
 * and metadata about what has changed.
 */
Channel.prototype.onMemberAdded = function(member, view) {
  this.emit('memberAdded', member, view);
};

/**
 * Emitted when a node leaves the cluster.
 * @event module:channel~Channel.memberRemoved
 * @param {object} member An object describing the old node
 * @param {object} view A view of the channel, which includes all current members
 * and metadata about what has changed.
 */
Channel.prototype.onMemberRemoved = function(member, view) {
  this.emit('memberRemoved', member, view);
};

Channel.State = {
  OPEN: 'open',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  CLOSED: 'closed'
};

