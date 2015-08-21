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

var Tester = require('../../src/tester.js');
var tape = require('tape');

tape.test('Tester', function(t) {
  t.plan(5);

  var containerDefined = false;
  var optionsDefined = false;
  var optionsOk = false;
  var serviceStarted = false;
  var serviceStopped = false;

  var Service = function(container, options) {
    containerDefined = !!container;
    optionsDefined = !!options;
    optionsOk = options.test === 'test';
  };

  Service.prototype.start = function() {
    serviceStarted = true;
  };

  Service.prototype.stop = function() {
    serviceStopped = true;
  };

  var test = new Tester(Service, { test: 'test' });

  test.start()
  .then(function() {
    return test.stop();
  })
  .catch(function() {
    t.fail('start/stop error');
    t.end();
  })
  .then(function() {
    t.ok(containerDefined);
    t.ok(optionsDefined);
    t.ok(optionsOk);
    t.ok(serviceStarted);
    t.ok(serviceStopped);
    t.end();
  });
});
