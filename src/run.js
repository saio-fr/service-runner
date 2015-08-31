/*-------------------------------------------------*\
|                                                 |
|      /$$$$$$    /$$$$$$   /$$$$$$   /$$$$$$     |
|     /$$__  $$  /$$__  $$ |_  $$_/  /$$__  $$    |
|    | $$  \__/ | $$  \ $$   | $$   | $$  \ $$    |
|    |  $$$$$$  | $$$$$$$$   | $$   | $$  | $$    |
|     \____  $$ | $$__  $$   | $$   | $$  | $$    |
|     /$$  \ $$ | $$  | $$   | $$   | $$  | $$    |
|    |  $$$$$$/ | $$  | $$  /$$$$$$ |  $$$$$$/    |
|     \______/  |__/  |__/ |______/  \______/     |
|                                                 |
|                                                 |
|                                                 |
|    *---------------------------------------*    |
|    |   © 2015 SAIO - All Rights Reserved   |    |
|    *---------------------------------------*    |
|                                                 |
\*-------------------------------------------------*/

var _ = require('underscore');
var yargs = require('yargs');
var path = require('path');
var Container = require('./container.js');

var Runner = function() {

  var args = process.argv.slice(2);
  var yOptions = yargs.parse(args);
  var serviceName;
  var serviceOptions;
  var serviceConstructor;

  this._stopping = false;

  if (_.isUndefined(yOptions._) || yOptions._.length === 0 || yOptions._[0] !== args[0]) {
    throw new Error('usage: service-runner <service> [--options]');
  }

  serviceName = yOptions._[0];
  if (path.extname(serviceName) === '.js') {
    serviceName = path.join(process.env.PWD, serviceName);
  }

  serviceOptions = _.pick(yOptions, function(value, key) {
    return _.has(yOptions, key) && key !== '_' && key !== '$0';
  });

  // may throw
  serviceConstructor = require(serviceName);
  this._container = new Container(serviceConstructor, serviceOptions);
};

Runner.prototype.start = function() {
  var that = this;

  var posixStopSignals = [
    'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL',
    'SIGTRAP', 'SIGABRT', 'SIGBUS', 'SIGFPE',
    'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM',
  ];

  _.each(posixStopSignals, function(signal) {
    process.on(signal, function() {
      that._stop();
    });
  });

  process.on('uncaughtException', function(err) {
    that._stop(err);
  });

  process.on('beforeExit', function() {
    that._stop();
  });

  this._container._start()
  .catch(function(err) {
    that._stop(err);
  });
};

Runner.prototype._stop = function(err) {
  if (!_.isUndefined(err)) {
    if (err instanceof Error) {
      console.error(err.stack);
    } else {
      console.error(err);
    }
  }

  if (this._stopping) {
    return;
  }
  this._stopping = true;

  // try to do a graceful shutdown (+ brutal exit timeout safety)
  setTimeout(function() {
    console.error('service shutdown is too long, it\'s time to kill it !');
    process.exit(1);
  }, 10000);

  this._container._stop()
  .then(function() {
    if (!_.isUndefined(err)) {
      process.exit(1);
    }
    process.exit(0);

  }, function(containerStopErr) {
      if (!_.isUndefined(containerStopErr)) {
        if (containerStopErr instanceof Error) {
          console.error(containerStopErr.stack);
        } else {
          console.error(containerStopErr);
        }
      }
      process.exit(1);
    });
};

module.exports = function() {
  var runner = new Runner();
  runner.start();
};
