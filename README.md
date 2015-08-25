service-runner
===============
The service-runner manages the architecture and the life-cycle of services through the pattern Service Component Architecture where components are managed and composed by containers (see Developping a MicroService).

Install:
--------
```bash
$ npm install -g @saio/service-runner
```


Using the runner:
-----------------
```bash
# Launching a globally installed service:
$ npm install -g @saio/<service>
$ service-runner @saio/<service> <options>

# Launching a locally installed service:
$ service-runner path/to/<service>.js <options>
```

`<service>` is the name of the service package you want to run (or it's main file). It will be required,
instanciated and ran by service-runner.  
`<options>` are passed to the service constructor as a JSON object.  
They follow the standard unix options syntax and are parsed this way:

```javascript
    -o             => { o: true }
    -o value       => { o: 'value' }
    -o x -o y      => { o: ['x', 'y'] }
    -op            => { o: true, p: true }
    --option       => { option: true }
    --option value => { option: 'value' }
```

Developping a MicroService:
----------------------------
A service is a tree of components (node.js modules) instanciated by containers.
A container manages the life-cycle of a component.
Note that a service is a component.
The only difference is that the service is the root component, it is designed to be launched with service-runner.
Child components are designed to be used by higher level components.
This is just local vocabulary here.

A container instanciates a component and calls its start and stop methods, if provided. It also permits the instanciation of subcomponents via its `use` method, which has the following prototype:

`use ( componentID, ComponentConstructor, options )`

* Arguments:

    `componentID: String`, ID to give to the component instance. This instance will be accessible at `container[componentID]`.  
    `ComponentConstructor: function`, constructor of the component to use  
    `options: Object`, *optional*, options to pass to the component constructor.

* Returns: `ComponentConstructor`, the instance of ComponentConstructor.

---

A component must follow some rules in order to work properly:
* Its `package.json` must contain a `'main'` field
* Its main `module.exports` must be the component constructor
* Its constructor must implement the interface `function( container, options )`
* All calls to `container.use()` must be made in the component constructor.
* It can (but is not restricted to) implement the following interface:

```javascript
Promise/undefined start()
Promise/undefined stop()
```

Component instantiation, start & stop order:
--------------------------------------------
* A component is always started after its subcomponents and always stopped before them.
* Components' start methods are called after all the components are instanciated.
* Components' stop methods are called either after an uncaught exception, an explicit kill (SIGTERM or equivalent) of the service-runner process or when its event loop is empty.

Testing a Component:
----------------------------
In order to unit-test a component, a testing module is provided to mimic service-runner.
However, it doesn't catch posix signals and unhandled exception, you have to stop the tester manually.
You can use it in this way:

```javascript
var MyComponent = require('path/to/myComponent.js');
var Tester = require('@saio/service-runner').Tester;

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
$ cd path/to/service-runner/example
$ npm install
$ service-runner testService.js

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
$ service-runner testService.js -h Bonjour -w le\ monde

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
Install service-runner locally then run `$ npm test`.
