





















































Extend with JavaScript - Realtime messaging - Docs - PocketBase


[![PocketBase logo](/images/logo.svg) Pocket**Base** v0.24.4](/)   Go JavaScript  Clear      [FAQ](/faq)  [Documentation](/docs)   [Introduction](/docs)   [Going to production](going-to-production.md)   [Web APIs reference](api-records.md)    [Extend with
  
 **Go**](go-overview.md) [Extend with
  
 **JavaScript**](js-overview.md) [Go Overview](go-overview.md)  [Go Event hooks](go-event-hooks.md)  [Go Routing](go-routing.md)  [Go Database](go-database.md)  [Go Record operations](go-records.md)  [Go Collection operations](go-collections.md)  [Go Migrations](go-migrations.md)  [Go Jobs scheduling](go-jobs-scheduling.md)  [Go Sending emails](go-sending-emails.md)  [Go Rendering templates](go-rendering-templates.md)  [Go Console commands](go-console-commands.md)  [Go Realtime messaging](go-realtime.md)  [Go Filesystem](go-filesystem.md)  [Go Logging](go-logging.md)  [Go Testing](go-testing.md)  [Go Miscellaneous](go-miscellaneous.md)  [Go Record proxy](go-record-proxy.md)   [JS Overview](js-overview.md)  [JS Event hooks](js-event-hooks.md)  [JS Routing](js-routing.md)  [JS Database](js-database.md)  [JS Record operations](js-records.md)  [JS Collection operations](js-collections.md)  [JS Migrations](js-migrations.md)  [JS Jobs scheduling](js-jobs-scheduling.md)  [JS Sending emails](js-sending-emails.md)  [JS Rendering templates](js-rendering-templates.md)  [JS Console commands](js-console-commands.md)  [JS Sending HTTP requests](js-sending-http-requests.md)  [JS Realtime messaging](js-realtime.md)  [JS Filesystem](js-filesystem.md)  [JS Logging](js-logging.md)  [JS Types reference](/jsvm/index.html)   Extend with JavaScript - Realtime messaging Realtime messaging

By default PocketBase sends realtime events only for Record create/update/delete operations (*and for the OAuth2 auth redirect*), but you are free to send custom realtime messages to the connected clients via the
[`$app.subscriptionsBroker()`](/jsvm/functions/_app.subscriptionsBroker.html) instance.

[`$app.subscriptionsBroker().clients()`](/jsvm/interfaces/subscriptions.Broker.html#clients)
returns all connected
[`subscriptions.Client`](/jsvm/interfaces/subscriptions.Client.html)
indexed by their unique connection id.

The current auth record associated with a client could be accessed through
`client.get("auth")`

 

Note that a single authenticated user could have more than one active realtime connection (aka.
multiple clients). This could happen for example when opening the same app in different tabs,
browsers, devices, etc.

Below you can find a minimal code sample that sends a JSON payload to all clients subscribed to the
"example" topic:

`const message = new SubscriptionMessage({
name: "example",
data: JSON.stringify({ ... }),
});
const clients = $app.subscriptionsBroker().clients()
for (let client of clients) {
if (client.hasSubscription("example")) {
client.send(message)
}
}`

From the client-side, users can listen to the custom subscription topic by doing something like:

JavaScript Dart  `import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');
...
await pb.realtime.subscribe('example', (e) => {
console.log(e)
})` `import 'package:pocketbase/pocketbase.dart';
final pb = PocketBase('http://127.0.0.1:8090');
...
await pb.realtime.subscribe('example', (e) {
print(e)
})`  

---

  [Prev: Sending HTTP requests](js-sending-http-requests.md) [Next: Filesystem](js-filesystem.md)  [FAQ](/faq) [Discussions](https://github.com/pocketbase/pocketbase/discussions) [Documentation](/docs) [JavaScript SDK](https://github.com/pocketbase/js-sdk) [Dart SDK](https://github.com/pocketbase/dart-sdk) Pocket**Base**   © 2023-2025 Pocket**Base** The Gopher artwork is from
[marcusolsson/gophers](https://github.com/marcusolsson/gophers)  Crafted by [**Gani**](https://gani.bg)   
