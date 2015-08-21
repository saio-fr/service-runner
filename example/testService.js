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
var TestSubService = require('./testSubService.js');

var TestService = function(container, options) {
  var that = this;

  that.container = container;
  that.hello = options.h ? options.h : 'Hello';
  that.world = options.w ? options.w : 'world';

  container.use('testsubservice', TestSubService, { h: that.hello});
};

TestService.prototype.start = function() {
  var that = this;

  return when.promise(function(resolve) {
    console.log('Starting TestService...');
    setTimeout(function() {
      console.log('TestService started.');
      resolve();
    }, 1000);
    setTimeout(function() {
      that.container.testsubservice.sayHello(that.world);
    }, 2000);
  });
};

TestService.prototype.stop = function() {
  return when.promise(function(resolve) {
    console.log('Stopping TestService...');
    setTimeout(function() {
      console.log('TestService stopped.');
      resolve();
    }, 1000);
  });
};

module.exports = TestService;
