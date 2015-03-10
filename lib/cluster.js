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
 * Represents a collection of all known channels in this process space
 * @typedef {Array} Cluster
 * @type {Cluster}
 */
var Cluster = [];

/**
 * Create a channel in this cluster
 * @param {String} name the Channel name
 * @param {Object} options the Channel options
 * @returns {Channel} the Channel
 */
Cluster.createChannel = function(name, options) {
  var lst = Cluster.channels(name);
  if (!lst || lst.length < 1) {
    var channel = new Channel(name, options);
    Cluster.push(channel);
    return channel;
  }
  return lst.shift();
};

/**
 * Get a list of channels in the cluster.
 * @param {String} cluster name for filtering which channels are returned
 * @return {Array} the list of Channels matching the cluster name
 * @example 
 * var channels = coonstellation.channels('alerts');
 */
Cluster.channels = function(cluster) {
  if (!cluster) return this;
  return this.filter(function(channel) {
    return channel.cluster == cluster;
  });
};


/**
 * @ignore
 */
var Channel = require('./channel');

module.exports = Cluster;

