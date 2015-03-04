
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
  this.name = name;
  this.stack = stack;
  this.options = options;
}

Channel.prototype = [];

Channel.prototype.connect = function(cluster) {
  this.cluster = cluster;
};

Channel.prototype.matches = function(selector) {
  return (!selector || (selector.name === this.name));
};

Channel.prototype.publish = function(message) {
  this.map(function(listener) {
    listener(message);
  });
  return this;
};

Channel.prototype.send = function(recipient, message) {
  // TODO
};

/**
 * @ignore
 */
module.exports = Channel;

