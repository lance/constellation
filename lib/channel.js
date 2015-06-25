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
 * @ignore
 */
var ProtoStack = require('./protocol-stack'),
    DestFilter = require('./protocol/destination-filter'),
    Heartbeat  = require('./protocol/heartbeat'),
    Ping       = require('./protocol/ping'),
    Udp        = require('./protocol/udp'),
    Tcp        = require('./protocol/tcp'),
    VerSuspect = require('./protocol/verify-suspect'),
    Message    = require('./message'),
    EE         = require('events').EventEmitter,
    Q          = require('q');

var Channel = {};
Channel.prototype = Object.create(EE.prototype);

/**
 * @exports Channel
 */
module.exports = Channel;

/**
 * Creates a builder which allows you to create a Channel with a custom protocol
 * stack.
 *
 * @param {String} name the name of the cluster to join once the
 * Channel is created and has been connected.
 * @returns {Object} A builder object which knows how to create a Channel
 *
 */
Channel.builder = function(name) {
  var protocols = [],
      builder = {
        verifySuspect: _build(VerSuspect),
        heartbeat: _build(Heartbeat),
        ping: _build(Ping),
        udp: _build(Udp),
        tcp: _build(Tcp),
        destinationFilter: _build(DestFilter),

        /**
         * @class Channel
         */
        build: function() {
          var stack = new ProtoStack(name, protocols),
              channel = Object.create(Channel.prototype, {
                'protocols': {
                  value: stack
                },
                'address': {
                  value: stack.address,
                  enumerable: true
                },
                'cluster': {
                  value: name,
                  enumerable: true
                },
                'state': {
                  value: Channel.State.OPEN,
                  enumerable: true,
                  writable: true
                }
              });

          stack.on('message', onMessage.bind(channel));
          stack.on('viewChanged', onViewChanged.bind(channel));
          stack.on('memberAdded', onMemberAdded.bind(channel));
          stack.on('memberRemoved', onMemberRemoved.bind(channel));
          return channel;
        }
      };


  function _build(f) {
    return function() {
      protocols.push(f.apply(this, Array.prototype.slice.call(arguments)));
      return builder;
    };
  }
  return builder;
};

/**
 * Creates a new {module:channel~Channel} which may be connected to the cluster
 * identified by 'name'.
 *
 * @param {String} name the name of the cluster to join once the
 * {module:channel~Channel} has connected.
 * @returns {Channel} the {module:channel~Channel}
 */
Channel.create = function(name) {
  return Channel.builder(name)
                .verifySuspect()
                .heartbeat()
                .ping()
                .udp()
                .build();
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
  if (this.state !== Channel.State.CONNECTED) return Q.reject('Channel not connected');
  return this.protocols.send(new Message({destination: recipient,
                                   body: message.toString()}))
    .then(Q(this)).nodeify(callback);
};

/**
 * Stops this channel, closing all connections.
 * @param {function} [callback] Optional function to call when the
 * channel is fully closed. The only parameter this function will be
 * passed is an error in the event of an error.
 */
Channel.prototype.stop = function(callback) {
  // TODO: We could be in the middle of sending messages
  // we probably want to have a cleaner shutdown ultimately
  this.state = Channel.State.CLOSED;
  return this.protocols.stop().then(Q(this)).nodeify(callback);
};

/**
 * Emitted when a message is recieved on this channel.
 *
 * @event module:channel~Channel#message
 * @param {string} message.body The body of the message that was received
 * @param {object} message The message that was received
 */
function onMessage(message) {
  this.emit('message', message.body, message);
}

/**
 * Emitted when a change is detected in the cluster. Typically, this is
 * when a node joins or leaves the cluster.
 *
 * @event module:channel~Channel.viewChanged
 * @param {object} view A view of the channel, which includes all current members
 * and metadata about what has changed.
 */
function onViewChanged(view) {
  // view is a list of other nodes in the cluster
  // with some metadata about what has changed
  this.emit('viewChanged', view);
}


/**
 * Emitted when a node joins the cluster.
 * @event module:channel~Channel.memberAdded
 * @param {object} member An object describing the new node
 * @param {object} view A view of the channel, which includes all current members
 * and metadata about what has changed.
 */
function onMemberAdded(member, view) {
  this.emit('memberAdded', member, view);
}

/**
 * Emitted when a node leaves the cluster.
 * @event module:channel~Channel.memberRemoved
 * @param {object} member An object describing the old node
 * @param {object} view A view of the channel, which includes all current members
 * and metadata about what has changed.
 */
function onMemberRemoved(member, view) {
  this.emit('memberRemoved', member, view);
}

/**
 * @module channel
 */
module.exports = Channel;

Channel.State = {
  OPEN: 'open',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  CLOSED: 'closed'
};
