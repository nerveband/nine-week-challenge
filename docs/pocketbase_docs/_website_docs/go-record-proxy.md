




















































Extend with Go - Record proxy - Docs - PocketBase


[![PocketBase logo](/images/logo.svg) Pocket**Base** v0.24.4](/)   Go JavaScript  Clear      [FAQ](/faq)  [Documentation](/docs)   [Introduction](/docs)   [Going to production](going-to-production.md)   [Web APIs reference](api-records.md)    [Extend with
  
 **Go**](go-overview.md) [Extend with
  
 **JavaScript**](js-overview.md) [Go Overview](go-overview.md)  [Go Event hooks](go-event-hooks.md)  [Go Routing](go-routing.md)  [Go Database](go-database.md)  [Go Record operations](go-records.md)  [Go Collection operations](go-collections.md)  [Go Migrations](go-migrations.md)  [Go Jobs scheduling](go-jobs-scheduling.md)  [Go Sending emails](go-sending-emails.md)  [Go Rendering templates](go-rendering-templates.md)  [Go Console commands](go-console-commands.md)  [Go Realtime messaging](go-realtime.md)  [Go Filesystem](go-filesystem.md)  [Go Logging](go-logging.md)  [Go Testing](go-testing.md)  [Go Miscellaneous](go-miscellaneous.md)  [Go Record proxy](go-record-proxy.md)   [JS Overview](js-overview.md)  [JS Event hooks](js-event-hooks.md)  [JS Routing](js-routing.md)  [JS Database](js-database.md)  [JS Record operations](js-records.md)  [JS Collection operations](js-collections.md)  [JS Migrations](js-migrations.md)  [JS Jobs scheduling](js-jobs-scheduling.md)  [JS Sending emails](js-sending-emails.md)  [JS Rendering templates](js-rendering-templates.md)  [JS Console commands](js-console-commands.md)  [JS Sending HTTP requests](js-sending-http-requests.md)  [JS Realtime messaging](js-realtime.md)  [JS Filesystem](js-filesystem.md)  [JS Logging](js-logging.md)  [JS Types reference](/jsvm/index.html)   Extend with Go - Record proxy Record proxy  

There are plans to introduce `go:generate` scripts to automate the generation of record
proxies in the near future.

The available [`core.Record` and its helpers](go-records.md)
are usually the recommended way to interact with your data, but in case you want a typed access to your record
fields you can create a helper struct that embeds
[`core.BaseRecordProxy`](https://pkg.go.dev/github.com/pocketbase/pocketbase/core#BaseRecordProxy) *(which implements the `core.RecordProxy` interface)* and define your collection fields as
getters and setters.

By implementing the `core.RecordProxy` interface you can use your custom struct as part of a
`RecordQuery` result like a regular record model. In addition, every DB change through the proxy
struct will trigger the corresponding record validations and hooks. This ensures that other parts of your app,
including 3rd party plugins, that don't know or use your custom struct will still work as expected.

Below is a sample `Article` record proxy implementation:

`// article.go
package main
import (
"github.com/pocketbase/pocketbase/core"
"github.com/pocketbase/pocketbase/tools/types"
)
// ensures that the Article struct satisfy the core.RecordProxy interface
var _ core.RecordProxy = (*Article)(nil)
type Article struct {
core.BaseRecordProxy
}
func (a *Article) Title() string {
return a.GetString("title")
}
func (a *Article) SetTitle(title string) {
a.Set("title", title)
}
func (a *Article) Slug() string {
return a.GetString("slug")
}
func (a *Article) SetSlug(slug string) {
a.Set("slug", slug)
}
func (a *Article) Created() types.DateTime {
return a.GetDateTime("created")
}
func (a *Article) Updated() types.DateTime {
return a.GetDateTime("updated")
}`

Accessing and modifying the proxy records is the same as for the regular records. Continuing with the
above `Article` example:

`func FindArticleBySlug(app core.App, slug string) (*Article, error) {
article := &Article{}
err := app.RecordQuery("articles").
AndWhere(dbx.NewExp("LOWER(slug)={:slug}", dbx.Params{
"slug": strings.ToLower(slug), // case insensitive match
})).
Limit(1).
One(article)
if err != nil {
return nil, err
}
return article, nil
}
...
article, err := FindArticleBySlug(app, "example")
if err != nil {
return err
}
// change the title
article.SetTitle("Lorem ipsum...")
// persist the change while also triggering the original record validations and hooks
err = app.Save(article)
if err != nil {
return err
}`

If you have an existing `*core.Record` value you can also load it into your proxy using the
`SetProxyRecord` method:

`// fetch regular record
record, err := app.FindRecordById("articles", "RECORD_ID")
if err != nil {
return err
}
// load into proxy
article := &Article{}
article.SetProxyRecord(record)` 

---

  [Prev: Miscellaneous](go-miscellaneous.md)  [FAQ](/faq) [Discussions](https://github.com/pocketbase/pocketbase/discussions) [Documentation](/docs) [JavaScript SDK](https://github.com/pocketbase/js-sdk) [Dart SDK](https://github.com/pocketbase/dart-sdk) Pocket**Base**   © 2023-2025 Pocket**Base** The Gopher artwork is from
[marcusolsson/gophers](https://github.com/marcusolsson/gophers)  Crafted by [**Gani**](https://gani.bg)   
