






















































Extend with JavaScript - Overview - Docs - PocketBase


[![PocketBase logo](/images/logo.svg) Pocket**Base** v0.24.4](/)   Go JavaScript  Clear      [FAQ](/faq)  [Documentation](/docs)   [Introduction](/docs)   [Going to production](going-to-production.md)   [Web APIs reference](api-records.md)    [Extend with
  
 **Go**](go-overview.md) [Extend with
  
 **JavaScript**](js-overview.md) [Go Overview](go-overview.md)  [Go Event hooks](go-event-hooks.md)  [Go Routing](go-routing.md)  [Go Database](go-database.md)  [Go Record operations](go-records.md)  [Go Collection operations](go-collections.md)  [Go Migrations](go-migrations.md)  [Go Jobs scheduling](go-jobs-scheduling.md)  [Go Sending emails](go-sending-emails.md)  [Go Rendering templates](go-rendering-templates.md)  [Go Console commands](go-console-commands.md)  [Go Realtime messaging](go-realtime.md)  [Go Filesystem](go-filesystem.md)  [Go Logging](go-logging.md)  [Go Testing](go-testing.md)  [Go Miscellaneous](go-miscellaneous.md)  [Go Record proxy](go-record-proxy.md)   [JS Overview](js-overview.md)  [JS Event hooks](js-event-hooks.md)  [JS Routing](js-routing.md)  [JS Database](js-database.md)  [JS Record operations](js-records.md)  [JS Collection operations](js-collections.md)  [JS Migrations](js-migrations.md)  [JS Jobs scheduling](js-jobs-scheduling.md)  [JS Sending emails](js-sending-emails.md)  [JS Rendering templates](js-rendering-templates.md)  [JS Console commands](js-console-commands.md)  [JS Sending HTTP requests](js-sending-http-requests.md)  [JS Realtime messaging](js-realtime.md)  [JS Filesystem](js-filesystem.md)  [JS Logging](js-logging.md)  [JS Types reference](/jsvm/index.html)   Extend with JavaScript - Overview Overview 

