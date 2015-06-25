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
    Channel = require('../lib/channel');

describe('Channel', function() {
  it('should be able to create a Channel', function() {
    var channel = Channel.create('messages');
    assert(channel, 'did not create a Channel');
  });

  it('should "connect"', function() {
    var channel = Channel.create('messages');
    return channel.connect();
  });

  it('should stop', function() {
    var channel = Channel.create('messages');
    return channel.connect().then(function() {
      return channel.stop();
    });
  });

  it('should not send messages when stopped', function() {
    var channel = Channel.create('messages');
  });

  describe('builder', function() {
    it('should allow a custom protocol stack', function() {
      var builder  = Channel.builder('test-messages'),
          channel = builder.udp().build();
      assert(channel, 'did not create a channel');
    });
  });
});
