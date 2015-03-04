
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

/**
 * Create a new Channel
 */
function Channel(name, stack, options) {
  if (!(this instanceof Channel)) return new Channel(name, stack, options);
  this.name = name;
  this.stack = stack;
  this.options = options;
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
  this.emit('message');
  return this;
};

Channel.prototype.send = function(recipient, message) {
  // TODO
};

