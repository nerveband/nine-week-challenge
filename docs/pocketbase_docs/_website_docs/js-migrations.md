






















































Extend with JavaScript - Migrations - Docs - PocketBase


[![PocketBase logo](/images/logo.svg) Pocket**Base** v0.24.4](/)   Go JavaScript  Clear      [FAQ](/faq)  [Documentation](/docs)   [Introduction](/docs)   [Going to production](going-to-production.md)   [Web APIs reference](api-records.md)    [Extend with
  
 **Go**](go-overview.md) [Extend with
  
 **JavaScript**](js-overview.md) [Go Overview](go-overview.md)  [Go Event hooks](go-event-hooks.md)  [Go Routing](go-routing.md)  [Go Database](go-database.md)  [Go Record operations](go-records.md)  [Go Collection operations](go-collections.md)  [Go Migrations](go-migrations.md)  [Go Jobs scheduling](go-jobs-scheduling.md)  [Go Sending emails](go-sending-emails.md)  [Go Rendering templates](go-rendering-templates.md)  [Go Console commands](go-console-commands.md)  [Go Realtime messaging](go-realtime.md)  [Go Filesystem](go-filesystem.md)  [Go Logging](go-logging.md)  [Go Testing](go-testing.md)  [Go Miscellaneous](go-miscellaneous.md)  [Go Record proxy](go-record-proxy.md)   [JS Overview](js-overview.md)  [JS Event hooks](js-event-hooks.md)  [JS Routing](js-routing.md)  [JS Database](js-database.md)  [JS Record operations](js-records.md)  [JS Collection operations](js-collections.md)  [JS Migrations](js-migrations.md)  [JS Jobs scheduling](js-jobs-scheduling.md)  [JS Sending emails](js-sending-emails.md)  [JS Rendering templates](js-rendering-templates.md)  [JS Console commands](js-console-commands.md)  [JS Sending HTTP requests](js-sending-http-requests.md)  [JS Realtime messaging](js-realtime.md)  [JS Filesystem](js-filesystem.md)  [JS Logging](js-logging.md)  [JS Types reference](/jsvm/index.html)   Extend with JavaScript - Migrations Migrations

PocketBase comes with a builtin DB and data migration utility, allowing you to version your DB structure,
create collections programmatically, initialize default settings and/or run anything that needs to be
executed only once.

The user defined migrations are located in `pb_migrations` directory (it can be changed using
the
`--migrationsDir` flag) and each unapplied migration inside it will be executed automatically
in a transaction on `serve` (or on `migrate up`).

The generated migrations are safe to be committed to version control and can be shared with your other
team members.

