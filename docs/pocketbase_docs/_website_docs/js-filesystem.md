






















































Extend with JavaScript - Filesystem - Docs - PocketBase


[![PocketBase logo](/images/logo.svg) Pocket**Base** v0.24.4](/)   Go JavaScript  Clear      [FAQ](/faq)  [Documentation](/docs)   [Introduction](/docs)   [Going to production](going-to-production.md)   [Web APIs reference](api-records.md)    [Extend with
  
 **Go**](go-overview.md) [Extend with
  
 **JavaScript**](js-overview.md) [Go Overview](go-overview.md)  [Go Event hooks](go-event-hooks.md)  [Go Routing](go-routing.md)  [Go Database](go-database.md)  [Go Record operations](go-records.md)  [Go Collection operations](go-collections.md)  [Go Migrations](go-migrations.md)  [Go Jobs scheduling](go-jobs-scheduling.md)  [Go Sending emails](go-sending-emails.md)  [Go Rendering templates](go-rendering-templates.md)  [Go Console commands](go-console-commands.md)  [Go Realtime messaging](go-realtime.md)  [Go Filesystem](go-filesystem.md)  [Go Logging](go-logging.md)  [Go Testing](go-testing.md)  [Go Miscellaneous](go-miscellaneous.md)  [Go Record proxy](go-record-proxy.md)   [JS Overview](js-overview.md)  [JS Event hooks](js-event-hooks.md)  [JS Routing](js-routing.md)  [JS Database](js-database.md)  [JS Record operations](js-records.md)  [JS Collection operations](js-collections.md)  [JS Migrations](js-migrations.md)  [JS Jobs scheduling](js-jobs-scheduling.md)  [JS Sending emails](js-sending-emails.md)  [JS Rendering templates](js-rendering-templates.md)  [JS Console commands](js-console-commands.md)  [JS Sending HTTP requests](js-sending-http-requests.md)  [JS Realtime messaging](js-realtime.md)  [JS Filesystem](js-filesystem.md)  [JS Logging](js-logging.md)  [JS Types reference](/jsvm/index.html)   Extend with JavaScript - Filesystem Filesystem

PocketBase comes with a thin abstraction between the local filesystem and S3.

To configure which one will be used you can adjust the storage settings from
*Dashboard > Settings > Files storage* section.

The filesystem abstraction can be accessed programmatically via the
[`$app.newFilesystem()`](/jsvm/functions/_app.newFilesystem.html)
method.

Below are listed some of the most common operations but you can find more details in the
[`filesystem.System`](/jsvm/interfaces/filesystem.System.html)
interface.

 

Always make sure to call `close()` at the end for both the created filesystem instance and
the retrieved file readers to prevent leaking resources.

 

* [Reading files](#reading-files)
* [Saving files](#saving-files)
* [Deleting files](#deleting-files)
### [Reading files](#reading-files)

To retrieve the file content of a single stored file you can use
[`getFile(key)`](/jsvm/interfaces/filesystem.System.html#getFile)
.
  

Note that file keys often contain a **prefix** (aka. the "path" to the file). For record
files the full key is
`collectionId/recordId/filename`.
  

To retrieve multiple files matching a specific *prefix* you can use
[`list(prefix)`](/jsvm/interfaces/filesystem.System.html#list)
.

The below code shows a minimal example how to retrieve the content of a single record file as string.

`let record = $app.findAuthRecordByEmail("users", "test@example.com")
// construct the full file key by concatenating the record storage path with the specific filename
let avatarKey = record.baseFilesPath() + "/" + record.get("avatar")
let fsys, file, content;
try {
// initialize the filesystem
fsys = $app.newFilesystem();
// retrieve a file reader for the avatar key
file = fsys.getFile(avatarKey)
// copy as plain string
content = toString(file)
} finally {
file?.close();
fsys?.close();
}`
### [Saving files](#saving-files)

There are several methods to save *(aka. write/upload)* files depending on the available file content
source:

* [`upload(content, key)`](/jsvm/interfaces/filesystem.System.html#upload)
* [`uploadFile(file, key)`](/jsvm/interfaces/filesystem.System.html#uploadFile)
* [`uploadMultipart(mfh, key)`](/jsvm/interfaces/filesystem.System.html#uploadMultipart)

Most users rarely will have to use the above methods directly because for collection records the file
persistence is handled transparently when saving the record model (it will also perform size and MIME type
validation based on the collection `file` field options). For example:

`let record = $app.findRecordById("articles", "RECORD_ID")
// Other available File factories
// - $filesystem.fileFromBytes(content, name)
// - $filesystem.fileFromURL(url)
// - $filesystem.fileFromMultipart(mfh)
let file = $filesystem.fileFromPath("/local/path/to/file")
// set new file (can be single or array of File values)
// (if the record has an old file it is automatically deleted on successful save)
record.set("yourFileField", file)
$app.save(record)`
### [Deleting files](#deleting-files)

Files can be deleted from the storage filesystem using
[`delete(key)`](/jsvm/interfaces/filesystem.System.html#delete)
.

Similar to the previous section, most users rarely will have to use the `delete` file method directly
because for collection records the file deletion is handled transparently when removing the existing filename
from the record model (this also ensure that the db entry referencing the file is also removed). For example:

`let record = $app.findRecordById("articles", "RECORD_ID")
// if you want to "reset" a file field (aka. deleting the associated single or multiple files)
// you can set it to null
record.set("yourFileField", null)
// OR if you just want to remove individual file(s) from a multiple file field you can use the "-" modifier
// (the value could be a single filename string or slice of filename strings)
record.set("yourFileField-", "example_52iWbGinWd.txt")
$app.save(record)` 

---

  [Prev: Realtime messaging](js-realtime.md) [Next: Logging](js-logging.md)  [FAQ](/faq) [Discussions](https://github.com/pocketbase/pocketbase/discussions) [Documentation](/docs) [JavaScript SDK](https://github.com/pocketbase/js-sdk) [Dart SDK](https://github.com/pocketbase/dart-sdk) Pocket**Base**   © 2023-2025 Pocket**Base** The Gopher artwork is from
[marcusolsson/gophers](https://github.com/marcusolsson/gophers)  Crafted by [**Gani**](https://gani.bg)   
