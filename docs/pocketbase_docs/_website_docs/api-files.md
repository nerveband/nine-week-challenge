























































Web APIs reference - API Files - Docs - PocketBase


[![PocketBase logo](/images/logo.svg) Pocket**Base** v0.24.4](/)   Go JavaScript  Clear      [FAQ](/faq)  [Documentation](/docs)   [Introduction](/docs)   [Going to production](going-to-production.md)   [Web APIs reference](api-records.md)  [├ API Records](api-records.md) [├ API Realtime](api-realtime.md) [├ API Files](api-files.md) [├ API Collections](api-collections.md) [├ API Settings](api-settings.md) [├ API Logs](api-logs.md) [├ API Crons](api-crons.md) [├ API Backups](api-backups.md) [└ API Health](api-health.md)   [Extend with
  
 **Go**](go-overview.md) [Extend with
  
 **JavaScript**](js-overview.md) [Go Overview](go-overview.md)  [Go Event hooks](go-event-hooks.md)  [Go Routing](go-routing.md)  [Go Database](go-database.md)  [Go Record operations](go-records.md)  [Go Collection operations](go-collections.md)  [Go Migrations](go-migrations.md)  [Go Jobs scheduling](go-jobs-scheduling.md)  [Go Sending emails](go-sending-emails.md)  [Go Rendering templates](go-rendering-templates.md)  [Go Console commands](go-console-commands.md)  [Go Realtime messaging](go-realtime.md)  [Go Filesystem](go-filesystem.md)  [Go Logging](go-logging.md)  [Go Testing](go-testing.md)  [Go Miscellaneous](go-miscellaneous.md)  [Go Record proxy](go-record-proxy.md)   [JS Overview](js-overview.md)  [JS Event hooks](js-event-hooks.md)  [JS Routing](js-routing.md)  [JS Database](js-database.md)  [JS Record operations](js-records.md)  [JS Collection operations](js-collections.md)  [JS Migrations](js-migrations.md)  [JS Jobs scheduling](js-jobs-scheduling.md)  [JS Sending emails](js-sending-emails.md)  [JS Rendering templates](js-rendering-templates.md)  [JS Console commands](js-console-commands.md)  [JS Sending HTTP requests](js-sending-http-requests.md)  [JS Realtime messaging](js-realtime.md)  [JS Filesystem](js-filesystem.md)  [JS Logging](js-logging.md)  [JS Types reference](/jsvm/index.html)   Web APIs reference - API Files API Files

Files are uploaded, updated or deleted via the
[Records API](api-records.md).

The File API is usually used to fetch/download a file resource (with support for basic image
manipulations, like generating thumbs).

  **[Download / Fetch file](#download-fetch-file)**  

Downloads a single file resource (aka. the URL address to the file). Example:

`<img src="http://example.com/api/files/demo/1234abcd/test.png" alt="Test image" />`
###### API details

**GET** /api/files/`collectionIdOrName`/`recordId`/`filename` Path parameters

| Param | Type | Description |
| --- | --- | --- |
| collectionIdOrName | String | ID or name of the collection whose record model contains the file resource. |
| recordId | String | ID of the record model that contains the file resource. |
| filename | String | Name of the file resource. |

Query parameters

| Param | Type | Description |
| --- | --- | --- |
| thumb | String | Get the thumb of the requested file. The following thumb formats are currently supported:   * **WxH**   (e.g. 100x300) - crop to WxH viewbox (from center) * **WxHt**   (e.g. 100x300t) - crop to WxH viewbox (from top) * **WxHb**   (e.g. 100x300b) - crop to WxH viewbox (from bottom) * **WxHf**   (e.g. 100x300f) - fit inside a WxH viewbox (without cropping) * **0xH**   (e.g. 0x300) - resize to H height preserving the aspect ratio * **Wx0**   (e.g. 100x0) - resize to W width preserving the aspect ratio  If the thumb size is not defined in the file schema field options or the file resource is not an image (jpg, png, gif), then the original file resource is returned unmodified. |
| token | String | Optional **file token** for granting access to **protected file(s)**.  For an example, you can check ["Files upload and handling"](files-handling/#protected-files.md). |
| download | Boolean | If it is set to a truthy value (*1*, *t*, *true*) the file will be served with `Content-Disposition: attachment` header instructing the browser to ignore the file preview for pdf, images, videos, etc. and to directly download the file. |

Responses 200 400 404  `[file resource]` `{
"status": 400,
"message": "Filesystem initialization failure.",
"data": {}
}` `{
"status": 404,
"message": "The requested resource wasn't found.",
"data": {}
}`   **[Generate protected file token](#generate-protected-file-token)**  

Generates a **short-lived file token** for accessing
**protected file(s)**.

The client must be admin or auth record authenticated (aka. have regular authorization token sent
with the request).

###### API details

**POST** /api/files/token Requires `Authorization:TOKEN` Responses 200 400  `{
"token": "..."
}` `{
"status": 400,
"message": "Failed to generate file token.",
"data": {}
}`  

---

  [Prev: API Realtime](api-realtime.md) [Next: API Collections](api-collections.md)  [FAQ](/faq) [Discussions](https://github.com/pocketbase/pocketbase/discussions) [Documentation](/docs) [JavaScript SDK](https://github.com/pocketbase/js-sdk) [Dart SDK](https://github.com/pocketbase/dart-sdk) Pocket**Base**   © 2023-2025 Pocket**Base** The Gopher artwork is from
[marcusolsson/gophers](https://github.com/marcusolsson/gophers)  Crafted by [**Gani**](https://gani.bg)   
