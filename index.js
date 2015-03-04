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
 * Create or join a cluster
 */
var Constellation = function(name, options) {
};

/**
 * Create a channel in this cluster
 * @param {String} name the Channel name
 * @param {Array} stack the Channel prototcol stack
 * @param {Object} options the Channel options
 * @returns {Object} the Channel
 */
Constellation.prototype.createChannel = function(name, stack, options) {
  // TODO: What options can be provided?
};

/**
 * Get a list of channels in the cluster.
 * @param {Object} selector for filtering which channels are returned
 *        Example: var channels = coonstellation.channels({name:'alerts'});
 * @return {Array} the list of Channels matching the selctor
 */
Constellation.prototype.channels = function(selector) {
};

/**
 * @ignore
 */
var EE   = require('events').EventEmitter,
    util = require('util');

