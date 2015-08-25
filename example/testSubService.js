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
  this.container = container;
  this.hello = options.h ? options.h : 'Hello';
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
  console.log(this.hello + ' ' + world + ' !');
};

module.exports = TestSubService;
