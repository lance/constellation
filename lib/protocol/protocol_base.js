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

var Protocol = {};


/** begin Protocol methods **/
Protocol.init = function(stack, sender, receiver) {
  this.stack = stack;
  this.sender = sender;
  this.receiver = receiver;
};

Protocol.start = function() {
  return Q();
};

Protocol.stop = function() {
  return Q();
};

Protocol.send = function(message) {
  this.sender(message);
  return Q();
};

Protocol.receive = function(message) {
  this.receiver(message);
};

Protocol.extend = function(sub) {
  sub.prototype = Object.create(Protocol, {
    constructor: sub
  });
};

/** end Protocol methods **/
module.exports = Protocol;
