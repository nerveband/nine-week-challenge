




















































Extend with Go - Jobs scheduling - Docs - PocketBase


[![PocketBase logo](/images/logo.svg) Pocket**Base** v0.24.4](/)   Go JavaScript  Clear      [FAQ](/faq)  [Documentation](/docs)   [Introduction](/docs)   [Going to production](going-to-production.md)   [Web APIs reference](api-records.md)    [Extend with
  
 **Go**](go-overview.md) [Extend with
  
 **JavaScript**](js-overview.md) [Go Overview](go-overview.md)  [Go Event hooks](go-event-hooks.md)  [Go Routing](go-routing.md)  [Go Database](go-database.md)  [Go Record operations](go-records.md)  [Go Collection operations](go-collections.md)  [Go Migrations](go-migrations.md)  [Go Jobs scheduling](go-jobs-scheduling.md)  [Go Sending emails](go-sending-emails.md)  [Go Rendering templates](go-rendering-templates.md)  [Go Console commands](go-console-commands.md)  [Go Realtime messaging](go-realtime.md)  [Go Filesystem](go-filesystem.md)  [Go Logging](go-logging.md)  [Go Testing](go-testing.md)  [Go Miscellaneous](go-miscellaneous.md)  [Go Record proxy](go-record-proxy.md)   [JS Overview](js-overview.md)  [JS Event hooks](js-event-hooks.md)  [JS Routing](js-routing.md)  [JS Database](js-database.md)  [JS Record operations](js-records.md)  [JS Collection operations](js-collections.md)  [JS Migrations](js-migrations.md)  [JS Jobs scheduling](js-jobs-scheduling.md)  [JS Sending emails](js-sending-emails.md)  [JS Rendering templates](js-rendering-templates.md)  [JS Console commands](js-console-commands.md)  [JS Sending HTTP requests](js-sending-http-requests.md)  [JS Realtime messaging](js-realtime.md)  [JS Filesystem](js-filesystem.md)  [JS Logging](js-logging.md)  [JS Types reference](/jsvm/index.html)   Extend with Go - Jobs scheduling Jobs scheduling

If you have tasks that need to be performed periodically, you could setup crontab-like jobs with the
builtin `app.Cron()` *(it returns an app scoped
[`cron.Cron`](https://pkg.go.dev/github.com/pocketbase/pocketbase/tools/cron#Cron) value)*
.

The jobs scheduler is started automatically on app `serve`, so all you have to do is register a
handler with
[`app.Cron().Add(id, cronExpr, handler)`](https://pkg.go.dev/github.com/pocketbase/pocketbase/tools/cron#Cron.Add)
or
[`app.Cron().MustAdd(id, cronExpr, handler)`](https://pkg.go.dev/github.com/pocketbase/pocketbase/tools/cron#Cron.MustAdd)
(*the latter panic if the cron expression is not valid*).

Each scheduled job runs in its own goroutine and must have:

* **id** - identifier for the scheduled job; could be used to replace or remove an existing
  job
* **cron expression** - e.g. `0 0 * * *` (
  *supports numeric list, steps, ranges or
  macros* )
* **handler** - the function that will be executed everytime when the job runs

Here is one minimal example:

`// main.go
package main
import (
"log"
"github.com/pocketbase/pocketbase"
)
func main() {
app := pocketbase.New()
// prints "Hello!" every 2 minutes
app.Cron().MustAdd("hello", "*/2 * * * *", func() {
log.Println("Hello!")
})
if err := app.Start(); err != nil {
log.Fatal(err)
}
}`

To remove already registered cron job you can call
[`app.Cron().Remove(id)`](https://pkg.go.dev/github.com/pocketbase/pocketbase/tools/cron#Cron.Remove)

All registered app level cron jobs can be also previewed and triggered from the
*Dashboard > Settings > Crons* section.

 

Keep in mind that the `app.Cron()` is also used for running the system scheduled jobs
like the logs cleanup or auto backups (the jobs id is in the format `__pb*__`) and
replacing these system jobs or calling `RemoveAll()`/`Stop()` could have unintended
side-effects.

If you want more advanced control you can initialize your own cron instance independent from the
application via `cron.New()`.

 

---

  [Prev: Migrations](go-migrations.md) [Next: Sending emails](go-sending-emails.md)  [FAQ](/faq) [Discussions](https://github.com/pocketbase/pocketbase/discussions) [Documentation](/docs) [JavaScript SDK](https://github.com/pocketbase/js-sdk) [Dart SDK](https://github.com/pocketbase/dart-sdk) Pocket**Base**   © 2023-2025 Pocket**Base** The Gopher artwork is from
[marcusolsson/gophers](https://github.com/marcusolsson/gophers)  Crafted by [**Gani**](https://gani.bg)   
