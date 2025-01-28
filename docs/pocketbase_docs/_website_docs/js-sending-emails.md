






















































Extend with JavaScript - Sending emails - Docs - PocketBase


[![PocketBase logo](/images/logo.svg) Pocket**Base** v0.24.4](/)   Go JavaScript  Clear      [FAQ](/faq)  [Documentation](/docs)   [Introduction](/docs)   [Going to production](going-to-production.md)   [Web APIs reference](api-records.md)    [Extend with
  
 **Go**](go-overview.md) [Extend with
  
 **JavaScript**](js-overview.md) [Go Overview](go-overview.md)  [Go Event hooks](go-event-hooks.md)  [Go Routing](go-routing.md)  [Go Database](go-database.md)  [Go Record operations](go-records.md)  [Go Collection operations](go-collections.md)  [Go Migrations](go-migrations.md)  [Go Jobs scheduling](go-jobs-scheduling.md)  [Go Sending emails](go-sending-emails.md)  [Go Rendering templates](go-rendering-templates.md)  [Go Console commands](go-console-commands.md)  [Go Realtime messaging](go-realtime.md)  [Go Filesystem](go-filesystem.md)  [Go Logging](go-logging.md)  [Go Testing](go-testing.md)  [Go Miscellaneous](go-miscellaneous.md)  [Go Record proxy](go-record-proxy.md)   [JS Overview](js-overview.md)  [JS Event hooks](js-event-hooks.md)  [JS Routing](js-routing.md)  [JS Database](js-database.md)  [JS Record operations](js-records.md)  [JS Collection operations](js-collections.md)  [JS Migrations](js-migrations.md)  [JS Jobs scheduling](js-jobs-scheduling.md)  [JS Sending emails](js-sending-emails.md)  [JS Rendering templates](js-rendering-templates.md)  [JS Console commands](js-console-commands.md)  [JS Sending HTTP requests](js-sending-http-requests.md)  [JS Realtime messaging](js-realtime.md)  [JS Filesystem](js-filesystem.md)  [JS Logging](js-logging.md)  [JS Types reference](/jsvm/index.html)   Extend with JavaScript - Sending emails Sending emails

PocketBase provides a simple abstraction for sending emails via the
`$app.newMailClient()` helper.

Depending on your configured mail settings (*Dashboard > Settings > Mail settings*) it will use the
`sendmail` command or a SMTP client.

* [Send custom email](#send-custom-email)
* [Overwrite system emails](#overwrite-system-emails)
### [Send custom email](#send-custom-email)

You can send your own custom emails from everywhere within the app (hooks, middlewares, routes, etc.) by
using `$app.newMailClient().send(message)`. Here is an example of sending a custom email after
user registration:

`onRecordCreateRequest((e) => {
e.next()
const message = new MailerMessage({
from: {
address: e.app.settings().meta.senderAddress,
name: e.app.settings().meta.senderName,
},
to: [{address: e.record.email()}],
subject: "YOUR_SUBJECT...",
html: "YOUR_HTML_BODY...",
// bcc, cc and custom headers are also supported...
})
e.app.newMailClient().send(message)
}, "users")`
### [Overwrite system emails](#overwrite-system-emails)

If you want to overwrite the default system emails for forgotten password, verification, etc., you can
adjust the default templates available from the
*Dashboard > Collections > Edit collection > Options*
.

Alternatively, you can also apply individual changes by binding to one of the
[mailer hooks](js-event-hooks/#mailer-hooks.md). Here is an example of appending a Record
field value to the subject using the `onMailerRecordPasswordResetSend` hook:

`onMailerRecordPasswordResetSend((e) => {
// modify the subject
e.message.subject += (" " + e.record.get("name"))
e.next()
})` 

---

  [Prev: Jobs scheduling](js-jobs-scheduling.md) [Next: Rendering templates](js-rendering-templates.md)  [FAQ](/faq) [Discussions](https://github.com/pocketbase/pocketbase/discussions) [Documentation](/docs) [JavaScript SDK](https://github.com/pocketbase/js-sdk) [Dart SDK](https://github.com/pocketbase/dart-sdk) Pocket**Base**   © 2023-2025 Pocket**Base** The Gopher artwork is from
[marcusolsson/gophers](https://github.com/marcusolsson/gophers)  Crafted by [**Gani**](https://gani.bg)   
