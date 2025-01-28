























































Extend with Go - Overview - Docs - PocketBase


[![PocketBase logo](/images/logo.svg) Pocket**Base** v0.24.4](/)   Go JavaScript  Clear      [FAQ](/faq)  [Documentation](/docs)   [Introduction](/docs)   [Going to production](going-to-production.md)   [Web APIs reference](api-records.md)    [Extend with
  
 **Go**](go-overview.md) [Extend with
  
 **JavaScript**](js-overview.md) [Go Overview](go-overview.md)  [Go Event hooks](go-event-hooks.md)  [Go Routing](go-routing.md)  [Go Database](go-database.md)  [Go Record operations](go-records.md)  [Go Collection operations](go-collections.md)  [Go Migrations](go-migrations.md)  [Go Jobs scheduling](go-jobs-scheduling.md)  [Go Sending emails](go-sending-emails.md)  [Go Rendering templates](go-rendering-templates.md)  [Go Console commands](go-console-commands.md)  [Go Realtime messaging](go-realtime.md)  [Go Filesystem](go-filesystem.md)  [Go Logging](go-logging.md)  [Go Testing](go-testing.md)  [Go Miscellaneous](go-miscellaneous.md)  [Go Record proxy](go-record-proxy.md)   [JS Overview](js-overview.md)  [JS Event hooks](js-event-hooks.md)  [JS Routing](js-routing.md)  [JS Database](js-database.md)  [JS Record operations](js-records.md)  [JS Collection operations](js-collections.md)  [JS Migrations](js-migrations.md)  [JS Jobs scheduling](js-jobs-scheduling.md)  [JS Sending emails](js-sending-emails.md)  [JS Rendering templates](js-rendering-templates.md)  [JS Console commands](js-console-commands.md)  [JS Sending HTTP requests](js-sending-http-requests.md)  [JS Realtime messaging](js-realtime.md)  [JS Filesystem](js-filesystem.md)  [JS Logging](js-logging.md)  [JS Types reference](/jsvm/index.html)   Extend with Go - Overview Overview 

