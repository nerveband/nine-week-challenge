























































Extend with Go - Logging - Docs - PocketBase


[![PocketBase logo](/images/logo.svg) Pocket**Base** v0.24.4](/)   Go JavaScript  Clear      [FAQ](/faq)  [Documentation](/docs)   [Introduction](/docs)   [Going to production](going-to-production.md)   [Web APIs reference](api-records.md)    [Extend with
  
 **Go**](go-overview.md) [Extend with
  
 **JavaScript**](js-overview.md) [Go Overview](go-overview.md)  [Go Event hooks](go-event-hooks.md)  [Go Routing](go-routing.md)  [Go Database](go-database.md)  [Go Record operations](go-records.md)  [Go Collection operations](go-collections.md)  [Go Migrations](go-migrations.md)  [Go Jobs scheduling](go-jobs-scheduling.md)  [Go Sending emails](go-sending-emails.md)  [Go Rendering templates](go-rendering-templates.md)  [Go Console commands](go-console-commands.md)  [Go Realtime messaging](go-realtime.md)  [Go Filesystem](go-filesystem.md)  [Go Logging](go-logging.md)  [Go Testing](go-testing.md)  [Go Miscellaneous](go-miscellaneous.md)  [Go Record proxy](go-record-proxy.md)   [JS Overview](js-overview.md)  [JS Event hooks](js-event-hooks.md)  [JS Routing](js-routing.md)  [JS Database](js-database.md)  [JS Record operations](js-records.md)  [JS Collection operations](js-collections.md)  [JS Migrations](js-migrations.md)  [JS Jobs scheduling](js-jobs-scheduling.md)  [JS Sending emails](js-sending-emails.md)  [JS Rendering templates](js-rendering-templates.md)  [JS Console commands](js-console-commands.md)  [JS Sending HTTP requests](js-sending-http-requests.md)  [JS Realtime messaging](js-realtime.md)  [JS Filesystem](js-filesystem.md)  [JS Logging](js-logging.md)  [JS Types reference](/jsvm/index.html)   Extend with Go - Logging Logging

`app.Logger()` provides access to a standard `slog.Logger` implementation that
writes any logs into the database so that they can be later explored from the PocketBase
*Dashboard > Logs* section.

 

For better performance and to minimize blocking on hot paths, logs are written with debounce and
on batches:

* 3 seconds after the last debounced log write
* when the batch threshold is reached (currently 200)
* right before app termination to attempt saving everything from the existing logs queue
 

* [Log methods](#log-methods)
  + [Debug(message, attrs...)](#debugmessage-attrs-)
  + [Info(message, attrs...)](#infomessage-attrs-)
  + [Warn(message, attrs...)](#warnmessage-attrs-)
  + [Error(message, attrs...)](#errormessage-attrs-)
  + [With(attrs...)](#withattrs-)
  + [WithGroup(name)](#withgroupname)
* [Logs settings](#logs-settings)
### [Log methods](#log-methods)

All standard
[`slog.Logger`](https://pkg.go.dev/log/slog)
methods are available but below is a list with some of the most notable ones.

##### [Debug(message, attrs...)](#debugmessage-attrs-)

`app.Logger().Debug("Debug message!")
app.Logger().Debug(
"Debug message with attributes!",
"name", "John Doe",
"id", 123,
)`
##### [Info(message, attrs...)](#infomessage-attrs-)

`app.Logger().Info("Info message!")
app.Logger().Info(
"Info message with attributes!",
"name", "John Doe",
"id", 123,
)`
##### [Warn(message, attrs...)](#warnmessage-attrs-)

`app.Logger().Warn("Warning message!")
app.Logger().Warn(
"Warning message with attributes!",
"name", "John Doe",
"id", 123,
)`
##### [Error(message, attrs...)](#errormessage-attrs-)

`app.Logger().Error("Error message!")
app.Logger().Error(
"Error message with attributes!",
"id", 123,
"error", err,
)`
##### [With(attrs...)](#withattrs-)

`With(atrs...)` creates a new local logger that will "inject" the specified attributes with each
following log.

`l := app.Logger().With("total", 123)
// results in log with data {"total": 123}
l.Info("message A")
// results in log with data {"total": 123, "name": "john"}
l.Info("message B", "name", "john")`
##### [WithGroup(name)](#withgroupname)

`WithGroup(name)` creates a new local logger that wraps all logs attributes under the specified
group name.

`l := app.Logger().WithGroup("sub")
// results in log with data {"sub": { "total": 123 }}
l.Info("message A", "total", 123)`
### [Logs settings](#logs-settings)

You can control various log settings like logs retention period, minimal log level, request IP logging,
etc. from the logs settings panel:

![Logs settings screenshot](/images/screenshots/logs.png) 

---

  [Prev: Filesystem](go-filesystem.md) [Next: Testing](go-testing.md)  [FAQ](/faq) [Discussions](https://github.com/pocketbase/pocketbase/discussions) [Documentation](/docs) [JavaScript SDK](https://github.com/pocketbase/js-sdk) [Dart SDK](https://github.com/pocketbase/dart-sdk) Pocket**Base**   © 2023-2025 Pocket**Base** The Gopher artwork is from
[marcusolsson/gophers](https://github.com/marcusolsson/gophers)  Crafted by [**Gani**](https://gani.bg)   
