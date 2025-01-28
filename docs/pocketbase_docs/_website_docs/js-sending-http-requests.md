






















































Extend with JavaScript - Sending HTTP requests - Docs - PocketBase


[![PocketBase logo](/images/logo.svg) Pocket**Base** v0.24.4](/)   Go JavaScript  Clear      [FAQ](/faq)  [Documentation](/docs)   [Introduction](/docs)   [Going to production](going-to-production.md)   [Web APIs reference](api-records.md)    [Extend with
  
 **Go**](go-overview.md) [Extend with
  
 **JavaScript**](js-overview.md) [Go Overview](go-overview.md)  [Go Event hooks](go-event-hooks.md)  [Go Routing](go-routing.md)  [Go Database](go-database.md)  [Go Record operations](go-records.md)  [Go Collection operations](go-collections.md)  [Go Migrations](go-migrations.md)  [Go Jobs scheduling](go-jobs-scheduling.md)  [Go Sending emails](go-sending-emails.md)  [Go Rendering templates](go-rendering-templates.md)  [Go Console commands](go-console-commands.md)  [Go Realtime messaging](go-realtime.md)  [Go Filesystem](go-filesystem.md)  [Go Logging](go-logging.md)  [Go Testing](go-testing.md)  [Go Miscellaneous](go-miscellaneous.md)  [Go Record proxy](go-record-proxy.md)   [JS Overview](js-overview.md)  [JS Event hooks](js-event-hooks.md)  [JS Routing](js-routing.md)  [JS Database](js-database.md)  [JS Record operations](js-records.md)  [JS Collection operations](js-collections.md)  [JS Migrations](js-migrations.md)  [JS Jobs scheduling](js-jobs-scheduling.md)  [JS Sending emails](js-sending-emails.md)  [JS Rendering templates](js-rendering-templates.md)  [JS Console commands](js-console-commands.md)  [JS Sending HTTP requests](js-sending-http-requests.md)  [JS Realtime messaging](js-realtime.md)  [JS Filesystem](js-filesystem.md)  [JS Logging](js-logging.md)  [JS Types reference](/jsvm/index.html)   Extend with JavaScript - Sending HTTP requests Sending HTTP requests 

* [Overview](#overview)
  + [multipart/form-data requests](#multipartform-data-requests)
* [Limitations](#limitations)
### [Overview](#overview)

You can use the global `$http.send(config)` helper to send HTTP requests to external services.
  

This could be used for example to retrieve data from external data sources, to make custom requests to a payment
provider API, etc.

Below is a list with all currently supported config options and their defaults.

`// throws on timeout or network connectivity error
const res = $http.send({
url: "",
method: "GET",
body: "", // ex. JSON.stringify({"test": 123}) or new FormData()
headers: {}, // ex. {"content-type": "application/json"}
timeout: 120, // in seconds
})
console.log(res.headers) // the response headers (ex. res.headers['X-Custom'][0])
console.log(res.cookies) // the response cookies (ex. res.cookies.sessionId.value)
console.log(res.statusCode) // the response HTTP status code
console.log(res.raw) // the response body as plain text
console.log(res.json) // the response body as parsed json array or map`

Here is an example that will enrich a single book record with some data based on its ISBN details from
openlibrary.org.

`onRecordBeforeCreateRequest((e) => {
const isbn = e.record.get("isbn");
// try to update with the published date from the openlibrary API
try {
const res = $http.send({
url: "https://openlibrary.org/isbn/" + isbn + ".json",
headers: {"content-type": "application/json"}
})
if (res.statusCode == 200) {
e.record.set("published", res.json.publish_date)
}
} catch (err) {
console.log("request failed", err);
}
}, "books")`
##### [multipart/form-data requests](#multipartform-data-requests)

In order to send `multipart/form-data` requests (ex. uploading files) the request
`body` must be a `FormData` instance.

PocketBase JSVM's `FormData` has the same APIs as its
[browser equivalent](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
with the main difference that for file values instead of `Blob` it accepts
[`$filesystem.File`](/jsvm/modules/_filesystem.html).

`const formData = new FormData();
formData.append("title", "Hello world!")
formData.append("documents", $filesystem.fileFromBytes("doc1", "doc1.txt"))
formData.append("documents", $filesystem.fileFromBytes("doc2", "doc2.txt"))
const res = $http.send({
url: "https://...",
method: "POST",
body: formData,
})
console.log(res.statusCode)`
### [Limitations](#limitations)

As of now there is no support for streamed responses or server-sent events (SSE). The
`$http.send` call blocks and returns the entire response body at once.

For this and other more advanced use cases you'll have to
[extend PocketBase with Go](go-overview/.md).

 

---

  [Prev: Console commands](js-console-commands.md) [Next: Realtime messaging](js-realtime.md)  [FAQ](/faq) [Discussions](https://github.com/pocketbase/pocketbase/discussions) [Documentation](/docs) [JavaScript SDK](https://github.com/pocketbase/js-sdk) [Dart SDK](https://github.com/pocketbase/dart-sdk) Pocket**Base**   © 2023-2025 Pocket**Base** The Gopher artwork is from
[marcusolsson/gophers](https://github.com/marcusolsson/gophers)  Crafted by [**Gani**](https://gani.bg)   