* [JavaScript engine](#javascript-engine)
  + [Global objects](#global-objects)
* [TypeScript declarations and code completion](#typescript-declarations-and-code-completion)
* [Caveats and limitations](#caveats-and-limitations)
  + [Handlers scope](#handlers-scope)
  + [Relative paths](#relative-paths)
  + [Loading modules](#loading-modules)
  + [Performance](#performance)
  + [Engine limitations](#engine-limitations)
### [JavaScript engine](#javascript-engine)

The prebuilt PocketBase v0.17+ executable comes with embedded ES5 JavaScript engine ([goja](https://github.com/dop251/goja)) which enables you to write custom server-side code using plain JavaScript.

You can start by creating `*.pb.js` file(s) inside a `pb_hooks`
directory next to your executable.

`// pb_hooks/main.pb.js
routerAdd("GET", "/hello/{name}", (e) => {
let name = e.request.pathValue("name")
return e.json(200, { "message": "Hello " + name })
})
onRecordAfterUpdateSuccess((e) => {
console.log("user updated...", e.record.get("email"))
e.next()
}, "users")`

*For convenience, when making changes to the files inside `pb_hooks`, the process will
automatically restart/reload itself (currently supported only on UNIX based platforms). The
`*.pb.js` files are loaded per their filename sort order.*

For most parts, the JavaScript APIs are derived from [Go](go-overview.md) with 2 main differences:

* Go exported method and field names are converted to camelCase, for example:
    
   `app.FindRecordById("example", "RECORD_ID")` becomes
  `$app.findRecordById("example", "RECORD_ID")`.
* Errors are thrown as regular JavaScript exceptions and not returned as Go values.

##### [Global objects](#global-objects)

Below is a list with some of the commonly used global objects that are accessible from everywhere:

* [`__hooks`](/jsvm/variables/__hooks.html)
  - The absolute path to the app `pb_hooks` directory.
* [`$app`](/jsvm/modules/_app.html) - The current running PocketBase application instance.
* [`$apis.*`](/jsvm/modules/_apis.html) - API routing helpers and middlewares.
* [`$os.*`](/jsvm/modules/_os.html) - OS level primitives (deleting directories, executing shell commands, etc.).
* [`$security.*`](/jsvm/modules/_security.html) - Low level helpers for creating and parsing JWTs, random string generation, AES encryption, etc.
* And many more - for all exposed APIs, please refer to the
  [JSVM reference docs](/jsvm/index.html).

### [TypeScript declarations and code completion](#typescript-declarations-and-code-completion)

While you can't use directly TypeScript (*without transpiling it to JS on your own*), PocketBase
comes with builtin **ambient TypeScript declarations** that can help providing information
and documentation about the available global variables, methods and arguments, code completion, etc. as
long as your editor has TypeScript LSP support
*(most editors either have it builtin or available as plugin)*.

The types declarations are stored in
`pb_data/types.d.ts` file. You can point to those declarations using the
[reference triple-slash directive](https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html#-reference-path-)
at the top of your JS file:

`/// <reference path="../pb_data/types.d.ts" />
onBootstrap((e) => {
e.next()
console.log("App initialized!")
})`

If after referencing the types your editor still doesn't perform linting, then you can try to rename your
file to have `.pb.ts` extension.

### [Caveats and limitations](#caveats-and-limitations)

##### [Handlers scope](#handlers-scope)

Each handler function (hook, route, middleware, etc.) is
**serialized and executed in its own isolated context as a separate "program"**. This means
that you don't have access to custom variables and functions declared outside of the handler scope. For
example, the below code will fail:

`const name = "test"
onBootstrap((e) => {
e.next()
console.log(name) // <-- name will be undefined inside the handler
})`

The above serialization and isolation context is also the reason why error stack trace line numbers may
not be accurate.

One possible workaround for sharing/reusing code across different handlers could be to move and export the
reusable code portion as local module and load it with `require()` inside the handler but keep in
mind that the loaded modules use a shared registry and mutations should be avoided when possible to prevent
concurrency issues:

`onBootstrap((e) => {
e.next()
const config = require(`${__hooks}/config.js`)
console.log(config.name)
})`
##### [Relative paths](#relative-paths)

Relative file paths are relative to the current working directory (CWD) and not to the
`pb_hooks`.
  

To get an absolute path to the `pb_hooks` directory you can use the global
`__hooks` variable.

##### [Loading modules](#loading-modules)

 

Please note that the embedded JavaScript engine is not a Node.js or browser environment, meaning
that modules that relies on APIs like *window*, *fs*,
*fetch*, *buffer* or any other runtime specific API not part of the ES5 spec may not
work!

You can load modules either by specifying their local filesystem path or by using their name, which will
automatically search in:

* the current working directory (*affects also relative paths*)
* any `node_modules` directory
* any parent `node_modules` directory, up to the closest `package.json`

Currently only CommonJS (CJS) modules are supported and can be loaded with
`const x = require(...)`.
  

ECMAScript modules (ESM) can be loaded by first precompiling and transforming your dependencies with a bundler
like
[rollup](https://rollupjs.org/),
[webpack](https://webpack.js.org/),
[browserify](https://browserify.org/), etc.

A common usage of local modules is for loading shared helpers or configuration parameters, for example:

`// pb_hooks/utils.js
module.exports = {
hello: (name) => {
console.log("Hello " + name)
}
}`  `// pb_hooks/main.pb.js
onBootstrap((e) => {
e.next()
const utils = require(`${__hooks}/utils.js`)
utils.hello("world")
})`  

Loaded modules use a shared registry and mutations should be avoided when possible to prevent
concurrency issues.

##### [Performance](#performance)

The prebuilt executable comes with a **prewarmed pool of 15 JS runtimes**, which helps
maintaining the handlers execution times on par with the Go equivalent code (see
[benchmarks](https://github.com/pocketbase/benchmarks/blob/master/results/hetzner_cax11.md#go-vs-js-route-execution)). You can adjust the pool size manually with the `--hooksPool=50` flag (*increasing the pool size may improve the performance in high concurrent scenarios but also will
increase the memory usage*).

Note that the handlers performance may degrade if you have heavy computational tasks in pure JavaScript
(encryption, random generators, etc.). For such cases prefer using the exposed [Go bindings](/jsvm/index.html)
(e.g. `$security.randomString(10)`).

##### [Engine limitations](#engine-limitations)

We inherit some of the limitations and caveats of the embedded JavaScript engine
([goja](https://github.com/dop251/goja)):

* Has most of ES6 functionality already implemented but it is not fully spec compliant yet.
* No concurrent execution inside a single handler (aka. no `setTimeout`/`setInterval`).
* Wrapped Go structural types (such as maps, slices) comes with some peculiarities and do not behave the
  exact same way as native ECMAScript values (for more details see
  [goja ToValue](https://pkg.go.dev/github.com/dop251/goja#Runtime.ToValue)).
* In relation to the above, DB `json` field values require the use of `get()` and
  `set()` helpers (*this may change in the future*).
 

---

  [Next: Event hooks](js-event-hooks.md)  [FAQ](/faq) [Discussions](https://github.com/pocketbase/pocketbase/discussions) [Documentation](/docs) [JavaScript SDK](https://github.com/pocketbase/js-sdk) [Dart SDK](https://github.com/pocketbase/dart-sdk) Pocket**Base**   © 2023-2025 Pocket**Base** The Gopher artwork is from
[marcusolsson/gophers](https://github.com/marcusolsson/gophers)  Crafted by [**Gani**](https://gani.bg)   
