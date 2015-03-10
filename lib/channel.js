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
    Ping       = require('./protocol/ping'),
    Udp        = require('./protocol/udp'),
    Message    = require('./message');

/**
 * Create a new Channel
 * @param {string} cluster The name of the cluster to connect to.
 */
function Channel(cluster, options) {
  if (!(this instanceof Channel)) return new Channel(options);
  this.cluster = cluster;
  this.protocols = new ProtoStack(cluster, [new Ping(), new DestFilter(), new Udp()]);
  this.options = options;

  /**
   * **Channel#message**
   * Emitted when a message is recieved on this channel.
   * @event Channel#message
   * @param {object} message The message that was received
   */
  this.protocols.on('message', function(message) {
    this.emit('message', message.body);
  }.bind(this));

  /**
   * **Channel#viewChanged**
   * Emitted when a change is detected in the cluster. Typically, this is
   * when a node joines or leaves the cluster.
   *
   * @event Channel.viewChanged
   * @param {object} view A view of the channel, which includes all current members
   * and metadata about what has changed.
   */
  this.protocols.on('viewChanged', function(view) {
    // view is a list of other nodes in the cluster
    // with some metadata about what has changed
    this.emit('viewChanged', view);
  }.bind(this));

  /**
   * **Channel#memberAdded**
   * Emitted when a node joins the cluster.
   * @event Channel.memberAdded
   * @param {object} member An object describing the new node
   * @param {object} view A view of the channel, which includes all current members
   * and metadata about what has changed.
   */
  this.protocols.on('memberAdded', function(member, view) {
    this.emit('memberAdded', member, view);
  }.bind(this));

  /**
   * **Channel#memberRemoved**
   * Emitted when a node leaves the cluster.
   * @event Channel.memberRemoved
   * @param {object} member An object describing the old node
   * @param {object} view A view of the channel, which includes all current members
   * and metadata about what has changed.
   */
  this.protocols.on('memberRemoved', function(member, view) {
    this.emit('memberRemoved', member, view);
  }.bind(this));
}

/**
 * @ignore
 */

var EE   = require('events').EventEmitter,
    util = require('util'),
    Q    = require('q');

util.inherits(Channel, EE);

module.exports = Channel;

/**
 * Connect this Channel to a {Cluster}. Uses the protocol
 * stack which was used to create this Channel to connect
 * with other Channels with the same name in this cluster.
 * @param {function} callback Function to call when connect completes.
 * @return {object} promise resolved when a connection has been made
 */
Channel.prototype.connect = function(callback) {
  // our promise handles invoking the callback
  var deferred = Q.defer();

  try {
    if (this.state === State.CONNECTED) {
      deferred.resolve(this);
    } else {
      this.state = State.CONNECTING;
      this.protocols.start(function(er) {
        if (er) {
          this.state = State.OPEN;
          deferred.reject(er);
        } else {
          this.state = State.CONNECTED;
          this.emit('connected');
        }
        deferred.resolve(this);
      }.bind(this));
    }
  } catch(e) {
    deferred.reject(e);
  }
  return deferred.promise.nodeify(callback);
};

/**
 * Publishes a message to all Channel subscribers. 
 * @param {string} message the message to send
 * @return {Channel} this
 */
Channel.prototype.publish = function(message) {
  // TODO: handle non-string messages
  this.protocols.send(new Message({body: message.toString()}));
  return this;
};

Channel.prototype.send = function(recipient, data) {
  // TODO: only multicast for now
  return this;
};

var State = {
  OPEN: 'open',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  CLOSED: 'closed'
};

