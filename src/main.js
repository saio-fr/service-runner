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
var Tester = require('./tester.js');

function run() {

  var runner = {
    stopping: false,
    container: null,

    start: function() {
      var that = this;
      var errorStop = _.bind(this.stop, this);
      var noErrorStop = _.bind(this.stop, this, undefined);
      var args;
      var yOptions;
      var serviceName;
      var serviceOptions;
      var service;

      // listen kill/err signals
      process.on('uncaughtException', errorStop);
      process.on('SIGINT', noErrorStop);
      process.on('SIGTERM', noErrorStop);
      process.on('SIGHUP', noErrorStop);
      process.on('beforeExit', noErrorStop);

      // args parsing
      args = process.argv.slice(2);
      yOptions = yargs.parse(args);
      if (_.isUndefined(yOptions._) ||
          yOptions._.length === 0 ||
          yOptions._[0] !== args[0]) {
        throw new Error('usage: service-runner <service> [--options]');
      }

      serviceName = yOptions._[0];
      serviceOptions = {};

      serviceOptions = _.pick(yOptions, function(value, key) {
        return _.has(yOptions, key) &&
          key !== '_' &&
          key !== '$0';
      });

      // instanciation and start
      if (path.extname(serviceName) === '.js') {
        // eg run a local file
        serviceName = path.join(process.env.PWD, serviceName);
      }

      try {
        service = require(serviceName);
        this.container = new Container(service, serviceOptions);
      } catch (err) {
        this.container = null;
        this.stop(err);
        return;
      }
      this.container._start()
      .catch(function(err) {
        that.stop(err);
      });
    },

    stop: function(err) {
      if (!_.isUndefined(err)) {
        if (err instanceof Error) {
          console.error(err.stack);
        } else {
          console.error(err);
        }
      }

      if (this.stopping) {
        return;
      }
      this.stopping = true;

      if (_.isNull(this.container)) { // => error during container instanciation or arg parsing
        process.exit(1);
        return;
      }

      // container is instanciated, try to do a graceful async shutdown (+ brutal exit timeout safety)
      setTimeout(function() {
        console.error('service shutdown is too long, it\'s time to kill !');
        process.exit(1);
      }, 10000);

      this.container._stop()
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
    }
  };

  runner.start();
}

module.exports.Tester = Tester;
module.exports.run = run;
