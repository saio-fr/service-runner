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

var childProcess = require('child_process');
var tape = require('blue-tape');
var when = require('when');

function helper(st, cmd, shouldThrow, stopTimeout) {
  var killTimeoutId = null;
  var serviceExec;
  var args = cmd.split(' ');
  args.shift();
  serviceExec = childProcess.spawn('node', args);

  if (stopTimeout !== undefined) {
    killTimeoutId = setTimeout(function() {
      serviceExec.kill();
    }, stopTimeout);
  }

  return when.promise(function(resolve, reject) {
    serviceExec.on('exit', function(code) {
      var success = (code === 0) === !shouldThrow;
      st.ok(success);

      if (killTimeoutId !== null) {
        clearTimeout(killTimeoutId);
        killTimeoutId = null;
      }

      if (success) {
        resolve();
      } else {
        reject();
      }
    });
  });
}

tape('run:', function(t) {
  t.test('service that doesn\'t exist', function(st) {
    var cmd = 'node bin/service-runner.js test/services/unkown.js';
    var shouldThrow = true;
    var killTimeout = 1000;
    return helper(st, cmd, shouldThrow, killTimeout);
  });

  t.test('service constructor error', function(st) {
    var cmd = 'node bin/service-runner.js test/services/constructorError.js';
    var shouldThrow = true;
    var killTimeout = 1000;
    return helper(st, cmd, shouldThrow, killTimeout);
  });

  t.test('service options', function(st) {
    var cmd = 'node bin/service-runner.js test/services/optionsValidation.js';
    cmd += ' --argOpt1 val1 --argOpt2 val2 --noArgOpt -x x -yz';
    var shouldThrow = false;
    var killTimeout = 1000;
    return helper(st, cmd, shouldThrow, killTimeout);
  });

  t.test('service start error', function(st) {
    var cmd = 'node bin/service-runner.js test/services/startError.js';
    var shouldThrow = true;
    var killTimeout = 1000;
    return helper(st, cmd, shouldThrow, killTimeout);
  });

  t.test('service self stop error', function(st) {
    var cmd = 'node bin/service-runner.js test/services/stopError.js';
    var shouldThrow = true;
    var killTimeout = 1000;
    return helper(st, cmd, shouldThrow, killTimeout);
  });

  t.test('service work error', function(st) {
    var cmd = 'node bin/service-runner.js test/services/workError.js';
    var shouldThrow = true;
    var killTimeout = 1000;
    return helper(st, cmd, shouldThrow, killTimeout);
  });

  t.test('service explicit stop error', function(st) {
    var cmd = 'node bin/service-runner.js test/services/explicitStopError.js';
    var shouldThrow = true;
    var killTimeout = 200;
    return helper(st, cmd, shouldThrow, killTimeout);
  });

  t.test('service explicit stop success', function(st) {
    var cmd = 'node bin/service-runner.js test/services/explicitStopSuccess.js';
    var shouldThrow = false;
    var killTimeout = 200;
    return helper(st, cmd, shouldThrow, killTimeout);
  });

  t.test('service infinite stop => kill after 10s', function(st) {
    var cmd = 'node bin/service-runner.js test/services/infiniteStop.js';
    var shouldThrow = true;
    var killTimeout = 200;
    return helper(st, cmd, shouldThrow, killTimeout);
  });
});
