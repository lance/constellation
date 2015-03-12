var cluster = require('cluster'),
    Master  = require('./master'),
    Worker  = require('./worker'),
    PORT    = 3000,
    CHANNEL = 'chatter';

if (cluster.isMaster) { Master.start(PORT, CHANNEL); } 
else { new Worker(CHANNEL).run(); }

