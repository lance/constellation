var cluster = require('cluster'),
    Master = require('./master'),
    Worker = require('./worker');

if (cluster.isMaster) { Master.start(); } 
else { new Worker().run(); }

