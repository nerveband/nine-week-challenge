





















































Introduction - Extending PocketBase - Docs - PocketBase


[![PocketBase logo](/images/logo.svg) Pocket**Base** v0.24.4](/)   Go JavaScript  Clear      [FAQ](/faq)  [Documentation](/docs)   [Introduction](/docs)  [├ How to use PocketBase](how-to-use.md) [├ Collections](collections.md) [├ API rules and filters](api-rules-and-filters.md) [├ Authentication](authentication.md) [├ Files upload and handling](files-handling.md) [├ Working with relations](working-with-relations.md) [└ Extending PocketBase](use-as-framework.md)  [Going to production](going-to-production.md)   [Web APIs reference](api-records.md)    [Extend with
  
 **Go**](go-overview.md) [Extend with
  
 **JavaScript**](js-overview.md) [Go Overview](go-overview.md)  [Go Event hooks](go-event-hooks.md)  [Go Routing](go-routing.md)  [Go Database](go-database.md)  [Go Record operations](go-records.md)  [Go Collection operations](go-collections.md)  [Go Migrations](go-migrations.md)  [Go Jobs scheduling](go-jobs-scheduling.md)  [Go Sending emails](go-sending-emails.md)  [Go Rendering templates](go-rendering-templates.md)  [Go Console commands](go-console-commands.md)  [Go Realtime messaging](go-realtime.md)  [Go Filesystem](go-filesystem.md)  [Go Logging](go-logging.md)  [Go Testing](go-testing.md)  [Go Miscellaneous](go-miscellaneous.md)  [Go Record proxy](go-record-proxy.md)   [JS Overview](js-overview.md)  [JS Event hooks](js-event-hooks.md)  [JS Routing](js-routing.md)  [JS Database](js-database.md)  [JS Record operations](js-records.md)  [JS Collection operations](js-collections.md)  [JS Migrations](js-migrations.md)  [JS Jobs scheduling](js-jobs-scheduling.md)  [JS Sending emails](js-sending-emails.md)  [JS Rendering templates](js-rendering-templates.md)  [JS Console commands](js-console-commands.md)  [JS Sending HTTP requests](js-sending-http-requests.md)  [JS Realtime messaging](js-realtime.md)  [JS Filesystem](js-filesystem.md)  [JS Logging](js-logging.md)  [JS Types reference](/jsvm/index.html)   Introduction - Extending PocketBase Extending PocketBase

One of the main feature of PocketBase is that
**it can be used as a framework** which enables you to write your own custom app business
logic in
[Go](go-overview.md) or [JavaScript](js-overview.md) and still have a portable
backend at the end.

**Choose [Extend with Go](go-overview.md) if you are already familiar
with the language or have the time to learn it.**
As the primary PocketBase language, the Go APIs are better documented and you'll be able to integrate with
any 3rd party Go library since you'll have more control over the application flow. The only drawback is that
the Go APIs are slightly more verbose and it may require some time to get used to, especially if this is your
first time working with Go.

**Choose [Extend with JavaScript](js-overview.md)
if you don't intend to write too much custom code and want a quick way to explore the PocketBase capabilities.**
The embedded JavaScript engine is a pluggable wrapper around the existing Go APIs, so most of the time the
slight performance penalty will be negligible because it'll invoke the Go functions under the hood.
  

As a bonus, because the JS VM mirrors the Go APIs, you would be able migrate gradually without much code changes
from JS -> Go at later stage in case you hit a bottleneck or want more control over the execution flow.

With both Go and JavaScript, you can:

* **Register custom routes:** Go JavaScript  `app.OnServe().BindFunc(func(se *core.ServeEvent) error {
  se.Router.GET("/hello", func(e *core.RequestEvent) error {
  return e.String(http.StatusOK, "Hello world!")
  })
  return se.Next()
  })` `routerAdd("GET", "/hello", (e) => {
  return e.string(200, "Hello world!")
  })`
* **Bind to event hooks and intercept responses:** Go JavaScript  `app.OnRecordCreateRequest("posts").BindFunc(func(e *core.RecordRequestEvent) error {
  // if not superuser, overwrite the newly submitted "posts" record status to pending
  if !e.HasSuperuserAuth() {
  e.Record.Set("status", "pending")
  }
  return e.Next()
  })` `onRecordCreateRequest((e) => {
  // if not superuser, overwrite the newly submitted "posts" record status to pending
  if (!e.hasSuperuserAuth()) {
  e.record.set("status", "pending")
  }
  e.next()
  }, "posts")`
* **Register custom console commands:** Go JavaScript  `app.RootCmd.AddCommand(&cobra.Command{
  Use: "hello",
  Run: func(cmd *cobra.Command, args []string) {
  print("Hello world!")
  },
  })` `$app.rootCmd.addCommand(new Command({
  use: "hello",
  run: (cmd, args) => {
  console.log("Hello world!")
  },
  }))`
* and many more...

For further info, please check the related [Extend with Go](go-overview.md) or
[Extend with JavaScript](js-overview.md) guides.

 

---

  [Prev: Working with relations](working-with-relations.md)  [FAQ](/faq) [Discussions](https://github.com/pocketbase/pocketbase/discussions) [Documentation](/docs) [JavaScript SDK](https://github.com/pocketbase/js-sdk) [Dart SDK](https://github.com/pocketbase/dart-sdk) Pocket**Base**   © 2023-2025 Pocket**Base** The Gopher artwork is from
[marcusolsson/gophers](https://github.com/marcusolsson/gophers)  Crafted by [**Gani**](https://gani.bg)   
