























































Extend with JavaScript - Routing - Docs - PocketBase


[![PocketBase logo](/images/logo.svg) Pocket**Base** v0.24.4](/)   Go JavaScript  Clear      [FAQ](/faq)  [Documentation](/docs)   [Introduction](/docs)   [Going to production](../going-to-production.md)   [Web APIs reference](../api-records.md)    [Extend with
  
 **Go**](../go-overview.md) [Extend with
  
 **JavaScript**](../js-overview.md) [Go Overview](../go-overview.md)  [Go Event hooks](../go-event-hooks.md)  [Go Routing](../go-routing.md)  [Go Database](../go-database.md)  [Go Record operations](../go-records.md)  [Go Collection operations](../go-collections.md)  [Go Migrations](../go-migrations.md)  [Go Jobs scheduling](../go-jobs-scheduling.md)  [Go Sending emails](../go-sending-emails.md)  [Go Rendering templates](../go-rendering-templates.md)  [Go Console commands](../go-console-commands.md)  [Go Realtime messaging](../go-realtime.md)  [Go Filesystem](../go-filesystem.md)  [Go Logging](../go-logging.md)  [Go Testing](../go-testing.md)  [Go Miscellaneous](../go-miscellaneous.md)  [Go Record proxy](../go-record-proxy.md)   [JS Overview](../js-overview.md)  [JS Event hooks](../js-event-hooks.md)  [JS Routing](../js-routing.md)  [JS Database](../js-database.md)  [JS Record operations](../js-records.md)  [JS Collection operations](../js-collections.md)  [JS Migrations](../js-migrations.md)  [JS Jobs scheduling](../js-jobs-scheduling.md)  [JS Sending emails](../js-sending-emails.md)  [JS Rendering templates](../js-rendering-templates.md)  [JS Console commands](../js-console-commands.md)  [JS Sending HTTP requests](../js-sending-http-requests.md)  [JS Realtime messaging](../js-realtime.md)  [JS Filesystem](../js-filesystem.md)  [JS Logging](../js-logging.md)  [JS Types reference](/jsvm/index.html)   Extend with JavaScript - Routing Routing

You can register custom routes and middlewares by using the top-level
[`routerAdd()`](/jsvm/functions/routerAdd.html)
and
[`routerUse()`](/jsvm/functions/routerUse.html)
functions.

