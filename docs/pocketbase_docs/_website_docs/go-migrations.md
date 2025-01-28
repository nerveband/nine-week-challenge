






















































Extend with Go - Migrations - Docs - PocketBase


[![PocketBase logo](/images/logo.svg) Pocket**Base** v0.24.4](/)   Go JavaScript  Clear      [FAQ](/faq)  [Documentation](/docs)   [Introduction](/docs)   [Going to production](going-to-production.md)   [Web APIs reference](api-records.md)    [Extend with
  
 **Go**](go-overview.md) [Extend with
  
 **JavaScript**](js-overview.md) [Go Overview](go-overview.md)  [Go Event hooks](go-event-hooks.md)  [Go Routing](go-routing.md)  [Go Database](go-database.md)  [Go Record operations](go-records.md)  [Go Collection operations](go-collections.md)  [Go Migrations](go-migrations.md)  [Go Jobs scheduling](go-jobs-scheduling.md)  [Go Sending emails](go-sending-emails.md)  [Go Rendering templates](go-rendering-templates.md)  [Go Console commands](go-console-commands.md)  [Go Realtime messaging](go-realtime.md)  [Go Filesystem](go-filesystem.md)  [Go Logging](go-logging.md)  [Go Testing](go-testing.md)  [Go Miscellaneous](go-miscellaneous.md)  [Go Record proxy](go-record-proxy.md)   [JS Overview](js-overview.md)  [JS Event hooks](js-event-hooks.md)  [JS Routing](js-routing.md)  [JS Database](js-database.md)  [JS Record operations](js-records.md)  [JS Collection operations](js-collections.md)  [JS Migrations](js-migrations.md)  [JS Jobs scheduling](js-jobs-scheduling.md)  [JS Sending emails](js-sending-emails.md)  [JS Rendering templates](js-rendering-templates.md)  [JS Console commands](js-console-commands.md)  [JS Sending HTTP requests](js-sending-http-requests.md)  [JS Realtime messaging](js-realtime.md)  [JS Filesystem](js-filesystem.md)  [JS Logging](js-logging.md)  [JS Types reference](/jsvm/index.html)   Extend with Go - Migrations Migrations

PocketBase comes with a builtin DB and data migration utility, allowing you to version your DB structure,
create collections programmatically, initialize default settings, etc.

Because the migrations are regular Go functions, besides applying schema changes, they could be used also
to adjust existing data to fit the new schema or any other app specific logic that you want to run only
once.

And as a bonus, being `.go` files also ensure that the migrations will be embedded seamlessly in
your final executable.

