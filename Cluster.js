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
 * An event bus for Node.js
 */

/**
 * A handle on a Cluster
 */
var Cluster = [];

/**
 * Create a channel in this cluster
 * @param {String} name the Channel name
 * @param {Array} stack the Channel prototcol stack
 * @param {Object} options the Channel options
 * @returns {Object} the Channel
 */
Cluster.createChannel = function(name, stack, options) {
  return (Cluster.find(function(c) {
    if (c.name === name) return c;
    return null;
    }) || (function() {
      var channel = new Channel(name, stack, options);
      Cluster.push(channel);
      return channel;
    })());
};

/**
 * Get a list of channels in the cluster.
 * @param {Object} selector for filtering which channels are returned
 *        Example: var channels = coonstellation.channels({name:'alerts'});
 * @return {Array} the list of Channels matching the selctor
 */
Cluster.channels = function(selector) {
  return this.filter(function(channel) {
    return channel.matches(selector);
  });
};

/**
 * @ignore
 */
Cluster.find = function(predicate) {
  if (typeof predicate !== 'function') {
    throw new TypeError('predicate must be a function');
  }
  var list = Object(this);
  var length = list.length >>> 0;
  var thisArg = arguments[1];
  var value;

  for (var i = 0; i < length; i++) {
    value = list[i];
    if (predicate.call(thisArg, value, i, list)) {
      return value;
    }
  }
  return undefined;
};

var Channel = require('./Channel');

module.exports = Cluster;

