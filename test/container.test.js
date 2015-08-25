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

var Container = require('../src/container.js');
var tape = require('blue-tape');
var _ = require('underscore');
var when = require('when');

tape('Container', function(t) {

  var serviceBuilder = {

    // always plan 2 tests in constructors
    constructor: {
      standard: function(test, container, options) {
        this.container = container;
        this.options = options;
        test.ok(!_.isUndefined(this.options), 'defined service options');
        test.equal(this.options.service, 'test', 'right serviceID');
      },

      // bind: errMsg
      broken: function(test, errMsg, container, options) {
        this.container = container;
        this.options = options;
        test.ok(!_.isUndefined(this.options), 'defined service options');
        test.equal(this.options.service, 'test', 'right serviceID');
        throw new Error(errMsg);
      },

      // bind: subServiceID, SubService, subOptions
      using: function(test, subServiceID, SubService, subOptions, container, options) {
        this.container = container;
        this.options = options;
        test.ok(!_.isUndefined(this.options), 'defined service options');
        test.equal(this.options.service, 'test', 'right serviceID');
        this.container.use(subServiceID, SubService, subOptions);
      }
    },

    startStop: {
      standard: function() {
        return when.promise(function(resolve) {
          setTimeout(resolve, 5);
        });
      },

      // bind: errMsg
      broken: function(errMsg) {
        return when.promise(function(resolve, reject) {
          setTimeout(_.bind(reject, null, new Error(errMsg)), 5);
        });
      },

      // bind: serviceID, resultArray
      using: function(serviceID, result) {
        var that = this;

        setTimeout(function() {
          result[0] = that.container[serviceID].add(40, 2);
        }, 20);

        return when.promise(function(resolve) {
          setTimeout(resolve, 5);
        });
      },

      // bind: callback
      notify: function(callback) {
        return when.promise(function(resolve) {
          setTimeout(function() {
            resolve();
            callback();
          }, 5);
        });
      }
    },

    // service method
    add: function(a, b) {
      return a + b;
    }
  };

  t.plan(9);

  t.test('start a valid service with service options and then stop it', function(st) {
    st.plan(3);

    var WorkingService = function(container, options) {
      serviceBuilder.constructor.standard.call(this, st, container, options);
      this.start = serviceBuilder.startStop.standard;
      this.stop = serviceBuilder.startStop.standard;
    };

    var errReceived = false;
    try {
      var container = new Container(WorkingService, {service: 'test'});
      container._start()
      .then(function() {
        return container._stop();
      }).catch(function(err) {
        console.log(err.stack);
        errReceived = true;
      });
    } catch (err) {
      errReceived = true;
    }

    setTimeout(function() {
      st.notOk(errReceived, 'no errors');
      st.end();
    }, 20);
  });

  t.test('start then stop a valid service without start and stop methods', function(st) {
    st.plan(3);

    var WorkingService = function(container, options) {
      serviceBuilder.constructor.standard.call(this, st, container, options);
    };

    var errReceived = false;
    try {
      var container = new Container(WorkingService, {service: 'test'});
      container._start()
        .then(function() {
          return container._stop();
        }).catch(function() {
          errReceived = true;
        });
    } catch (err) {
      errReceived = true;
    }

    setTimeout(function() {
      st.notOk(errReceived, 'no errors');
      st.end();
    }, 20);
  });

  t.test('start a valid service using a valid service and then stop them', function(st) {
    st.plan(6);

    var ChildService = function(container, options) {
      serviceBuilder.constructor.standard.call(this, st, container, options);
      this.start = serviceBuilder.startStop.standard;
      this.stop = serviceBuilder.startStop.standard;
      this.add = serviceBuilder.add;
    };

    var result = [41];

    var MasterService = function(container, options) {
      serviceBuilder.constructor.using.call(this, st, 'childService', ChildService,
        {service: 'test'}, container, options);
      this.start = _.bind(serviceBuilder.startStop.using, this, 'childService', result);
      this.stop = serviceBuilder.startStop.standard;
    };

    var container;
    var errReceived = false;

    var checkResultAndStop = function() {
      st.equal(result[0], 42);
      container._stop()
      .catch(function() {
        errReceived = true;
      })
      .then(function() {
        st.notOk(errReceived);
        st.end();
      });
    };

    try {
      container = new Container(MasterService, {service: 'test'});
      container._start()
        .catch(function() {
          errReceived = true;
        }).then(function() {
          setTimeout(checkResultAndStop, 30);
        });
    } catch (err) {
      errReceived = true;
    }
  });

  t.test('fail to construct a constructor-broken service', function(st) {
    st.plan(4);

    var BrokenService = function(container, options) {
      serviceBuilder.constructor.broken.call(this, st, 'broken', container, options);
      this.start = serviceBuilder.startStop.standard;
      this.stop = serviceBuilder.startStop.standard;
    };

    var errMsg;
    var container;

    try {
      container = new Container(BrokenService, {service: 'test'});
    } catch (err) {
      errMsg = err.message;
    }

    st.ok(_.isUndefined(container));
    st.equal(errMsg, 'broken');
    st.end();
  });

  t.test('fail to construct a valid service using a constructor-broken service', function(st) {
    st.plan(6);

    var result = [41];

    var BrokenService = function(container, options) {
      serviceBuilder.constructor.broken.call(this, st, 'broken', container, options);
      this.start = serviceBuilder.startStop.standard;
      this.stop = serviceBuilder.startStop.standard;
      this.add = serviceBuilder.add;
    };

    var MasterService = function(container, options) {
      serviceBuilder.constructor.using.call(this, st, 'childService', BrokenService,
        {service: 'test'}, container, options);
      this.start = _.bind(serviceBuilder.startStop.using, this, 'childService', result);
      this.stop = serviceBuilder.startStop.standard;
    };

    var container;
    var errMsg;

    try {
      container = new Container(MasterService, {service: 'test'});
    } catch (err) {
      errMsg = err.message;
    }

    st.ok(_.isUndefined(container));
    st.equal(errMsg, 'broken');
    st.end();
  });

  t.test('fail to start a start-broken service', function(st) {
    st.plan(3);

    var BrokenService = function(container, options) {
      serviceBuilder.constructor.standard.call(this, st, container, options);
      this.start = _.bind(serviceBuilder.startStop.broken, this, 'broken');
      this.stop = serviceBuilder.startStop.standard;
    };

    var errMsg;
    var container;
    try {
      container = new Container(BrokenService, {service: 'test'});
      container._start()
      .catch(function(err) {
        errMsg = err.message;
      })
      .finally(function() {
        st.equal(errMsg, 'broken');
        st.end();
      });
    } catch (err) {
      st.fail('constructor error');
      st.end();
    }
  });

  t.test('fail to start a valid service using a start-broken service', function(st) {
    st.plan(5);

    var result = [41];

    var BrokenService = function(container, options) {
      serviceBuilder.constructor.standard.call(this, st, container, options);
      this.start = _.bind(serviceBuilder.startStop.broken, this, 'broken');
      this.stop = serviceBuilder.startStop.standard;
      this.add = serviceBuilder.add;
    };

    var MasterService = function(container, options) {
      serviceBuilder.constructor.using.call(this, st, 'childService', BrokenService,
        {service: 'test'}, container, options);
      this.start = _.bind(serviceBuilder.startStop.using, this, 'childService', result);
      this.stop = serviceBuilder.startStop.standard;
    };

    var container;
    var errMsg;

    try {
      container = new Container(MasterService, {service: 'test'});
      container._start()
      .catch(function(err) {
        errMsg = err.message;
      })
      .finally(function() {
        st.equal(errMsg, 'broken');
        st.end();
      });
    } catch (err) {
      st.fail('constructor error');
      st.end();
    }
  });

  t.test('stop a valid service using a stop-broken service', function(st) {
    st.plan(7);

    var result = [41];
    var stopped = false;

    var BrokenService = function(container, options) {
      serviceBuilder.constructor.standard.call(this, st, container, options);
      this.start = serviceBuilder.startStop.standard;
      this.stop = _.bind(serviceBuilder.startStop.broken, this, 'broken');
      this.add = serviceBuilder.add;
    };

    var MasterService = function(container, options) {
      serviceBuilder.constructor.using.call(this, st, 'childService', BrokenService,
        {service: 'test'}, container, options);
      this.start = _.bind(serviceBuilder.startStop.using, this, 'childService', result);
      this.stop = _.bind(serviceBuilder.startStop.notify, this, function() {
        stopped = true;
      });
    };

    var container;
    var errMsg;

    var checkResultAndStop = function() {
      st.equal(result[0], 42);
      container._stop()
      .catch(function(err) {
        errMsg = err.message;
      }).then(function() {
        st.equal(errMsg, 'broken');
        st.ok(stopped);
        st.end();
      });
    };

    try {
      container = new Container(MasterService, {service: 'test'});
      container._start()
        .catch(function() {
          st.fail('start error');
        }).then(function() {
          setTimeout(checkResultAndStop, 30);
        });
    } catch (err) {
      st.fail('constructor error');
      st.end();
    }
  });

  t.test('fail to stop a stop-broken service using a valid subservice and stop the subservice', function(st) {
    st.plan(7);

    var result = [41];
    var stopped = false;

    var ChildService = function(container, options) {
      serviceBuilder.constructor.standard.call(this, st, container, options);
      this.start = serviceBuilder.startStop.standard;
      this.stop = _.bind(serviceBuilder.startStop.notify, this, function() {
        stopped = true;
      });
      this.add = serviceBuilder.add;
    };

    var BrokenService = function(container, options) {
      serviceBuilder.constructor.using.call(this, st, 'childService', ChildService,
        {service: 'test'}, container, options);
      this.start = _.bind(serviceBuilder.startStop.using, this, 'childService', result);
      this.stop = _.bind(serviceBuilder.startStop.broken, this, 'broken');
    };

    var container;
    var errMsg;
    var checkResultAndStop = function() {
      st.equal(result[0], 42);
      container._stop()
      .catch(function(err) {
        errMsg = err.message;
      }).then(function() {
        st.equal(errMsg, 'broken');
        st.ok(stopped);
        st.end();
      });
    };

    try {
      container = new Container(BrokenService, {service: 'test'});
      container._start()
        .catch(function() {
          st.fail('start error');
        }).then(function() {
          setTimeout(checkResultAndStop, 30);
        });
    } catch (err) {
      st.fail('constructor error');
      st.end();
    }
  });

  t.end();
});
