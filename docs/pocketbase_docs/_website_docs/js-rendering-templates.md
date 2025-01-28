






















































Extend with JavaScript - Rendering templates - Docs - PocketBase


[![PocketBase logo](/images/logo.svg) Pocket**Base** v0.24.4](/)   Go JavaScript  Clear      [FAQ](/faq)  [Documentation](/docs)   [Introduction](/docs)   [Going to production](going-to-production.md)   [Web APIs reference](api-records.md)    [Extend with
  
 **Go**](go-overview.md) [Extend with
  
 **JavaScript**](js-overview.md) [Go Overview](go-overview.md)  [Go Event hooks](go-event-hooks.md)  [Go Routing](go-routing.md)  [Go Database](go-database.md)  [Go Record operations](go-records.md)  [Go Collection operations](go-collections.md)  [Go Migrations](go-migrations.md)  [Go Jobs scheduling](go-jobs-scheduling.md)  [Go Sending emails](go-sending-emails.md)  [Go Rendering templates](go-rendering-templates.md)  [Go Console commands](go-console-commands.md)  [Go Realtime messaging](go-realtime.md)  [Go Filesystem](go-filesystem.md)  [Go Logging](go-logging.md)  [Go Testing](go-testing.md)  [Go Miscellaneous](go-miscellaneous.md)  [Go Record proxy](go-record-proxy.md)   [JS Overview](js-overview.md)  [JS Event hooks](js-event-hooks.md)  [JS Routing](js-routing.md)  [JS Database](js-database.md)  [JS Record operations](js-records.md)  [JS Collection operations](js-collections.md)  [JS Migrations](js-migrations.md)  [JS Jobs scheduling](js-jobs-scheduling.md)  [JS Sending emails](js-sending-emails.md)  [JS Rendering templates](js-rendering-templates.md)  [JS Console commands](js-console-commands.md)  [JS Sending HTTP requests](js-sending-http-requests.md)  [JS Realtime messaging](js-realtime.md)  [JS Filesystem](js-filesystem.md)  [JS Logging](js-logging.md)  [JS Types reference](/jsvm/index.html)   Extend with JavaScript - Rendering templates Rendering templates 

* [Overview](#overview)
* [Example HTML page with layout](#example-html-page-with-layout)
### [Overview](#overview)

A common task when creating custom routes or emails is the need of generating HTML output. To assist with
this, PocketBase provides the global `$template` helper for parsing and rendering HTML templates.

`const html = $template.loadFiles(
`${__hooks}/views/base.html`,
`${__hooks}/views/partial1.html`,
`${__hooks}/views/partial2.html`,
).render(data)`

The general flow when working with composed and nested templates is that you create "base" template(s)
that defines various placeholders using the
`{{template "placeholderName" .}}` or
`{{block "placeholderName" .}}default...{{end}}` actions.

Then in the partials, you define the content for those placeholders using the
`{{define "placeholderName"}}custom...{{end}}` action.

The dot object (`.`) in the above represents the data passed to the templates
via the `render(data)` method.

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
pb_hooks/
views/
layout.html
hello.html
main.pb.js
pocketbase`

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

`routerAdd("get", "/hello/{name}", (e) => {
const name = e.request.pathValue("name")
const html = $template.loadFiles(
`${__hooks}/views/layout.html`,
`${__hooks}/views/hello.html`,
).render({
"name": name,
})
return e.html(200, html)
})` 

---

  [Prev: Sending emails](js-sending-emails.md) [Next: Console commands](js-console-commands.md)  [FAQ](/faq) [Discussions](https://github.com/pocketbase/pocketbase/discussions) [Documentation](/docs) [JavaScript SDK](https://github.com/pocketbase/js-sdk) [Dart SDK](https://github.com/pocketbase/dart-sdk) Pocket**Base**   © 2023-2025 Pocket**Base** The Gopher artwork is from
[marcusolsson/gophers](https://github.com/marcusolsson/gophers)  Crafted by [**Gani**](https://gani.bg)   
