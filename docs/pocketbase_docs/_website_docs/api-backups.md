
























































Web APIs reference - API Backups - Docs - PocketBase


[![PocketBase logo](/images/logo.svg) Pocket**Base** v0.24.4](/)   Go JavaScript  Clear      [FAQ](/faq)  [Documentation](/docs)   [Introduction](/docs)   [Going to production](going-to-production.md)   [Web APIs reference](api-records.md)  [├ API Records](api-records.md) [├ API Realtime](api-realtime.md) [├ API Files](api-files.md) [├ API Collections](api-collections.md) [├ API Settings](api-settings.md) [├ API Logs](api-logs.md) [├ API Crons](api-crons.md) [├ API Backups](api-backups.md) [└ API Health](api-health.md)   [Extend with
  
 **Go**](go-overview.md) [Extend with
  
 **JavaScript**](js-overview.md) [Go Overview](go-overview.md)  [Go Event hooks](go-event-hooks.md)  [Go Routing](go-routing.md)  [Go Database](go-database.md)  [Go Record operations](go-records.md)  [Go Collection operations](go-collections.md)  [Go Migrations](go-migrations.md)  [Go Jobs scheduling](go-jobs-scheduling.md)  [Go Sending emails](go-sending-emails.md)  [Go Rendering templates](go-rendering-templates.md)  [Go Console commands](go-console-commands.md)  [Go Realtime messaging](go-realtime.md)  [Go Filesystem](go-filesystem.md)  [Go Logging](go-logging.md)  [Go Testing](go-testing.md)  [Go Miscellaneous](go-miscellaneous.md)  [Go Record proxy](go-record-proxy.md)   [JS Overview](js-overview.md)  [JS Event hooks](js-event-hooks.md)  [JS Routing](js-routing.md)  [JS Database](js-database.md)  [JS Record operations](js-records.md)  [JS Collection operations](js-collections.md)  [JS Migrations](js-migrations.md)  [JS Jobs scheduling](js-jobs-scheduling.md)  [JS Sending emails](js-sending-emails.md)  [JS Rendering templates](js-rendering-templates.md)  [JS Console commands](js-console-commands.md)  [JS Sending HTTP requests](js-sending-http-requests.md)  [JS Realtime messaging](js-realtime.md)  [JS Filesystem](js-filesystem.md)  [JS Logging](js-logging.md)  [JS Types reference](/jsvm/index.html)   Web APIs reference - API Backups API Backups  **[List backups](#list-backups)**  

Returns list with all available backup files.

Only superusers can perform this action.

 JavaScript Dart  `import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');
...
await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');
const backups = await pb.backups.getFullList();` `import 'package:pocketbase/pocketbase.dart';
final pb = PocketBase('http://127.0.0.1:8090');
...
await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');
final backups = await pb.backups.getFullList();` 
###### API details

**GET** /api/backups Query parameters

| Param | Type | Description |
| --- | --- | --- |
| fields | String | Comma separated string of the fields to return in the JSON response *(by default returns all fields)*. Ex.: `?fields=*,expand.relField.name`  `*` targets all keys from the specific depth level.  In addition, the following field modifiers are also supported:   * `:excerpt(maxLength, withEllipsis?)`    Returns a short plain text version of the field string value.      Ex.:   `?fields=*,description:excerpt(200,true)` |

Responses 200 400 401 403  `[
{
"key": "pb_backup_20230519162514.zip",
"modified": "2023-05-19 16:25:57.542Z",
"size": 251316185
},
{
"key": "pb_backup_20230518162514.zip",
"modified": "2023-05-18 16:25:57.542Z",
"size": 251314010
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
}`   **[Create backup](#create-backup)**  

Creates a new app data backup.

This action will return an error if there is another backup/restore operation already in progress.

Only superusers can perform this action.

 JavaScript Dart  `import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');
...
await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');
await pb.backups.create('new_backup.zip');` `import 'package:pocketbase/pocketbase.dart';
final pb = PocketBase('http://127.0.0.1:8090');
...
await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');
await pb.backups.create('new_backup.zip');` 
###### API details

**POST** /api/backups Requires `Authorization:TOKEN` Body Parameters

| Param | Type | Description |
| --- | --- | --- |
| Optional name | String | The base name of the backup file to create.  Must be in the format `[a-z0-9_-].zip`  If not set, it will be auto generated. |

Body parameters could be sent as *JSON* or
*multipart/form-data*. Responses 204 400 401 403  `null` `{
"status": 400,
"message": "Try again later - another backup/restore process has already been started.",
"data": {}
}` `{
"status": 401,
"message": "The request requires valid record authorization token.",
"data": {}
}` `{
"status": 403,
"message": "The authorized record is not allowed to perform this action.",
"data": {}
}`   **[Upload backup](#upload-backup)**  

Uploads an existing backup zip file.

Only superusers can perform this action.

 JavaScript Dart  `import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');
...
await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');
await pb.backups.upload({ file: new Blob([...]) });` `import 'package:pocketbase/pocketbase.dart';
final pb = PocketBase('http://127.0.0.1:8090');
...
await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');
await pb.backups.upload(http.MultipartFile.fromBytes('file', ...));` 
###### API details

**POST** /api/backups/upload Requires `Authorization:TOKEN` Body Parameters

| Param | Type | Description |
| --- | --- | --- |
| Required file | File | The zip archive to upload. |

Uploading files is supported only via *multipart/form-data*. Responses 204 400 401 403  `null` `{
"status": 400,
"message": "Something went wrong while processing your request.",
"data": {
"file": {
"code": "validation_invalid_mime_type",
"message": "\"test_backup.txt\" mime type must be one of: application/zip."
}
}
}
}` `{
"status": 401,
"message": "The request requires valid record authorization token.",
"data": {}
}` `{
"status": 403,
"message": "The authorized record is not allowed to perform this action.",
"data": {}
}`   **[Delete backup](#delete-backup)**  

Deletes a single backup by its name.

This action will return an error if the backup to delete is still being generated or part of a
restore operation.

Only superusers can perform this action.

 JavaScript Dart  `import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');
...
await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');
await pb.backups.delete('pb_data_backup.zip');` `import 'package:pocketbase/pocketbase.dart';
final pb = PocketBase('http://127.0.0.1:8090');
...
await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');
await pb.backups.delete('pb_data_backup.zip');` 
###### API details

**DELETE** /api/backups/`key` Requires `Authorization:TOKEN` Path parameters

| Param | Type | Description |
| --- | --- | --- |
| key | String | The key of the backup file to delete. |

Responses 204 400 401 403  `null` `{
"status": 400,
"message": "Try again later - another backup/restore process has already been started.",
"data": {}
}` `{
"status": 401,
"message": "The request requires valid record authorization token.",
"data": {}
}` `{
"status": 403,
"message": "The authorized record is not allowed to perform this action.",
"data": {}
}`   **[Restore backup](#restore-backup)**  

Restore a single backup by its name and restarts the current running PocketBase process.

This action will return an error if there is another backup/restore operation already in progress.

Only superusers can perform this action.

 JavaScript Dart  `import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');
...
await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');
await pb.backups.restore('pb_data_backup.zip');` `import 'package:pocketbase/pocketbase.dart';
final pb = PocketBase('http://127.0.0.1:8090');
...
await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');
await pb.backups.restore('pb_data_backup.zip');` 
###### API details

**POST** /api/backups/`key`/restore Requires `Authorization:TOKEN` Path parameters

| Param | Type | Description |
| --- | --- | --- |
| key | String | The key of the backup file to restore. |

Responses 204 400 401 403  `null` `{
"status": 400,
"message": "Try again later - another backup/restore process has already been started.",
"data": {}
}` `{
"status": 401,
"message": "The request requires valid record authorization token.",
"data": {}
}` `{
"status": 403,
"message": "The authorized record is not allowed to perform this action.",
"data": {}
}`   **[Download backup](#download-backup)**  

Downloads a single backup file.

Only superusers can perform this action.

 JavaScript Dart  `import PocketBase from 'pocketbase';
const pb = new PocketBase('http://127.0.0.1:8090');
...
await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');
const token = await pb.files.getToken();
const url = pb.backups.getDownloadUrl(token, 'pb_data_backup.zip');` `import 'package:pocketbase/pocketbase.dart';
final pb = PocketBase('http://127.0.0.1:8090');
...
await pb.collection("_superusers").authWithPassword('test@example.com', '1234567890');
final token = await pb.files.getToken();
final url = pb.backups.getDownloadUrl(token, 'pb_data_backup.zip');` 
###### API details

**GET** /api/backups/`key` Path parameters

| Param | Type | Description |
| --- | --- | --- |
| key | String | The key of the backup file to download. |

Query parameters

| Param | Type | Description |
| --- | --- | --- |
| token | String | Admin **file token** for granting access to the **backup file**. |

Responses 200 400 404  `[file resource]` `{
"status": 400,
"message": "Filesystem initialization failure.",
"data": {}
}` `{
"status": 404,
"message": "The requested resource wasn't found.",
"data": {}
}`  

---

  [Prev: API Crons](api-crons.md) [Next: API Health](api-health.md)  [FAQ](/faq) [Discussions](https://github.com/pocketbase/pocketbase/discussions) [Documentation](/docs) [JavaScript SDK](https://github.com/pocketbase/js-sdk) [Dart SDK](https://github.com/pocketbase/dart-sdk) Pocket**Base**   © 2023-2025 Pocket**Base** The Gopher artwork is from
[marcusolsson/gophers](https://github.com/marcusolsson/gophers)  Crafted by [**Gani**](https://gani.bg)   
