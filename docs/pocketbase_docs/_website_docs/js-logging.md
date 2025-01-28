























































Extend with JavaScript - Logging - Docs - PocketBase


[![PocketBase logo](/images/logo.svg) Pocket**Base** v0.24.4](/)   Go JavaScript  Clear      [FAQ](/faq)  [Documentation](/docs)   [Introduction](/docs)   [Going to production](going-to-production.md)   [Web APIs reference](api-records.md)    [Extend with
  
 **Go**](go-overview.md) [Extend with
  
 **JavaScript**](js-overview.md) [Go Overview](go-overview.md)  [Go Event hooks](go-event-hooks.md)  [Go Routing](go-routing.md)  [Go Database](go-database.md)  [Go Record operations](go-records.md)  [Go Collection operations](go-collections.md)  [Go Migrations](go-migrations.md)  [Go Jobs scheduling](go-jobs-scheduling.md)  [Go Sending emails](go-sending-emails.md)  [Go Rendering templates](go-rendering-templates.md)  [Go Console commands](go-console-commands.md)  [Go Realtime messaging](go-realtime.md)  [Go Filesystem](go-filesystem.md)  [Go Logging](go-logging.md)  [Go Testing](go-testing.md)  [Go Miscellaneous](go-miscellaneous.md)  [Go Record proxy](go-record-proxy.md)   [JS Overview](js-overview.md)  [JS Event hooks](js-event-hooks.md)  [JS Routing](js-routing.md)  [JS Database](js-database.md)  [JS Record operations](js-records.md)  [JS Collection operations](js-collections.md)  [JS Migrations](js-migrations.md)  [JS Jobs scheduling](js-jobs-scheduling.md)  [JS Sending emails](js-sending-emails.md)  [JS Rendering templates](js-rendering-templates.md)  [JS Console commands](js-console-commands.md)  [JS Sending HTTP requests](js-sending-http-requests.md)  [JS Realtime messaging](js-realtime.md)  [JS Filesystem](js-filesystem.md)  [JS Logging](js-logging.md)  [JS Types reference](/jsvm/index.html)   Extend with JavaScript - Logging Logging

`$app.logger()` could be used to writes any logs into the database so that they can be later
explored from the PocketBase *Dashboard > Logs* section.

 

For better performance and to minimize blocking on hot paths, logs are written with debounce and
on batches:

* 3 seconds after the last debounced log write
* when the batch threshold is reached (currently 200)
* right before app termination to attempt saving everything from the existing logs queue
 

* [Logger methods](#logger-methods)
  + [debug(message, attrs...)](#debugmessage-attrs-)
  + [info(message, attrs...)](#infomessage-attrs-)
  + [warn(message, attrs...)](#warnmessage-attrs-)
  + [error(message, attrs...)](#errormessage-attrs-)
  + [with(attrs...)](#withattrs-)
  + [withGroup(name)](#withgroupname)
* [Logs settings](#logs-settings)
### [Logger methods](#logger-methods)

All standard
[`slog.Logger`](/jsvm/interfaces/slog.Logger.html)
methods are available but below is a list with some of the most notable ones. Note that attributes are represented
as key-value pair arguments.

##### [debug(message, attrs...)](#debugmessage-attrs-)

`$app.logger().debug("Debug message!")
$app.logger().debug(
"Debug message with attributes!",
"name", "John Doe",
"id", 123,
)`
##### [info(message, attrs...)](#infomessage-attrs-)

`$app.logger().info("Info message!")
$app.logger().info(
"Info message with attributes!",
"name", "John Doe",
"id", 123,
)`
##### [warn(message, attrs...)](#warnmessage-attrs-)

`$app.logger().warn("Warning message!")
$app.logger().warn(
"Warning message with attributes!",
"name", "John Doe",
"id", 123,
)`
##### [error(message, attrs...)](#errormessage-attrs-)

`$app.logger().error("Error message!")
$app.logger().error(
"Error message with attributes!",
"id", 123,
"error", err,
)`
##### [with(attrs...)](#withattrs-)

`with(atrs...)` creates a new local logger that will "inject" the specified attributes with each
following log.

`const l = $app.logger().with("total", 123)
// results in log with data {"total": 123}
l.info("message A")
// results in log with data {"total": 123, "name": "john"}
l.info("message B", "name", "john")`
##### [withGroup(name)](#withgroupname)

`withGroup(name)` creates a new local logger that wraps all logs attributes under the specified
group name.

`const l = $app.logger().withGroup("sub")
// results in log with data {"sub": { "total": 123 }}
l.info("message A", "total", 123)`
### [Logs settings](#logs-settings)

You can control various log settings like logs retention period, minimal log level, request IP logging,
etc. from the logs settings panel:

![Logs settings screenshot](/images/screenshots/logs.png) 

---

  [Prev: Filesystem](js-filesystem.md) [Next: Types reference](/jsvm/index.html)  [FAQ](/faq) [Discussions](https://github.com/pocketbase/pocketbase/discussions) [Documentation](/docs) [JavaScript SDK](https://github.com/pocketbase/js-sdk) [Dart SDK](https://github.com/pocketbase/dart-sdk) Pocket**Base**   © 2023-2025 Pocket**Base** The Gopher artwork is from
[marcusolsson/gophers](https://github.com/marcusolsson/gophers)  Crafted by [**Gani**](https://gani.bg)   