* [Automigrate](#automigrate)
* [Creating migrations](#creating-migrations)
  + [Migration file](#migration-file)
* [Collections snapshot](#collections-snapshot)
* [Migrations history](#migrations-history)
* [Examples](#examples)
  + [Executing raw SQL statements](#executing-raw-sql-statements)
  + [Initialize default application settings](#initialize-default-application-settings)
  + [Creating initial superuser](#creating-initial-superuser)
  + [Creating collection programmatically](#creating-collection-programmatically)
### [Automigrate](#automigrate)

The prebuilt executable has the `--automigrate` flag enabled by default, meaning that every collection
configuration change from the Dashboard (or Web API) will generate the related migration file automatically
for you.

### [Creating migrations](#creating-migrations)

To create a new blank migration you can run `migrate create`.

`[root@dev app]$ ./pocketbase migrate create "your_new_migration"`  `// pb_migrations/1687801097_your_new_migration.js
migrate((app) => {
// add up queries...
}, (app) => {
// add down queries...
})`

New migrations are applied automatically on `serve`.

Optionally, you could apply new migrations manually by running `migrate up`.
  

To revert the last applied migration(s), you could run `migrate down [number]`.
  
 When manually applying or reverting migrations, the `serve` process needs to be restarted so
that it can refresh its cached collections state.

##### [Migration file](#migration-file)

Each migration file should have a single `migrate(upFunc, downFunc)` call.

In the migration file, you are expected to write your "upgrade" code in the `upFunc` callback.
  

The `downFunc` is optional and it should contains the "downgrade" operations to revert the
changes made by the
`upFunc`.

Both callbacks accept a transactional `app` instance.

### [Collections snapshot](#collections-snapshot)

The `migrate collections` command generates a full snapshot of your current collections
configuration without having to type it manually. Similar to the `migrate create` command, this
will generate a new migration file in the
`pb_migrations` directory.

`[root@dev app]$ ./pocketbase migrate collections`

By default the collections snapshot is imported in *extend* mode, meaning that collections and
fields that don't exist in the snapshot are preserved. If you want the snapshot to *delete*
missing collections and fields, you can edit the generated file and change the last argument of
`ImportCollectionsByMarshaledJSON`
to `true`.

### [Migrations history](#migrations-history)

All applied migration filenames are stored in the internal `_migrations` table.
  

During local development often you might end up making various collection changes to test different approaches.
  

When `--automigrate` is enabled (*which is the default*) this could lead in a migration
history with unnecessary intermediate steps that may not be wanted in the final migration history.

To avoid the clutter and to prevent applying the intermediate steps in production, you can remove (or
squash) the unnecessary migration files manually and then update the local migrations history by running:

`[root@dev app]$ ./pocketbase migrate history-sync`

The above command will remove any entry from the `_migrations` table that doesn't have a related
migration file associated with it.

### [Examples](#examples)

##### [Executing raw SQL statements](#executing-raw-sql-statements)

`// pb_migrations/1687801090_set_pending_status.js
migrate((app) => {
app.db().newQuery("UPDATE articles SET status = 'pending' WHERE status = ''").execute()
})`
##### [Initialize default application settings](#initialize-default-application-settings)

`// pb_migrations/1687801090_initial_settings.js
migrate((app) => {
let settings = app.settings()
// for all available settings fields you could check
// /jsvm/interfaces/core.Settings.html
settings.meta.appName = "test"
settings.meta.appURL = "https://example.com"
settings.logs.maxDays = 2
settings.logs.logAuthId = true
settings.logs.logIP = false
app.save(settings)
})`
##### [Creating initial superuser](#creating-initial-superuser)

*For all supported record methods, you can refer to
[Record operations](js-records.md)*
.

`// pb_migrations/1687801090_initial_superuser.js
migrate((app) => {
let superusers = app.findCollectionByNameOrId("_superusers")
let record = new Record(superusers)
// note: the values can be eventually loaded via $os.getenv(key)
// or from a special local config file
record.set("email", "test@example.com")
record.set("password", "1234567890")
app.save(record)
}, (app) => { // optional revert operation
try {
let record = app.findAuthRecordByEmail("_superusers", "test@example.com")
app.delete(record)
} catch {
// silent errors (probably already deleted)
}
})`
##### [Creating collection programmatically](#creating-collection-programmatically)

*For all supported collection methods, you can refer to
[Collection operations](js-collections.md)*
.

`// migrations/1687801090_create_clients_collection.js
migrate((app) => {
// missing default options, system fields like id, email, etc. are initialized automatically
// and will be merged with the provided configuration
let collection = new Collection({
type: "auth",
name: "clients",
listRule: "id = @request.auth.id",
viewRule: "id = @request.auth.id",
fields: [
{
type: "text",
name: "company",
required: true,
max: 100,
},
{
name: "url",
type: "url",
presentable: true,
},
],
passwordAuth: {
enabled: false,
},
otp: {
enabled: true,
}
indexes: [
"CREATE INDEX idx_clients_company ON clients (company)"
],
})
app.save(collection)
}, (app) => {
let collection = app.findCollectionByNameOrId("clients")
app.delete(collection)
})` 

---

  [Prev: Collection operations](js-collections.md) [Next: Jobs scheduling](js-jobs-scheduling.md)  [FAQ](/faq) [Discussions](https://github.com/pocketbase/pocketbase/discussions) [Documentation](/docs) [JavaScript SDK](https://github.com/pocketbase/js-sdk) [Dart SDK](https://github.com/pocketbase/dart-sdk) Pocket**Base**   © 2023-2025 Pocket**Base** The Gopher artwork is from
[marcusolsson/gophers](https://github.com/marcusolsson/gophers)  Crafted by [**Gani**](https://gani.bg)   