* [Routes](#routes)
  + [Registering new routes](#registering-new-routes)
  + [Path parameters and matching rules](#path-parameters-and-matching-rules)
  + [Reading path parameters](#reading-path-parameters)
  + [Retrieving the current auth state](#retrieving-the-current-auth-state)
  + [Reading query parameters](#reading-query-parameters)
  + [Reading request headers](#reading-request-headers)
  + [Writing response headers](#writing-response-headers)
  + [Retrieving uploaded files](#retrieving-uploaded-files)
  + [Reading request body](#reading-request-body)
  + [Writing response body](#writing-response-body)
  + [Reading the client IP](#reading-the-client-ip)
  + [Request store](#request-store)
* [Middlewares](#middlewares)
  + [Registering middlewares](#registering-middlewares)
  + [Builtin middlewares](#builtin-middlewares)
  + [Default globally registered middlewares](#default-globally-registered-middlewares)
* [Error response](#error-response)
* [Helpers](#helpers)
  + [Serving static directory](#serving-static-directory)
  + [Auth response](#auth-response)
  + [Enrich record(s)](#enrich-records)
* [Sending request to custom routes using the SDKs](#sending-request-to-custom-routes-using-the-sdks)
### [Routes](#routes)

##### [Registering new routes](#registering-new-routes)

Every route have a path, handler function and eventually middlewares attached to it. For example:

`// register "GET /hello/{name}" route (allowed for everyone)
routerAdd("GET", "/hello/{name}", (e) => {
let name = e.request.pathValue("name")
return e.json(200, { "message": "Hello " + name })
})
// register "POST /api/myapp/settings" route (allowed only for authenticated users)
routerAdd("POST", "/api/myapp/settings", (e) => {
// do something ...
return e.json(http.StatusOK, {"success": true})
}, $apis.requireAuth())`
##### [Path parameters and matching rules](#path-parameters-and-matching-rules)

Because PocketBase routing is based on top of the Go standard router mux, we follow the same pattern
matching rules. Below you could find a short overview but for more details please refer to
[`net/http.ServeMux`](https://pkg.go.dev/net/http#ServeMux).

In general, a route pattern looks like `[METHOD ][HOST]/[PATH]`.

Route paths can include parameters in the format `{paramName}`.
  

You can also use `{paramName...}` format to specify a parameter that target more than one path
segment.

A pattern ending with a trailing slash `/` acts as anonymous wildcard and matches any requests
that begins with the defined route. If you want to have a trailing slash but to indicate the end of the
URL then you need to end the path with the special
`{$}` parameter.

 

If your route path starts with `/api/`
consider combining it with your unique app name like `/api/myapp/...` to avoid collisions
with system routes.

Here are some examples:

`// match "GET example.com/index.html"
routerAdd("GET", "example.com/index.html", ...)
// match "GET /index.html" (for any host)
routerAdd("GET", "/index.html", ...)
// match "GET /static/", "GET /static/a/b/c", etc.
routerAdd("GET", "/static/", ...)
// match "GET /static/", "GET /static/a/b/c", etc.
// (similar to the above but with a named wildcard parameter)
routerAdd("GET", "/static/{path...}", ...)
// match only "GET /static/" (if no "/static" is registered, it is 301 redirected)
routerAdd("GET", "/static/{$}", ...)
// match "GET /customers/john", "GET /customer/jane", etc.
routerAdd("GET", "/customers/{name}", ...)` 

---

 

In the following examples `e` is usually
[`core.RequestEvent`](/jsvm/interfaces/core.RequestEvent.html) value.

 

---

##### [Reading path parameters](#reading-path-parameters)

`let id = e.request.pathValue("id")`
##### [Retrieving the current auth state](#retrieving-the-current-auth-state)

The request auth state can be accessed (or set) via the `RequestEvent.auth` field.

`let authRecord = e.auth
let isGuest = !e.auth
// the same as "e.auth?.isSuperuser()"
let isSuperuser = e.hasSuperuserAuth()`

Alternatively you could also access the request data from the summarized request info instance
*(usually used in hooks like the `onRecordEnrich` where there is no direct access to the request)*.

`let info = e.requestInfo()
let authRecord = info.auth
let isGuest = !info.auth
// the same as "info.auth?.isSuperuser()"
let isSuperuser = info.hasSuperuserAuth()`
##### [Reading query parameters](#reading-query-parameters)

`let search = e.request.url.query().get("search")
// or via the parsed request info
let search = e.requestInfo().query["search"]`
##### [Reading request headers](#reading-request-headers)

`let token = e.request.header.get("Some-Header")
// or via the parsed request info
// (the header value is always normalized per the @request.headers.* API rules format)
let token = e.requestInfo().headers["some_header"]`
##### [Writing response headers](#writing-response-headers)

`e.response.header().set("Some-Header", "123")`
##### [Retrieving uploaded files](#retrieving-uploaded-files)

`// retrieve the uploaded files and parse the found multipart data into a ready-to-use []*filesystem.File
let files = e.findUploadedFiles("document")
// or retrieve the raw single multipart/form-data file and header
let [mf, mh] = e.request.formFile("document")`
##### [Reading request body](#reading-request-body)

Body parameters can be read either via
[`e.bindBody`](/jsvm/interfaces/core.RequestEvent.html#bindBody)
OR through the parsed request info.

`// read the body via the parsed request object
let body = e.requestInfo().body
console.log(body.title)
// read/scan the request body fields into a typed object
const data = new DynamicModel({
// describe the fields to read (used also as initial values)
someTextField: "",
someIntValue: 0,
someFloatValue: -0,
someBoolField: false,
someArrayField: [],
someObjectField: {}, // object props are accessible via .get(key)
})
e.bindBody(data)
console.log(data.sometextField)`
##### [Writing response body](#writing-response-body)

`// send response with JSON body
e.json(200, {"name": "John"})
// send response with string body
e.string(200, "Lorem ipsum...")
// send response with HTML body
// (check also the "Rendering templates" section)
e.html(200, "<h1>Hello!</h1>")
// redirect
e.redirect(307, "https://example.com")
// send response with no body
e.noContent(204)
// serve a single file
e.fileFS($os.dirFS("..."), "example.txt")
// stream the specified reader
e.stream(200, "application/octet-stream", reader)
// send response with blob (bytes array) body
e.blob(200, "application/octet-stream", [ ... ])`
##### [Reading the client IP](#reading-the-client-ip)

`// The IP of the last client connecting to your server.
// The returned IP is safe and can be always trusted.
// When behind a reverse proxy (e.g. nginx) this method returns the IP of the proxy.
// (/jsvm/interfaces/core.RequestEvent.html#remoteIP)
let ip = e.remoteIP()
// The "real" IP of the client based on the configured Settings.trustedProxy header(s).
// If such headers are not set, it fallbacks to e.remoteIP().
// (/jsvm/interfaces/core.RequestEvent.html#realIP)
let ip = e.realIP()`
##### [Request store](#request-store)

The `core.RequestEvent` comes with a local store that you can use to share custom data between
[middlewares](#middlewares) and the route action.

`// store for the duration of the request
e.set("someKey", 123)
// retrieve later
let val = e.get("someKey") // 123`
### [Middlewares](#middlewares)

Middlewares allow inspecting, intercepting and filtering route requests.
  

Middlewares can be registered both to a single route (by passing them after the handler) and globally usually
by using `routerUse(middleware)`.

##### [Registering middlewares](#registering-middlewares)

Here is a minimal example of a what global middleware looks like:

`// register a global middleware
routerUse((e) => {
if (e.request.header.get("Something") == "") {
throw new BadRequestError("Something header value is missing!")
}
return e.next()
})`

Middleware can be either registered as simple functions (`function(e){}` ) or if you want
to specify a custom priority and id - as a
[`Middleware`](/jsvm/classes/Middleware.html)
class instance.

Below is a slightly more advanced example showing all options and the execution sequence:

`// attach global middleware
routerUse((e) => {
console.log(1)
return e.next()
})
// attach global middleware with a custom priority
routerUse(new Middleware((e) => {
console.log(2)
return e.next()
}, -1))
// attach middleware to a single route
//
// "GET /hello" should print the sequence: 2,1,3,4
routerUse("GET", "/hello", (e) => {
console.log(4)
return e.string(200, "Hello!")
}, (e) => {
console.log(3)
return e.next()
})`
##### [Builtin middlewares](#builtin-middlewares)

The global
[`$apis.*`](/jsvm/modules/_apis.html)
object exposes several middlewares that you can use as part of your application.

`// Require the request client to be unauthenticated (aka. guest).
$apis.requireGuestOnly()
// Require the request client to be authenticated
// (optionally specify a list of allowed auth collection names, default to any).
$apis.requireAuth(optCollectionNames...)
// Require the request client to be authenticated as superuser
// (this is an alias for $apis.requireAuth("_superusers")).
$apis.requireSuperuserAuth()
// Require the request client to be authenticated as superuser OR
// regular auth record with id matching the specified route parameter (default to "id").
$apis.requireSuperuserOrOwnerAuth(ownerIdParam)
// Changes the global 32MB default request body size limit (set it to 0 for no limit).
// Note that system record routes have dynamic body size limit based on their collection field types.
$apis.bodyLimit(limitBytes)
// Compresses the HTTP response using Gzip compression scheme.
$apis.gzip()
// Instructs the activity logger to log only requests that have failed/returned an error.
$apis.skipSuccessActivityLog()`
##### [Default globally registered middlewares](#default-globally-registered-middlewares)

The below list is mostly useful for users that may want to plug their own custom middlewares before/after
the priority of the default global ones, for example: registering a custom auth loader before the rate
limiter with `-1001` so that the rate limit can be applied properly based on the loaded auth state.

All PocketBase applications have the below internal middlewares registered out of the box (*sorted by their priority*):
  


* **WWW redirect** (id: pbWWWRedirect, priority: -99999)   
   *Performs www -> non-www redirect(s) if the request host matches with one of the values in
  certificate host policy.*
* **CORS** (id: pbCors, priority: -1041)   
   *By default all origins are allowed (PocketBase is stateless and doesn't rely on cookies) but this
  can be configured with the `--origins` flag.*
* **Activity logger** (id: pbActivityLogger, priority: -1040)   
   *Saves request information into the logs auxiliary database.*
* **Auto panic recover** (id: pbPanicRecover, priority: -1030)   
   *Default panic-recover handler.*
* **Auth token loader** (id: pbLoadAuthToken, priority: -1020)   
   *Loads the auth token from the `Authorization` header and populates the related auth
  record into the request event (aka. `e.Auth`).*
* **Security response headers** (id: pbSecurityHeaders, priority: -1010)   
   *Adds default common security headers (`X-XSS-Protection`,
  `X-Content-Type-Options`,
  `X-Frame-Options`) to the response (can be overwritten by other middlewares or from
  inside the route action).*
* **Rate limit** (id: pbRateLimit, priority: -1000)   
   *Rate limits client requests based on the configured app settings (it does nothing if the rate
  limit option is not enabled).*
* **Body limit** (id: pbBodyLimit, priority: -990)   
   *Applies a default max ~32MB request body limit for all custom routes ( system record routes have
  dynamic body size limit based on their collection field types). Can be overwritten on group/route
  level by simply rebinding the `apis.BodyLimit(limitBytes)` middleware.*

### [Error response](#error-response)

PocketBase has a global error handler and every returned or thrown `Error` from a route or
middleware will be safely converted by default to a generic API error to avoid accidentally leaking
sensitive information (the original error will be visible only in the *Dashboard > Logs* or when in
`--dev` mode).

To make it easier returning formatted json error responses, PocketBase provides
`ApiError` constructor that can be instantiated directly or using the builtin factories.
  
 `ApiError.data` will be returned in the response only if it is a map of
`ValidationError` items.

`// construct ApiError with custom status code and validation data error
throw new ApiError(500, "something went wrong", {
"title": new ValidationError("invalid_title", "Invalid or missing title"),
})
// if message is empty string, a default one will be set
throw new BadRequestError(optMessage, optData) // 400 ApiError
throw new UnauthorizedError(optMessage, optData) // 401 ApiError
throw new ForbiddenError(optMessage, optData) // 403 ApiError
throw new NotFoundError(optMessage, optData) // 404 ApiError
throw new TooManyrequestsError(optMessage, optData) // 429 ApiError
throw new InternalServerError(optMessage, optData) // 500 ApiError`
### [Helpers](#helpers)

##### [Serving static directory](#serving-static-directory)

[`$apis.static()`](/jsvm/functions/_apis.static.html)
serves static directory content from `fs.FS` instance.

Expects the route to have a `{path...}` wildcard parameter.

`// serves static files from the provided dir (if exists)
routerAdd("GET", "/{path...}", $apis.static($os.dirFS("/path/to/public"), false))`
##### [Auth response](#auth-response)

[`$apis.recordAuthResponse()`](/jsvm/functions/_apis.recordAuthResponse.html)
writes standardized JSON record auth response (aka. token + record data) into the specified request body. Could
be used as a return result from a custom auth route.

`routerAdd("POST", "/phone-login", (e) => {
const data = new DynamicModel({
phone: "",
password: "",
})
e.bindBody(data)
let record = e.app.findFirstRecordByData("users", "phone", data.phone)
if !record.validatePassword(data.password) {
// return generic 400 error as a basic enumeration protection
throw new BadRequestError("Invalid credentials")
}
return $apis.recordAuthResponse(e, record, "phone")
})`
##### [Enrich record(s)](#enrich-records)

[`$apis.enrichRecord()`](/jsvm/functions/_apis.enrichRecord.html)
and
[`$apis.enrichRecords()`](/jsvm/functions/_apis.enrichRecords.html)
helpers parses the request context and enrich the provided record(s) by:

* expands relations (if `defaultExpands` and/or `?expand` query parameter is set)
* ensures that the emails of the auth record and its expanded auth relations are visible only for the
  current logged admin, record owner or record with manage access

These helpers are also responsible for triggering the `onRecordEnrich` hook events.

`routerAdd("GET", "/custom-article", (e) => {
let records = e.app.findRecordsByFilter("article", "status = 'active'", "-created", 40, 0)
// enrich the records with the "categories" relation as default expand
$apis.enrichRecords(e, records, "categories")
return e.JSON(http.StatusOK, records)
})`
### [Sending request to custom routes using the SDKs](#sending-request-to-custom-routes-using-the-sdks)

The official PocketBase SDKs expose the internal `send()` method that could be used to send requests
to your custom route(s).

JavaScript Dart  `import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');
await pb.send("/hello", {
// for other options check
// https://developer.mozilla.org/en-US/docs/Web/API/fetch#options
query: { "abc": 123 },
});` `import 'package:pocketbase/pocketbase.dart';
final pb = PocketBase('http://127.0.0.1:8090');
await pb.send("/hello", query: { "abc": 123 })`  

---

  [Prev: Event hooks](../js-event-hooks.md) [Next: Database](../js-database.md)  [FAQ](/faq) [Discussions](https://github.com/pocketbase/pocketbase/discussions) [Documentation](/docs) [JavaScript SDK](https://github.com/pocketbase/js-sdk) [Dart SDK](https://github.com/pocketbase/dart-sdk) Pocket**Base**   © 2023-2025 Pocket**Base** The Gopher artwork is from
[marcusolsson/gophers](https://github.com/marcusolsson/gophers)  Crafted by [**Gani**](https://gani.bg)   
