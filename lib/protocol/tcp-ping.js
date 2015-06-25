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
    Q        = require('q');

/**
 * The TCPPING protocol defines a static cluster membership.
 * The cluster members are retrieved by directly contacting the members listed
 * in initial_hosts, sending point-to-point discovery requests.
 *
 * The TCPPING protocol defines a static configuration, which requires that you
 * to know in advance where to find all of the members of your cluster.
 *
 * @param host {String} The host name or IP address to bind to locally.
 * @param port {Number} The port number to bind to locally. Default is 7077.
 */
function TcpPing(host, port) {
  if (!(this instanceof TcpPing)) return new TcpPing(host, port);
  this.host = host || 'localhost';
  this.port = port || 7077;
  this.remotes = {};
  return this;
}
Protocol.extend(TcpPing);
