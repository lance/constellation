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

var Message  = require('../message'),
    Protocol = require('./protocol_base.js'),
    net      = require('net'),
    Q        = require('q');

/**
 * Creates a new thing that knows how to send messages over TCP.
 * @param host {String} The host name or IP address to bind to locally.
 * @param port {Number} The port number to bind to locally. Default is 7077.
 */
function Tcp(host, port) {
  if (!(this instanceof Tcp)) return new Tcp(host, port);
  this.host = host || 'localhost';
  this.port = port || 7077;
  this.remotes = {};
  return this;
}
Protocol.extend(Tcp);

/** begin Protocol methods **/
Tcp.prototype.start = function() {
  this.server = net.createServer(receiver(this));
  return Q.ninvoke(this.server, "listen", this.port, this.host);
};

Tcp.prototype.stop = function() {
  this.remotes = {};
  this.server.close();
  return Q();
};

Tcp.prototype.send = function(message) {
  if (!message.destination) {
    return Q.reject('Cannot send to an unknown destination.');
  }

  var remote  = this.remotes[message.destination];
  if (!remote || !remote.socket) {
    return Q.reject('No route to destination ' + message.destination);
  }

  message.source = this.stack.address;
  message.cluster = this.stack.cluster;

  return Q.ninvoke(remote.socket, "write", new Buffer(JSON.stringify(message)));
};
/** end Protocol methods **/


function receiver(tcp) {
  return function(sock) {
    // listen for messages
    sock.on('data', function(message) {
      message = new Message(JSON.parse(message));

      // if we don't know about this node, go ahead and
      // add it to our remotes, and hang on to the connection.
      if (message.source && !tcp.remotes[message.source]) {
        tcp.remotes[message.source] = initializeRemote(sock, message.source);
        sock.on('end', remoteEnd(tcp.remotes[message.source]));
        sock.on('error', remoteEnd(tcp.remotes[message.source]));
      }

      // send the message up the stack
      tcp.receiver(message);
    });

  };

  function initializeRemote(socket, source) {
    socket.setKeepAlive(true);

    var remote = {};
    remote.host = socket.remoteAddress;
    remote.port = socket.remotePort;
    remote.source = source;
    remote.socket = socket;
    return remote;
  }

  function remoteEnd(remote) {
    return function() {
      remote.socket = undefined;
    };
  }

}

module.exports = Tcp;
