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

var when = require('when');

var TestSubService = function(container, options) {
  var that = this;

  that.container = container;
  that.hello = options.h ? options.h : 'Hello';
};

TestSubService.prototype.start = function() {
  return when.promise(function(resolve) {
    console.log('Starting TestSubService...');
    setTimeout(function() {
      console.log('TestSubService started.');
      resolve();
    }, 1000);
  });
};

TestSubService.prototype.stop = function() {
  return when.promise(function(resolve) {
    console.log('Stopping TestSubService...');
    setTimeout(function() {
      console.log('TestSubService stopped.');
      resolve();
    }, 1000);
  });
};

TestSubService.prototype.sayHello = function(world) {
  var that = this;

  console.log(that.hello + ' ' + world + ' !');
};

module.exports = TestSubService;
