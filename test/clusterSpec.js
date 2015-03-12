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
    Channel = require('../index');

describe('Channel', function() {
  it('should be able to create a Channel', function() {
    var channel = Channel.createChannel('messages');
    assert(channel, 'did not create a Channel');
    assert(channel instanceof Channel, 'created something not a Channel');
  });

  it('should only create a channel for a given name once', function() {
    Channel.createChannel('messages');
    Channel.createChannel('messages');
    assert(Channel.channels().length === 1, 'Created too many channels');
  });

  it('should maintain a list of channels that were created', function() {
    var channel = Channel.createChannel('messages'),
        list = Channel.channels();
    assert(list, 'did not return a channel list');
    assert(list.length === 1, 'returned an empty channel list');
    assert(list[0] === channel, 'Wrong channel returned');
    Channel.createChannel('other-channel');
    assert(Channel.channels().length === 2, 'Wrong number of channels returned');
  });

});
