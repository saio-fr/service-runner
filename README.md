MS-SAIO: SAIO MicroService runner
==================================

Installing & Using the runner:
-------------------------------
You can install ms-saio and any service you want to run from the SAIO private npm registry.

```bash
    $ npm set registry [registry address]
      # or (see https://docs.npmjs.com/misc/scope)
    $ npm config set @saio:registry [registry address]
    $ npm install -g ms-saio
    $ npm install -g <service>
    $ ms-saio <service> <options>
```
`<service>` is the name of the service package you want to run. It will be required, instanciated and run by ms-saio.  
`<options>` are passed to the service constructor as a json object.  
They follow the standard unix options syntax and are parsed in this way:

```javascript
    -o             => { 'o': true }
    -o value       => { 'o': 'value' }
    -o x -o y      => { 'o': ['x', 'y'] }
    -op            => { 'o': true, 'p': true }
    --option       => { 'option': true }
    --option value => { 'option': 'value' }
```

Developping a MicroService:
----------------------------
A service is a tree of components (node.js modules) instanciated by containers. A container manages the life-cycle of a component. A container instanciates a component and calls its start and stop methods, if provided. It also permits the instanciation of subcomponents via its `use` method, which has the following prototype:

`use ( componentID, ComponentConstructor, options )`

* Arguments:

    `componentID: String`, ID to give to the component instance. This instance will be accessible at `container[componentID]`.  
    `ComponentConstructor: function`, constructor of the component to use  
    `options: Object`, *optional*, options to pass to the component constructor.

* Returns: `undefined`

---

A component must follow some rules in order to work properly:
* It must be a class
* The name of its package should be scoped by `@saio/`
* Its `package.json` must contain a `'main'` field
* Its main `module.exports` must be the component constructor
* Its constructor must implement the interface `function( container, options )`
* All calls to `container.use()` must be made in the component constructor.
* It can implement the following interface:

```javascript
    Promise/undefined start()
    Promise/undefined stop()
```

---

A component is always started after its subcomponents and always stopped before them. Components' start methods are called after all the components are instanciated. Components' stop methods are called either after an uncaught exception, an explicit kill of the ms-saio process or when its event loop is empty.

Testing a Component:
---------------------
In order to unit-test a component, a testing module is provided. You can use it this way:

```javascript
    var MyComponent = require('path/to/myComponent.js');
    var Tester = require('@saio/ms-saio/tester.js');

    var tester = new Tester(MyComponent, optionsToPassToMyComponent);

    tester.start()
      .then(function() {
        // some tests
        // ...
        return tester.stop();
      }).then(function() {
        console.log('It Saul Goodman !');
      });
```


MicroService Example:
----------------------
In the example folder there is a TestService component and a TestSubService component. TestService uses TestSubService. The goal of TestService is to print 'Hello world !'  
It accepts the `-h helloValue` and `-w worldValue` options.

To install TestService (& TestSubService) and then run it:

```bash
    $ cd path/to/ms-saio/example
    $ npm install -g .
    $ ms-saio @saio/testService
      # or if you don't want the global install:
    $ ms-saio path/to/ms-saio/example/testService.js
      # stdout:
    Starting TestSubService...
    TestSubService started.
    Starting TestService...
    TestService started.
    Hello world !
    Stopping TestService...
    TestService stopped.
    Stopping TestSubService...
    TestSubService stopped.
```

... and in french:  

```bash
    $ ms-saio @saio/testService -h Bonjour -w le\ monde
      # stdout:
    Starting TestSubService...
    TestSubService started.
    Starting TestService...
    TestService started.
    Bonjour le monde !
    Stopping TestService...
    TestService stopped.
    Stopping TestSubService...
    TestSubService stopped.
```

Testing:
---------
Install ms-saio locally then run `$ npm test` to unit-test the ms-saio container.
