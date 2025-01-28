



















































Introduction - Docs - PocketBase


[![PocketBase logo](/images/logo.svg) Pocket**Base** v0.24.4](/)   Go JavaScript  Clear      [FAQ](/faq)  [Documentation](/docs)   [Introduction](/docs)  [├ How to use PocketBase](how-to-use.md) [├ Collections](collections.md) [├ API rules and filters](api-rules-and-filters.md) [├ Authentication](authentication.md) [├ Files upload and handling](files-handling.md) [├ Working with relations](working-with-relations.md) [└ Extending PocketBase](use-as-framework.md)  [Going to production](going-to-production.md)   [Web APIs reference](api-records.md)    [Extend with
  
 **Go**](go-overview.md) [Extend with
  
 **JavaScript**](js-overview.md) [Go Overview](go-overview.md)  [Go Event hooks](go-event-hooks.md)  [Go Routing](go-routing.md)  [Go Database](go-database.md)  [Go Record operations](go-records.md)  [Go Collection operations](go-collections.md)  [Go Migrations](go-migrations.md)  [Go Jobs scheduling](go-jobs-scheduling.md)  [Go Sending emails](go-sending-emails.md)  [Go Rendering templates](go-rendering-templates.md)  [Go Console commands](go-console-commands.md)  [Go Realtime messaging](go-realtime.md)  [Go Filesystem](go-filesystem.md)  [Go Logging](go-logging.md)  [Go Testing](go-testing.md)  [Go Miscellaneous](go-miscellaneous.md)  [Go Record proxy](go-record-proxy.md)   [JS Overview](js-overview.md)  [JS Event hooks](js-event-hooks.md)  [JS Routing](js-routing.md)  [JS Database](js-database.md)  [JS Record operations](js-records.md)  [JS Collection operations](js-collections.md)  [JS Migrations](js-migrations.md)  [JS Jobs scheduling](js-jobs-scheduling.md)  [JS Sending emails](js-sending-emails.md)  [JS Rendering templates](js-rendering-templates.md)  [JS Console commands](js-console-commands.md)  [JS Sending HTTP requests](js-sending-http-requests.md)  [JS Realtime messaging](js-realtime.md)  [JS Filesystem](js-filesystem.md)  [JS Logging](js-logging.md)  [JS Types reference](/jsvm/index.html)   Introduction Introduction  

Please keep in mind that PocketBase is still under active development and full backward
compatibility is not guaranteed before reaching v1.0.0. PocketBase is NOT recommended for
production critical applications yet, unless you are fine with reading the
[changelog](https://github.com/pocketbase/pocketbase/blob/master/CHANGELOG.md)
and applying some manual migration steps from time to time.

PocketBase is an open source backend consisting of embedded database (SQLite) with realtime subscriptions,
built-in auth management, convenient dashboard UI and simple REST-ish API. It can be used both as Go
framework and as standalone application.

The easiest way to get started is to download the prebuilt minimal PocketBase executable:

x64 ARM64 

* [Download v0.24.4 for Linux x64](https://github.com/pocketbase/pocketbase/releases/download/v0.24.4/pocketbase_0.24.4_linux_amd64.zip) (~14MB zip)
* [Download v0.24.4 for Windows x64](https://github.com/pocketbase/pocketbase/releases/download/v0.24.4/pocketbase_0.24.4_windows_amd64.zip) (~14MB zip)
* [Download v0.24.4 for macOS x64](https://github.com/pocketbase/pocketbase/releases/download/v0.24.4/pocketbase_0.24.4_darwin_amd64.zip) (~14MB zip)
 

* [Download v0.24.4 for Linux ARM64](https://github.com/pocketbase/pocketbase/releases/download/v0.24.4/pocketbase_0.24.4_linux_arm64.zip) (~13MB zip)
* [Download v0.24.4 for Windows ARM64](https://github.com/pocketbase/pocketbase/releases/download/v0.24.4/pocketbase_0.24.4_windows_arm64.zip) (~13MB zip)
* [Download v0.24.4 for macOS ARM64](https://github.com/pocketbase/pocketbase/releases/download/v0.24.4/pocketbase_0.24.4_darwin_arm64.zip) (~13MB zip)

See the
[GitHub Releases page](https://github.com/pocketbase/pocketbase/releases)
for other platforms and more details.

---

Once you've extracted the archive, you could start the application by running
`./pocketbase serve` in the extracted directory.

**And that's it!**
The first time it will generate an installer link that should be automatically opened in the browser to setup
your first superuser account
(you can also create the first superuser manually via
`./pocketbase superuser create EMAIL PASS`)
.

The started web server has the following default routes:

* [`http://127.0.0.1:8090`](http://127.0.0.1:8090)
  - if `pb_public` directory exists, serves the static content from it (html, css, images,
  etc.)
* [`http://127.0.0.1:8090/_/`](http://127.0.0.1:8090/_/)
  - superusers dashboard
* [`http://127.0.0.1:8090/api/`](http://127.0.0.1:8090/api/)
  - REST-ish API

The prebuilt PocketBase executable will create and manage 2 new directories alongside the executable:

* `pb_data` - stores your application data, uploaded files, etc. (usually should be added in
  `.gitignore`).
* `pb_migrations` - contains JS migration files with your collection changes (can be safely
  committed in your repository).
    
   You can even write custom migration scripts. For more info check the
  [JS migrations docs](js-migrations.md).

You could find all available commands and their options by running
`./pocketbase --help` or
`./pocketbase [command] --help`

 

---

  [Next: How to use PocketBase](how-to-use.md)  [FAQ](/faq) [Discussions](https://github.com/pocketbase/pocketbase/discussions) [Documentation](/docs) [JavaScript SDK](https://github.com/pocketbase/js-sdk) [Dart SDK](https://github.com/pocketbase/dart-sdk) Pocket**Base**   © 2023-2025 Pocket**Base** The Gopher artwork is from
[marcusolsson/gophers](https://github.com/marcusolsson/gophers)  Crafted by [**Gani**](https://gani.bg)   
