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
var assert  = require('assert'),
    Cluster = require('../cluster.js'),
    Channel = require('../channel.js');

describe('Cluster', function() {
  it('should be able to create a Channel', function() {
    var channel = Cluster.createChannel('messages');
    assert(channel, 'did not create a Channel');
    assert(channel instanceof Channel, 'created something not a Channel');
  });

  it('should only create a channel for a given name once', function() {
    Cluster.createChannel('messages');
    Cluster.createChannel('messages');
    assert(Cluster.length === 1, 'Created too many channels');
  });

  it('should maintain a list of channels that were created', function() {
    var channel = Cluster.createChannel('messages'),
        list = Cluster.channels();
    assert(list, 'did not return a channel list');
    assert(list.length === 1, 'returned an empty channel list');
    assert(list[0] === channel, 'Wrong channel returned');
    Cluster.createChannel('other-channel');
    assert(Cluster.channels().length === 2, 'Wrong number of channels returned');
  });

  it('should find channels based on a predicate', function() {
    var tacos = Cluster.createChannel('tacos'),
        enchiladas = Cluster.createChannel('enchiladas');
    assert(Cluster.find(function(c) { return c.name === 'tacos'; }) === tacos);
  });
});
