
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

var Udp = require('./protocol/udp');

/**
 * Create a new Channel
 */
function Channel(name, options) {
  if (!(this instanceof Channel)) return new Channel(name, options);
  this.name = name;
  this.protocol = new Udp(this);
  this.options = options;

  this.protocol.on('message', function(message) {
    this.emit('message', message);
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
 * @param {string} cluster The cluster name to connect to.
 * @param {function} callback Function to call when connect completes.
 * @return {Channel} this
 */
Channel.prototype.connect = function(cluster, callback) {
  // our promise handles invoking the callback
  var deferred = Q.defer();

  // connecting blocks, so run on the next tick and the
  // caller with the promise when complete.
  process.nextTick(function() {
    this.cluster = cluster;
    try {
      if (this.state === State.CONNECTED) {
        deferred.resolve(this);
      } else {
        this.state = State.CONNECTING;
        this.protocol.start(cluster, function(er) {
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
  }.bind(this));
  return deferred.promise.nodeify(callback);
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
  // TODO: handle non-string messages
  this.protocol.publish(message.toString());
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

