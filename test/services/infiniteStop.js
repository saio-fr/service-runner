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

var Service = function() {
  this.count = 0;
  this.intervalId = null;
};

Service.prototype.start = function() {
  var that = this;
  this.intervalId = setInterval(function() {
    that.work();
  }, 100);
};

Service.prototype.work = function() {
  ++this.count;
};

Service.prototype.stop = function() {
  clearInterval(this.intervalId);
  return when.promise(function(resolve) {
    setTimeout(resolve, 30000);
  });
};

module.exports = Service;
