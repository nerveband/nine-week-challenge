


























































Web APIs reference - API Logs - Docs - PocketBase


[![PocketBase logo](/images/logo.svg) Pocket**Base** v0.24.4](/)   Go JavaScript  Clear      [FAQ](/faq)  [Documentation](/docs)   [Introduction](/docs)   [Going to production](going-to-production.md)   [Web APIs reference](api-records.md)  [├ API Records](api-records.md) [├ API Realtime](api-realtime.md) [├ API Files](api-files.md) [├ API Collections](api-collections.md) [├ API Settings](api-settings.md) [├ API Logs](api-logs.md) [├ API Crons](api-crons.md) [├ API Backups](api-backups.md) [└ API Health](api-health.md)   [Extend with
  
 **Go**](go-overview.md) [Extend with
  
 **JavaScript**](js-overview.md) [Go Overview](go-overview.md)  [Go Event hooks](go-event-hooks.md)  [Go Routing](go-routing.md)  [Go Database](go-database.md)  [Go Record operations](go-records.md)  [Go Collection operations](go-collections.md)  [Go Migrations](go-migrations.md)  [Go Jobs scheduling](go-jobs-scheduling.md)  [Go Sending emails](go-sending-emails.md)  [Go Rendering templates](go-rendering-templates.md)  [Go Console commands](go-console-commands.md)  [Go Realtime messaging](go-realtime.md)  [Go Filesystem](go-filesystem.md)  [Go Logging](go-logging.md)  [Go Testing](go-testing.md)  [Go Miscellaneous](go-miscellaneous.md)  [Go Record proxy](go-record-proxy.md)   [JS Overview](js-overview.md)  [JS Event hooks](js-event-hooks.md)  [JS Routing](js-routing.md)  [JS Database](js-database.md)  [JS Record operations](js-records.md)  [JS Collection operations](js-collections.md)  [JS Migrations](js-migrations.md)  [JS Jobs scheduling](js-jobs-scheduling.md)  [JS Sending emails](js-sending-emails.md)  [JS Rendering templates](js-rendering-templates.md)  [JS Console commands](js-console-commands.md)  [JS Sending HTTP requests](js-sending-http-requests.md)  [JS Realtime messaging](js-realtime.md)  [JS Filesystem](js-filesystem.md)  [JS Logging](js-logging.md)  [JS Types reference](/jsvm/index.html)   Web APIs reference - API Logs API Logs  **[List logs](#list-logs)**  

Returns a paginated logs list.

Only superusers can perform this action.

 JavaScript Dart  `import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');
...
await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');
const pageResult = await pb.logs.getList(1, 20, {
filter: 'data.status >= 400'
});` `import 'package:pocketbase/pocketbase.dart';
final pb = PocketBase('http://127.0.0.1:8090');
...
await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');
final pageResult = await pb.logs.getList(
page: 1,
perPage: 20,
filter: 'data.status >= 400',
);` 
###### API details

**GET** /api/logs Requires `Authorization:TOKEN` Query parameters

| Param | Type | Description |
| --- | --- | --- |
| page | Number | The page (aka. offset) of the paginated list (*default to 1*). |
| perPage | Number | The max returned logs per page (*default to 30*). |
| sort | String | Specify the *ORDER BY* fields.  Add `-` / `+` (default) in front of the attribute for DESC / ASC order, e.g.: `// DESC by the insertion rowid and ASC by level ?sort=-rowid,level` **Supported log sort fields:**  `@random`, `rowid`, `id`, `created`, `updated`, `level`, `message` and any `data.*` attribute. |
| filter | String | Filter expression to filter/search the returned logs list, e.g.: `?filter=(data.url~'test.com' && level>0)` **Supported log filter fields:**  `id`, `created`, `updated`, `level`, `message` and any `data.*` attribute.  The syntax basically follows the format `OPERAND OPERATOR OPERAND`, where:   * `OPERAND` - could be any field literal, string (single or double quoted),   number, null, true, false * `OPERATOR` - is one of:   + `=` Equal   + `!=` NOT equal   + `>` Greater than   + `>=` Greater than or equal   + `<` Less than   + `<=` Less than or equal   + `~` Like/Contains (if not specified auto wraps the right string OPERAND in a "%" for wildcard     match)   + `!~` NOT Like/Contains (if not specified auto wraps the right string OPERAND in a "%" for     wildcard match)   + `?=` *Any/At least one of* Equal   + `?!=` *Any/At least one of* NOT equal   + `?>` *Any/At least one of* Greater than   + `?>=` *Any/At least one of* Greater than or equal   + `?<` *Any/At least one of* Less than   + `?<=` *Any/At least one of* Less than or equal   + `?~` *Any/At least one of* Like/Contains (if not specified auto wraps the right string OPERAND in a "%" for wildcard     match)   + `?!~` *Any/At least one of* NOT Like/Contains (if not specified auto wraps the right string OPERAND in a "%" for     wildcard match)   To group and combine several expressions you can use parenthesis `(...)`, `&&` (AND) and `||` (OR) tokens.  Single line comments are also supported: `// Example comment`. |
| fields | String | Comma separated string of the fields to return in the JSON response *(by default returns all fields)*. Ex.: `?fields=*,expand.relField.name`  `*` targets all keys from the specific depth level.  In addition, the following field modifiers are also supported:   * `:excerpt(maxLength, withEllipsis?)`    Returns a short plain text version of the field string value.      Ex.:   `?fields=*,description:excerpt(200,true)` |

Responses 200 400 401 403  `{
"page": 1,
"perPage": 20,
"totalItems": 2,
"items": [
{
"id": "ai5z3aoed6809au",
"created": "2024-10-27 09:28:19.524Z",
"data": {
"auth": "_superusers",
"execTime": 2.392327,
"method": "GET",
"referer": "http://localhost:8090/_/",
"remoteIP": "127.0.0.1",
"status": 200,
"type": "request",
"url": "/api/collections/_pbc_2287844090/records?page=1&perPage=1&filter=&fields=id",
"userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
"userIP": "127.0.0.1"
},
"message": "GET /api/collections/_pbc_2287844090/records?page=1&perPage=1&filter=&fields=id",
"level": 0
},
{
"id": "26apis4s3sm9yqm",
"created": "2024-10-27 09:28:19.524Z",
"data": {
"auth": "_superusers",
"execTime": 2.392327,
"method": "GET",
"referer": "http://localhost:8090/_/",
"remoteIP": "127.0.0.1",
"status": 200,
"type": "request",
"url": "/api/collections/_pbc_2287844090/records?page=1&perPage=1&filter=&fields=id",
"userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
"userIP": "127.0.0.1"
},
"message": "GET /api/collections/_pbc_2287844090/records?page=1&perPage=1&filter=&fields=id",
"level": 0
}
]
}` `{
"status": 400,
"message": "Something went wrong while processing your request. Invalid filter.",
"data": {}
}` `{
"status": 401,
"message": "The request requires valid record authorization token.",
"data": {}
}` `{
"status": 403,
"message": "The authorized record is not allowed to perform this action.",
"data": {}
}`   **[View log](#view-log)**  

Returns a single log by its ID.

Only superusers can perform this action.

 JavaScript Dart  `import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');
...
await pb.collection("_superusers").authWithEmail('test@example.com', '123456');
const log = await pb.logs.getOne('LOG_ID');` `import 'package:pocketbase/pocketbase.dart';
final pb = PocketBase('http://127.0.0.1:8090');
...
await pb.collection("_superusers").authWithEmail('test@example.com', '123456');
final log = await pb.logs.getOne('LOG_ID');` 
###### API details

**GET** /api/logs/`id` Requires `Authorization:TOKEN` Path parameters

| Param | Type | Description |
| --- | --- | --- |
| id | String | ID of the log to view. |

Query parameters

| Param | Type | Description |
| --- | --- | --- |
| fields | String | Comma separated string of the fields to return in the JSON response *(by default returns all fields)*. Ex.: `?fields=*,expand.relField.name`  `*` targets all keys from the specific depth level.  In addition, the following field modifiers are also supported:   * `:excerpt(maxLength, withEllipsis?)`    Returns a short plain text version of the field string value.      Ex.:   `?fields=*,description:excerpt(200,true)` |

Responses 200 401 403 404  `{
"id": "ai5z3aoed6809au",
"created": "2024-10-27 09:28:19.524Z",
"data": {
"auth": "_superusers",
"execTime": 2.392327,
"method": "GET",
"referer": "http://localhost:8090/_/",
"remoteIP": "127.0.0.1",
"status": 200,
"type": "request",
"url": "/api/collections/_pbc_2287844090/records?page=1&perPage=1&filter=&fields=id",
"userAgent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
"userIP": "127.0.0.1"
},
"message": "GET /api/collections/_pbc_2287844090/records?page=1&perPage=1&filter=&fields=id",
"level": 0
}` `{
"status": 401,
"message": "The request requires valid record authorization token.",
"data": {}
}` `{
"status": 403,
"message": "The authorized record is not allowed to perform this action.",
"data": {}
}` `{
"status": 404,
"message": "The requested resource wasn't found.",
"data": {}
}`   **[Logs statistics](#logs-statistics)**  

Returns hourly aggregated logs statistics.

Only superusers can perform this action.

 JavaScript Dart  `import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');
...
await pb.collection("_superusers").authWithPassword('test@example.com', '123456');
const stats = await pb.logs.getStats({
filter: 'data.status >= 400'
});` `import 'package:pocketbase/pocketbase.dart';
final pb = PocketBase('http://127.0.0.1:8090');
...
await pb.collection("_superusers").authWithPassword('test@example.com', '123456');
final stats = await pb.logs.getStats(
filter: 'data.status >= 400'
);` 
###### API details

**GET** /api/logs/stats Requires `Authorization:TOKEN` Query parameters

| Param | Type | Description |
| --- | --- | --- |
| filter | String | Filter expression to filter/search the logs, e.g.: `?filter=(data.url~'test.com' && level>0)` **Supported log filter fields:**  `rowid`, `id`, `created`, `updated`, `level`, `message` and any `data.*` attribute.  The syntax basically follows the format `OPERAND OPERATOR OPERAND`, where:   * `OPERAND` - could be any field literal, string (single or double quoted),   number, null, true, false * `OPERATOR` - is one of:   + `=` Equal   + `!=` NOT equal   + `>` Greater than   + `>=` Greater than or equal   + `<` Less than   + `<=` Less than or equal   + `~` Like/Contains (if not specified auto wraps the right string OPERAND in a "%" for wildcard     match)   + `!~` NOT Like/Contains (if not specified auto wraps the right string OPERAND in a "%" for     wildcard match)   + `?=` *Any/At least one of* Equal   + `?!=` *Any/At least one of* NOT equal   + `?>` *Any/At least one of* Greater than   + `?>=` *Any/At least one of* Greater than or equal   + `?<` *Any/At least one of* Less than   + `?<=` *Any/At least one of* Less than or equal   + `?~` *Any/At least one of* Like/Contains (if not specified auto wraps the right string OPERAND in a "%" for wildcard     match)   + `?!~` *Any/At least one of* NOT Like/Contains (if not specified auto wraps the right string OPERAND in a "%" for     wildcard match)   To group and combine several expressions you can use parenthesis `(...)`, `&&` (AND) and `||` (OR) tokens.  Single line comments are also supported: `// Example comment`. |
| fields | String | Comma separated string of the fields to return in the JSON response *(by default returns all fields)*. Ex.: `?fields=*,expand.relField.name`  `*` targets all keys from the specific depth level.  In addition, the following field modifiers are also supported:   * `:excerpt(maxLength, withEllipsis?)`    Returns a short plain text version of the field string value.      Ex.:   `?fields=*,description:excerpt(200,true)` |

Responses 200 400 401 403  `[
{
"total": 4,
"date": "2022-06-01 19:00:00.000"
},
{
"total": 1,
"date": "2022-06-02 12:00:00.000"
},
{
"total": 8,
"date": "2022-06-02 13:00:00.000"
}
]` `{
"status": 400,
"message": "Something went wrong while processing your request. Invalid filter.",
"data": {}
}` `{
"status": 401,
"message": "The request requires valid record authorization token.",
"data": {}
}` `{
"status": 403,
"message": "The authorized record is not allowed to perform this action.",
"data": {}
}`  

---

  [Prev: API Settings](api-settings.md) [Next: API Crons](api-crons.md)  [FAQ](/faq) [Discussions](https://github.com/pocketbase/pocketbase/discussions) [Documentation](/docs) [JavaScript SDK](https://github.com/pocketbase/js-sdk) [Dart SDK](https://github.com/pocketbase/dart-sdk) Pocket**Base**   © 2023-2025 Pocket**Base** The Gopher artwork is from
[marcusolsson/gophers](https://github.com/marcusolsson/gophers)  Crafted by [**Gani**](https://gani.bg)   
