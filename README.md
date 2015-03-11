# Clustered messaging bus inspired by JGroups

## Usage

This is experimental and under constant change. There is no point in a
"Usage" section until things stabilize a bit more. But if you're
interested, make sure your firewall allows UDP traffic on port 7600 -
7700 and then run the demo script in more than one terminal.

    node demo.js

Type a message in the terminal, hit enter, and watch the message get
received by both processes. This should also work on different
machines, assuming firewalling isn't in the way and your network
allows UDP multicast.

## How to Build

The project is built with `grunt`. Simply running `grunt` in the local
directory will execute the default task, including jshint, tests, and docs. To
run just the tests: `grunt mochaTest`. To check your source for lint, run
`grunt jshint`. To generate docs, run `grunt doxx`.


