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
var _ = require('underscore');

var Container = function(ServiceConstructor, serviceOptions) {

  if (!_.isFunction(ServiceConstructor)) {
    throw new Error('invalid service constructor');
  }

  this._subContainers = {};
  this._service = new ServiceConstructor(this, serviceOptions);
};

Container.prototype._start = function() {
  var subContainers = this._subContainers;
  var service = this._service;

  var subStartPromises = _.map(subContainers, function(container) {
    if (_.isFunction(container._start)) {
      return when.try(_.bind(container._start, container));
    }
    return when.resolve();
  });

  return when.all(subStartPromises)
    .then(function() {
      if (_.isFunction(service.start)) {
        return when.try(_.bind(service.start, service));
      }
      return when.resolve();
    });
};

Container.prototype._stop = function() {
  var that = this;
  var service = this._service;
  var stopPromise = _.isFunction(service.stop) ? when.try(_.bind(service.stop, service)) : when.resolve();
  var mainError;
  var subError;

  // if service.stop() fails (=> mainError), we still want to stop subservices
  // but we don't care about subComponent.stop() errors (ie reject with mainError)
  return stopPromise
  .catch(function(err) {
    mainError = err;
    return when.resolve();
  })

  // get sub containers' stop promises
  .then(function() {
    var subContainers = that._subContainers;
    var subStopPromises = _.map(subContainers, function(container) {
      if (_.isFunction(container._stop)) {
        return when.try(_.bind(container._stop, container));
      }
      return when.resolve();
    });

    // when.settle() useful to wait all stop promises to settle
    // because when.all or when.map would directly reject after a promise rejection
    // and we don't want to exit the process before all promises have settled
    return when.settle(subStopPromises).then(_.bind(when.all, when, subStopPromises));
  })
  .catch(function(err) {
    subError = err;
    return when.resolve();
  })
  .then(function() {
    if (!_.isUndefined(mainError)) {
      return when.reject(mainError);
    }
    return _.isUndefined(subError) ? when.resolve() : when.reject(subError);
  });
};

Container.prototype.use = function(serviceID, SubServiceConstructor, subServiceOptions) {
  var that = this;
  var subContainer;

  if (!_.isString(serviceID)) {
    throw new Error('serviceID must be a string');
  }
  if (!_.isFunction(SubServiceConstructor)) {
    throw new Error('invalid service constructor');
  }
  if (!_.isUndefined(this[serviceID])) {
    throw new Error('serviceID is already used');
  }

  subContainer = new Container(SubServiceConstructor, subServiceOptions);
  this._subContainers[serviceID] = subContainer;

  Object.defineProperty(that, serviceID, {
    get: function() {
      return subContainer._service;
    },
    enumerable: true
  });

  return subContainer._service;
};

module.exports = Container;