* [Quick setup](#quick-setup)
  + [0. Register the migrate command](#0-register-the-migrate-command)
  + [1. Create new migration](#1-create-new-migration)
  + [2. Load migrations](#2-load-migrations)
  + [3. Run migrations](#3-run-migrations)
* [Collections snapshot](#collections-snapshot)
* [Migrations history](#migrations-history)
* [Examples](#examples)
  + [Executing raw SQL statements](#executing-raw-sql-statements)
  + [Initialize default application settings](#initialize-default-application-settings)
  + [Creating initial superuser](#creating-initial-superuser)
  + [Creating collection programmatically](#creating-collection-programmatically)
### [Quick setup](#quick-setup)

##### [0. Register the migrate command](#0-register-the-migrate-command)

*You can find all available config options in the
[`migratecmd`](https://pkg.go.dev/github.com/pocketbase/pocketbase/plugins/migratecmd)
subpackage.*

`// main.go
package main
import (
"log"
"strings"
"github.com/pocketbase/pocketbase"
"github.com/pocketbase/pocketbase/plugins/migratecmd"
// enable once you have at least one migration
// _ "yourpackage/migrations"
)
func main() {
app := pocketbase.New()
// loosely check if it was executed using "go run"
isGoRun := strings.HasPrefix(os.Args[0], os.TempDir())
migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
// enable auto creation of migration files when making collection changes in the Dashboard
// (the isGoRun check is to enable it only during development)
Automigrate: isGoRun,
})
if err := app.Start(); err != nil {
log.Fatal(err)
}
}`
##### [1. Create new migration](#1-create-new-migration)

To create a new blank migration you can run `migrate create`.

`// Since the "create" command makes sense only during development,
// it is expected the user to be in the app working directory
// and to be using "go run"
[root@dev app]$ go run . migrate create "your_new_migration"`  `// migrations/1655834400_your_new_migration.go
package migrations
import (
"github.com/pocketbase/pocketbase/core"
m "github.com/pocketbase/pocketbase/migrations"
)
func init() {
m.Register(func(app core.App) error {
// add up queries...
return nil
}, func(app core.App) error {
// add down queries...
return nil
})
}`

The above will create a new blank migration file inside the default command `migrations` directory.

Each migration file should have a single `m.Register(upFunc, downFunc)` call.

In the migration file, you are expected to write your "upgrade" code in the `upFunc` callback.
  

The `downFunc` is optional and it should contains the "downgrade" operations to revert the
changes made by the `upFunc`.
  

Both callbacks accept a transactional `core.App` instance.

 

You can explore the
[Database guide](go-database.md),
[Collection operations](go-collections.md) and
[Record operations](go-records.md)
for more details how to interact with the database. You can also find
[some examples](#examples) further below in ths guide.

##### [2. Load migrations](#2-load-migrations)

To make your application aware of the registered migrations, you have to import the above
`migrations` package in one of your `main` package files:

`package main
import _ "yourpackage/migrations"
// ...`
##### [3. Run migrations](#3-run-migrations)

New unapplied migrations are automatically executed when the application server starts, aka. on
`serve`.

Alternatively, you can also apply new migrations manually by running `migrate up`.
  

To revert the last applied migration(s), you can run `migrate down [number]`.
  
 When manually applying or reverting migrations, the `serve` process needs to be restarted so
that it can refresh its cached collections state.

### [Collections snapshot](#collections-snapshot)

The `migrate collections` command generates a full snapshot of your current collections
configuration without having to type it manually. Similar to the `migrate create` command, this
will generate a new migration file in the
`migrations` directory.

`// Since the "collections" command makes sense only during development,
// it is expected the user to be in the app working directory
// and to be using "go run"
[root@dev app]$ go run . migrate collections`

By default the collections snapshot is imported in *extend* mode, meaning that collections and
fields that don't exist in the snapshot are preserved. If you want the snapshot to *delete*
missing collections and fields, you can edit the generated file and change the last argument of
`importCollections` method to `true`.

### [Migrations history](#migrations-history)

All applied migration filenames are stored in the internal `_migrations` table.
  

During local development often you might end up making various collection changes to test different approaches.
  

When `Automigrate` is enabled this could lead in a migration history with unnecessary intermediate
steps that may not be wanted in the final migration history.

To avoid the clutter and to prevent applying the intermediate steps in production, you can remove (or
squash) the unnecessary migration files manually and then update the local migrations history by running:

`[root@dev app]$ go run . migrate history-sync`

The above command will remove any entry from the `_migrations` table that doesn't have a related
migration file associated with it.

### [Examples](#examples)

##### [Executing raw SQL statements](#executing-raw-sql-statements)

`// migrations/1687801090_set_pending_status.go
package migrations
import (
"github.com/pocketbase/pocketbase/core"
m "github.com/pocketbase/pocketbase/migrations"
)
// set a default "pending" status to all empty status articles
func init() {
m.Register(func(app core.App) error {
_, err := app.DB().NewQuery("UPDATE articles SET status = 'pending' WHERE status = ''").Execute()
return err
}, nil)
}`
##### [Initialize default application settings](#initialize-default-application-settings)

`// migrations/1687801090_initial_settings.go
package migrations
import (
"github.com/pocketbase/pocketbase/core"
m "github.com/pocketbase/pocketbase/migrations"
)
func init() {
m.Register(func(app core.App) error {
settings := app.Settings()
// for all available settings fields you could check
// https://github.com/pocketbase/pocketbase/blob/develop/core/settings_model.go#L121-L130
settings.Meta.AppName = "test"
settings.Meta.AppURL = "https://example.com"
settings.Logs.MaxDays = 2
settings.Logs.LogAuthId = true
settings.Logs.LogIP = false
return app.Save(settings)
}, nil)
}`
##### [Creating initial superuser](#creating-initial-superuser)

*For all supported record methods, you can refer to
[Record operations](go-records.md)*
.

*You can also create the initial super user using the
`./pocketbase superuser create EMAIL PASS`
command.*

`// migrations/1687801090_initial_superuser.go
package migrations
import (
"github.com/pocketbase/pocketbase/core"
m "github.com/pocketbase/pocketbase/migrations"
)
func init() {
m.Register(func(app core.App) error {
superusers, err := app.FindCollectionByNameOrId(core.CollectionNameSuperusers)
if err != nil {
return err
}
record := core.NewRecord(superusers)
// note: the values can be eventually loaded via os.Getenv(key)
// or from a special local config file
record.Set("email", "test@example.com")
record.Set("password", "1234567890")
return app.Save(record)
}, func(app core.App) error { // optional revert operation
record, _ := app.FindAuthRecordByEmail(core.CollectionNameSuperusers, "test@example.com")
if record == nil {
return nil // probably already deleted
}
return app.Delete(record)
})
}`
##### [Creating collection programmatically](#creating-collection-programmatically)

*For all supported collection methods, you can refer to
[Collection operations](go-collections.md)*
.

`// migrations/1687801090_create_clients_collection.go
package migrations
import (
"github.com/pocketbase/pocketbase/core"
"github.com/pocketbase/pocketbase/tools/types"
m "github.com/pocketbase/pocketbase/migrations"
)
func init() {
m.Register(func(app core.App) error {
// init a new auth collection with the default system fields and auth options
collection := core.NewAuthCollection("clients")
// restrict the list and view rules for record owners
collection.ListRule = types.Pointer("id = @request.auth.id")
collection.ViewRule = types.Pointer("id = @request.auth.id")
// add extra fields in addition to the default ones
collection.Fields.Add(
&core.TextField{
Name: "company",
Required: true,
Max: 100,
},
&core.URLField{
Name: "website",
Presentable: true,
},
)
// disable password auth and enable OTP only
collection.passwordAuth.enabled = false
collection.otp.enabled = true
collection.AddIndex("idx_clients_company", false, "company", "")
return app.Save(collection)
}, func(app core.App) error { // optional revert operation
collection, err := app.FindCollectionByNameOrId("clients")
if err != nil {
return err
}
return app.Delete(collection)
})
}` 

---

  [Prev: Collection operations](go-collections.md) [Next: Jobs scheduling](go-jobs-scheduling.md)  [FAQ](/faq) [Discussions](https://github.com/pocketbase/pocketbase/discussions) [Documentation](/docs) [JavaScript SDK](https://github.com/pocketbase/js-sdk) [Dart SDK](https://github.com/pocketbase/dart-sdk) Pocket**Base**   © 2023-2025 Pocket**Base** The Gopher artwork is from
[marcusolsson/gophers](https://github.com/marcusolsson/gophers)  Crafted by [**Gani**](https://gani.bg)   
