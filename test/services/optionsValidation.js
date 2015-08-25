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

// bash: service-runner syncOptionsSuccess.js --argOpt1 val1 --argOpt2 val2 --noArgOpt -x x -yz
var Service = function(container, options) {
  this.options = options;
  this.success = options.argOpt1 === 'val1' &&
                options.argOpt2 === 'val2' &&
                options.noArgOpt &&
                options.x === 'x' &&
                options.y &&
                options.z;
};

Service.prototype.start = function() {
  if (!this.success) {
    throw new Error('wrong options ' + JSON.stringify(this.options));
  }
};

module.exports = Service;
