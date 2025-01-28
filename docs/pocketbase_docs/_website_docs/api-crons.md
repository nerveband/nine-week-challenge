
























































Web APIs reference - API Crons - Docs - PocketBase


[![PocketBase logo](/images/logo.svg) Pocket**Base** v0.24.4](/)   Go JavaScript  Clear      [FAQ](/faq)  [Documentation](/docs)   [Introduction](/docs)   [Going to production](going-to-production.md)   [Web APIs reference](api-records.md)  [├ API Records](api-records.md) [├ API Realtime](api-realtime.md) [├ API Files](api-files.md) [├ API Collections](api-collections.md) [├ API Settings](api-settings.md) [├ API Logs](api-logs.md) [├ API Crons](api-crons.md) [├ API Backups](api-backups.md) [└ API Health](api-health.md)   [Extend with
  
 **Go**](go-overview.md) [Extend with
  
 **JavaScript**](js-overview.md) [Go Overview](go-overview.md)  [Go Event hooks](go-event-hooks.md)  [Go Routing](go-routing.md)  [Go Database](go-database.md)  [Go Record operations](go-records.md)  [Go Collection operations](go-collections.md)  [Go Migrations](go-migrations.md)  [Go Jobs scheduling](go-jobs-scheduling.md)  [Go Sending emails](go-sending-emails.md)  [Go Rendering templates](go-rendering-templates.md)  [Go Console commands](go-console-commands.md)  [Go Realtime messaging](go-realtime.md)  [Go Filesystem](go-filesystem.md)  [Go Logging](go-logging.md)  [Go Testing](go-testing.md)  [Go Miscellaneous](go-miscellaneous.md)  [Go Record proxy](go-record-proxy.md)   [JS Overview](js-overview.md)  [JS Event hooks](js-event-hooks.md)  [JS Routing](js-routing.md)  [JS Database](js-database.md)  [JS Record operations](js-records.md)  [JS Collection operations](js-collections.md)  [JS Migrations](js-migrations.md)  [JS Jobs scheduling](js-jobs-scheduling.md)  [JS Sending emails](js-sending-emails.md)  [JS Rendering templates](js-rendering-templates.md)  [JS Console commands](js-console-commands.md)  [JS Sending HTTP requests](js-sending-http-requests.md)  [JS Realtime messaging](js-realtime.md)  [JS Filesystem](js-filesystem.md)  [JS Logging](js-logging.md)  [JS Types reference](/jsvm/index.html)   Web APIs reference - API Crons API Crons  **[List cron jobs](#list-cron-jobs)**  

Returns list with all registered app level cron jobs.

Only superusers can perform this action.

 JavaScript Dart  `import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');
...
await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');
const jobs = await pb.crons.getFullList();` `import 'package:pocketbase/pocketbase.dart';
final pb = PocketBase('http://127.0.0.1:8090');
...
await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');
final jobs = await pb.crons.getFullList();` 
###### API details

**GET** /api/crons Query parameters

| Param | Type | Description |
| --- | --- | --- |
| fields | String | Comma separated string of the fields to return in the JSON response *(by default returns all fields)*. Ex.: `?fields=*,expand.relField.name`  `*` targets all keys from the specific depth level.  In addition, the following field modifiers are also supported:   * `:excerpt(maxLength, withEllipsis?)`    Returns a short plain text version of the field string value.      Ex.:   `?fields=*,description:excerpt(200,true)` |

Responses 200 400 401 403  `[
{
"id": "__pbDBOptimize__",
"expression": "0 0 * * *"
},
{
"id": "__pbMFACleanup__",
"expression": "0 * * * *"
},
{
"id": "__pbOTPCleanup__",
"expression": "0 * * * *"
},
{
"id": "__pbLogsCleanup__",
"expression": "0 */6 * * *"
}
]` `{
"status": 400,
"message": "Failed to load backups filesystem.",
"data": {}
}` `{
"status": 401,
"message": "The request requires valid record authorization token.",
"data": {}
}` `{
"status": 403,
"message": "Only superusers can perform this action.",
"data": {}
}`   **[Run cron job](#run-cron-job)**  

Triggers a single cron job by its id.

Only superusers can perform this action.

 JavaScript Dart  `import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');
...
await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');
await pb.crons.run('__pbLogsCleanup__');` `import 'package:pocketbase/pocketbase.dart';
final pb = PocketBase('http://127.0.0.1:8090');
...
await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');
await pb.crons.run('__pbLogsCleanup__');` 
###### API details

**POST** /api/crons/`jobId` Requires `Authorization:TOKEN` Path parameters

| Param | Type | Description |
| --- | --- | --- |
| jobId | String | The identifier of the cron job to run. |

Responses 204 401 403 404  `null` `{
"status": 401,
"message": "The request requires valid record authorization token.",
"data": {}
}` `{
"status": 403,
"message": "The authorized record is not allowed to perform this action.",
"data": {}
}` `{
"status": 404,
"message": "Missing or invalid cron job.",
"data": {}
}`  

---

  [Prev: API Logs](api-logs.md) [Next: API Backups](api-backups.md)  [FAQ](/faq) [Discussions](https://github.com/pocketbase/pocketbase/discussions) [Documentation](/docs) [JavaScript SDK](https://github.com/pocketbase/js-sdk) [Dart SDK](https://github.com/pocketbase/dart-sdk) Pocket**Base**   © 2023-2025 Pocket**Base** The Gopher artwork is from
[marcusolsson/gophers](https://github.com/marcusolsson/gophers)  Crafted by [**Gani**](https://gani.bg)   