* [Getting started](#getting-started)
* [Custom SQLite driver](#custom-sqlite-driver)
### [Getting started](#getting-started)

PocketBase can be used as regular Go package that exposes various helpers and hooks to help you implement
you own custom portable application.

A new PocketBase instance is created via
[`pocketbase.New()`](https://pkg.go.dev/github.com/pocketbase/pocketbase#New)
or
[`pocketbase.NewWithConfig(config)`](https://pkg.go.dev/github.com/pocketbase/pocketbase#NewWithConfig)
.

Once created you can register your custom business logic via the available
[event hooks](go-event-hooks/.md)
and call
[`app.Start()`](https://pkg.go.dev/github.com/pocketbase/pocketbase#PocketBase.Start)
to start the application.

Below is a minimal example:

0. [Install Go 1.23+](https://go.dev/doc/install)
1. Create a new project directory with `main.go` file inside it.
     
    As a reference, you can also explore the prebuilt executable
   [`example/base/main.go`](https://github.com/pocketbase/pocketbase/blob/master/examples/base/main.go)
   file.
   
   `package main
   import (
   "log"
   "os"
   "github.com/pocketbase/pocketbase"
   "github.com/pocketbase/pocketbase/apis"
   "github.com/pocketbase/pocketbase/core"
   )
   func main() {
   app := pocketbase.New()
   app.OnServe().BindFunc(func(se *core.ServeEvent) error {
   // serves static files from the provided public dir (if exists)
   se.Router.GET("/{path...}", apis.Static(os.DirFS("./pb_public"), false))
   return se.Next()
   })
   if err := app.Start(); err != nil {
   log.Fatal(err)
   }
   }`
2. To init the dependencies, run `go mod init myapp && go mod tidy`.
3. To start the application, run `go run . serve`.
4. To build a statically linked executable, run `go build`
   and then you can start the created executable with
   `./myapp serve`.

### [Custom SQLite driver](#custom-sqlite-driver)

 

**The general recommendation is to use the builtin SQLite setup** but if you need more
advanced configuration or extensions like ICU, FTS5, etc. you'll have to specify a custom driver/build.

Note that PocketBase by default doesn't require CGO because it uses the pure Go SQLite port
[modernc.org/sqlite](https://pkg.go.dev/modernc.org/sqlite), but this may not be the case when using a custom SQLite driver!

PocketBase v0.23+ added supported for defining a `DBConnect` function as app configuration to
load custom SQLite builds and drivers compatible with the standard Go `database/sql`.

**The `DBConnect` function is called twice** - once for
`pb_data/data.db`
(the main database file) and second time for `pb_data/auxiliary.db` (used for logs and other ephemeral
system meta information).

If you want to load your custom driver conditionally and fallback to the default handler, then you can
call
[`core.DefaultDBConnect`](https://pkg.go.dev/github.com/pocketbase/pocketbase/core#DefaultDBConnect)
.
  
 *As a side-note, if you are not planning to use `core.DefaultDBConnect`
fallback as part of your custom driver registration you can exclude the default pure Go driver with
`go build -tags no_default_driver` to reduce the binary size a little (~4MB).*

Below are some minimal examples with commonly used external SQLite drivers:

 **[github.com/mattn/go-sqlite3](#github-commattngo-sqlite3)**  

*For all available options please refer to the
[`github.com/mattn/go-sqlite3`](https://github.com/mattn/go-sqlite3)
README.*

`package main
import (
"database/sql"
"log"
"github.com/mattn/go-sqlite3"
"github.com/pocketbase/dbx"
"github.com/pocketbase/pocketbase"
)
// register a new driver with default PRAGMAs and the same query
// builder implementation as the already existing sqlite3 builder
func init() {
// initialize default PRAGMAs for each new connection
sql.Register("pb_sqlite3",
&sqlite3.SQLiteDriver{
ConnectHook: func(conn *sqlite3.SQLiteConn) error {
_, err := conn.Exec(`
PRAGMA busy_timeout = 10000;
PRAGMA journal_mode = WAL;
PRAGMA journal_size_limit = 200000000;
PRAGMA synchronous = NORMAL;
PRAGMA foreign_keys = ON;
PRAGMA temp_store = MEMORY;
PRAGMA cache_size = -16000;
`, nil)
return err
},
},
)
dbx.BuilderFuncMap["pb_sqlite3"] = dbx.BuilderFuncMap["sqlite3"]
}
func main() {
app := pocketbase.NewWithConfig(pocketbase.Config{
DBConnect: func(dbPath string) (*dbx.DB, error) {
return dbx.Open("pb_sqlite3", dbPath)
},
})
// any custom hooks or plugins...
if err := app.Start(); err != nil {
log.Fatal(err)
}
}`  **[github.com/ncruces/go-sqlite3](#github-comncrucesgo-sqlite3)**  

*For all available options please refer to the
[`github.com/ncruces/go-sqlite3`](https://github.com/ncruces/go-sqlite3)
README.*

`package main
import (
"log"
"github.com/pocketbase/dbx"
"github.com/pocketbase/pocketbase"
_ "github.com/ncruces/go-sqlite3/driver"
_ "github.com/ncruces/go-sqlite3/embed"
)
func main() {
app := pocketbase.NewWithConfig(pocketbase.Config{
DBConnect: func(dbPath string) (*dbx.DB, error) {
const pragmas = "?_pragma=busy_timeout(10000)&_pragma=journal_mode(WAL)&_pragma=journal_size_limit(200000000)&_pragma=synchronous(NORMAL)&_pragma=foreign_keys(ON)&_pragma=temp_store(MEMORY)&_pragma=cache_size(-16000)"
return dbx.Open("sqlite3", dbPath+pragmas)
},
})
// custom hooks and plugins...
if err := app.Start(); err != nil {
log.Fatal(err)
}
}`  **[github.com/tursodatabase/libsql-client-go/libsql](#github-comtursodatabaselibsql-client-golibsql)**  

*For all available options please refer to the
[Turso Go docs](https://docs.turso.tech/sdk/go/quickstart#remote-only)
.*

`package main
import (
"log"
"github.com/pocketbase/dbx"
"github.com/pocketbase/pocketbase"
"github.com/pocketbase/pocketbase/core"
_ "github.com/tursodatabase/libsql-client-go/libsql"
)
// register the libsql driver to use the same query builder
// implementation as the already existing sqlite3 builder
func init() {
dbx.BuilderFuncMap["libsql"] = dbx.BuilderFuncMap["sqlite3"]
}
func main() {
app := pocketbase.NewWithConfig(pocketbase.Config{
DBConnect: func(dbPath string) (*dbx.DB, error) {
if strings.Contains(dbPath, "data.db") {
return dbx.Open("libsql", "libsql://[data.db DATABASE].turso.io?authToken=[TOKEN]")
}
// optionally for the logs (aka. pb_data/auxiliary.db) use the default local filesystem driver
return core.DefaultDBConnect(dbPath)
},
})
// any custom hooks or plugins...
if err := app.Start(); err != nil {
log.Fatal(err)
}
}` 

---

  [Next: Event hooks](go-event-hooks.md)  [FAQ](/faq) [Discussions](https://github.com/pocketbase/pocketbase/discussions) [Documentation](/docs) [JavaScript SDK](https://github.com/pocketbase/js-sdk) [Dart SDK](https://github.com/pocketbase/dart-sdk) Pocket**Base**   © 2023-2025 Pocket**Base** The Gopher artwork is from
[marcusolsson/gophers](https://github.com/marcusolsson/gophers)  Crafted by [**Gani**](https://gani.bg)   
