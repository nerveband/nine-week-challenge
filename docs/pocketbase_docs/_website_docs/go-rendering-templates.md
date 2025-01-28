






















































Extend with Go - Rendering templates - Docs - PocketBase


[![PocketBase logo](/images/logo.svg) Pocket**Base** v0.24.4](/)   Go JavaScript  Clear      [FAQ](/faq)  [Documentation](/docs)   [Introduction](/docs)   [Going to production](going-to-production.md)   [Web APIs reference](api-records.md)    [Extend with
  
 **Go**](go-overview.md) [Extend with
  
 **JavaScript**](js-overview.md) [Go Overview](go-overview.md)  [Go Event hooks](go-event-hooks.md)  [Go Routing](go-routing.md)  [Go Database](go-database.md)  [Go Record operations](go-records.md)  [Go Collection operations](go-collections.md)  [Go Migrations](go-migrations.md)  [Go Jobs scheduling](go-jobs-scheduling.md)  [Go Sending emails](go-sending-emails.md)  [Go Rendering templates](go-rendering-templates.md)  [Go Console commands](go-console-commands.md)  [Go Realtime messaging](go-realtime.md)  [Go Filesystem](go-filesystem.md)  [Go Logging](go-logging.md)  [Go Testing](go-testing.md)  [Go Miscellaneous](go-miscellaneous.md)  [Go Record proxy](go-record-proxy.md)   [JS Overview](js-overview.md)  [JS Event hooks](js-event-hooks.md)  [JS Routing](js-routing.md)  [JS Database](js-database.md)  [JS Record operations](js-records.md)  [JS Collection operations](js-collections.md)  [JS Migrations](js-migrations.md)  [JS Jobs scheduling](js-jobs-scheduling.md)  [JS Sending emails](js-sending-emails.md)  [JS Rendering templates](js-rendering-templates.md)  [JS Console commands](js-console-commands.md)  [JS Sending HTTP requests](js-sending-http-requests.md)  [JS Realtime messaging](js-realtime.md)  [JS Filesystem](js-filesystem.md)  [JS Logging](js-logging.md)  [JS Types reference](/jsvm/index.html)   Extend with Go - Rendering templates Rendering templates 

* [Overview](#overview)
* [Example HTML page with layout](#example-html-page-with-layout)
### [Overview](#overview)

A common task when creating custom routes or emails is the need of generating HTML output.

There are plenty of Go template-engines available that you can use for this, but often for simple cases
the Go standard library `html/template` package should work just fine.

To make it slightly easier to load template files concurrently and on the fly, PocketBase also provides a
thin wrapper around the standard library in the
[`github.com/pocketbase/pocketbase/tools/template`](https://pkg.go.dev/github.com/pocketbase/pocketbase/tools/template)
utility package.

`import "github.com/pocketbase/pocketbase/tools/template"
data := map[string]any{"name": "John"}
html, err := template.NewRegistry().LoadFiles(
"views/base.html",
"views/partial1.html",
"views/partial2.html",
).Render(data)`

The general flow when working with composed and nested templates is that you create "base" template(s)
that defines various placeholders using the
`{{template "placeholderName" .}}` or
`{{block "placeholderName" .}}default...{{end}}` actions.

Then in the partials, you define the content for those placeholders using the
`{{define "placeholderName"}}custom...{{end}}` action.

The dot object (`.`) in the above represents the data passed to the templates
via the `Render(data)` method.

By default the templates apply contextual (HTML, JS, CSS, URI) auto escaping so the generated template
content should be injection-safe. To render raw/verbatim trusted content in the templates you can use the
builtin `raw` function (e.g. `{{.content|raw}}`).

 

For more information about the template syntax please refer to the
[*html/template*](https://pkg.go.dev/html/template#hdr-A_fuller_picture)
and
[*text/template*](https://pkg.go.dev/text/template)
package godocs.
**Another great resource is also the Hashicorp's
[Learn Go Template Syntax](https://developer.hashicorp.com/nomad/tutorials/templates/go-template-syntax)
tutorial.**

### [Example HTML page with layout](#example-html-page-with-layout)

Consider the following app directory structure:

`myapp/
views/
layout.html
hello.html
main.go`

We define the content for `layout.html` as:

`<!DOCTYPE html>
<html lang="en">
<head>
<title>{{block "title" .}}Default app title{{end}}</title>
</head>
<body>
Header...
{{block "body" .}}
Default app body...
{{end}}
Footer...
</body>
</html>`

We define the content for `hello.html` as:

`{{define "title"}}
Page 1
{{end}}
{{define "body"}}
<p>Hello from {{.name}}</p>
{{end}}`

Then to output the final page, we'll register a custom `/hello/:name` route:

`// main.go
package main
import (
"log"
"net/http"
"github.com/pocketbase/pocketbase"
"github.com/pocketbase/pocketbase/core"
"github.com/pocketbase/pocketbase/tools/template"
)
func main() {
app := pocketbase.New()
app.OnServe().BindFunc(func(se *core.ServeEvent) error {
// this is safe to be used by multiple goroutines
// (it acts as store for the parsed templates)
registry := template.NewRegistry()
se.Router.GET("/hello/{name}", func(e *core.RequestEvent) error {
name := e.Request.PathValue("name")
html, err := registry.LoadFiles(
"views/layout.html",
"views/hello.html",
).Render(map[string]any{
"name": name,
})
if err != nil {
// or redirect to a dedicated 404 HTML page
return e.NotFoundError("", err)
}
return e.HTML(http.StatusOK, html)
})
return se.Next()
})
if err := app.Start(); err != nil {
log.Fatal(err)
}
}` 

---

  [Prev: Sending emails](go-sending-emails.md) [Next: Console commands](go-console-commands.md)  [FAQ](/faq) [Discussions](https://github.com/pocketbase/pocketbase/discussions) [Documentation](/docs) [JavaScript SDK](https://github.com/pocketbase/js-sdk) [Dart SDK](https://github.com/pocketbase/dart-sdk) Pocket**Base**   © 2023-2025 Pocket**Base** The Gopher artwork is from
[marcusolsson/gophers](https://github.com/marcusolsson/gophers)  Crafted by [**Gani**](https://gani.bg)   
