























































Extend with JavaScript - Collection operations - Docs - PocketBase


[![PocketBase logo](/images/logo.svg) Pocket**Base** v0.24.4](/)   Go JavaScript  Clear      [FAQ](/faq)  [Documentation](/docs)   [Introduction](/docs)   [Going to production](going-to-production.md)   [Web APIs reference](api-records.md)    [Extend with
  
 **Go**](go-overview.md) [Extend with
  
 **JavaScript**](js-overview.md) [Go Overview](go-overview.md)  [Go Event hooks](go-event-hooks.md)  [Go Routing](go-routing.md)  [Go Database](go-database.md)  [Go Record operations](go-records.md)  [Go Collection operations](go-collections.md)  [Go Migrations](go-migrations.md)  [Go Jobs scheduling](go-jobs-scheduling.md)  [Go Sending emails](go-sending-emails.md)  [Go Rendering templates](go-rendering-templates.md)  [Go Console commands](go-console-commands.md)  [Go Realtime messaging](go-realtime.md)  [Go Filesystem](go-filesystem.md)  [Go Logging](go-logging.md)  [Go Testing](go-testing.md)  [Go Miscellaneous](go-miscellaneous.md)  [Go Record proxy](go-record-proxy.md)   [JS Overview](js-overview.md)  [JS Event hooks](js-event-hooks.md)  [JS Routing](js-routing.md)  [JS Database](js-database.md)  [JS Record operations](js-records.md)  [JS Collection operations](js-collections.md)  [JS Migrations](js-migrations.md)  [JS Jobs scheduling](js-jobs-scheduling.md)  [JS Sending emails](js-sending-emails.md)  [JS Rendering templates](js-rendering-templates.md)  [JS Console commands](js-console-commands.md)  [JS Sending HTTP requests](js-sending-http-requests.md)  [JS Realtime messaging](js-realtime.md)  [JS Filesystem](js-filesystem.md)  [JS Logging](js-logging.md)  [JS Types reference](/jsvm/index.html)   Extend with JavaScript - Collection operations Collection operations

Collections are usually managed via the Dashboard interface, but there are some situations where you may
want to create or edit a collection programmatically (usually as part of a
[DB migration](js-migrations.md)). You can find all available Collection related operations
and methods in
[`$app`](/jsvm/modules/_app.html)
and
[`Collection`](/jsvm/classes/Collection.html)
, but below are listed some of the most common ones:

* [Fetch collections](#fetch-collections)
  + [Fetch single collection](#fetch-single-collection)
  + [Fetch multiple collections](#fetch-multiple-collections)
  + [Custom collection query](#custom-collection-query)
* [Field definitions](#field-definitions)
* [Create new collection](#create-new-collection)
* [Update existing collection](#update-existing-collection)
* [Delete collection](#delete-collection)
### [Fetch collections](#fetch-collections)

##### [Fetch single collection](#fetch-single-collection)

All single collection retrieval methods throw an error if no collection is found.

`let collection = $app.findCollectionByNameOrId("example")`
##### [Fetch multiple collections](#fetch-multiple-collections)

All multiple collections retrieval methods return an empty array if no collections are found.

`let allCollections = $app.findAllCollections(/* optional types */)
// only specific types
let authAndViewCollections := $app.findAllCollections("auth", "view")`
##### [Custom collection query](#custom-collection-query)

In addition to the above query helpers, you can also create custom Collection queries using
[`$app.collectionQuery()`](/jsvm/functions/_app.collectionQuery.html)
method. It returns a SELECT DB builder that can be used with the same methods described in the
[Database guide](js-database.md).

`let collections = arrayOf(new Collection)
$app.collectionQuery().
andWhere($dbx.hashExp({"viewRule": null})).
orderBy("created DESC").
all(collections)`
### [Field definitions](#field-definitions)

 

All collection fields *(with exception of the `JSONField`)* are non-nullable and
uses a zero-default for their respective type as fallback value when missing.

* [`new BoolField({ ... })`](/jsvm/classes/BoolField.html)
* [`new NumberField({ ... })`](/jsvm/classes/NumberField.html)
* [`new TextField({ ... })`](/jsvm/classes/TextField.html)
* [`new EmailField({ ... })`](/jsvm/classes/EmailField.html)
* [`new URLField({ ... })`](/jsvm/classes/URLField.html)
* [`new EditorField({ ... })`](/jsvm/classes/EditorField.html)
* [`new DateField({ ... })`](/jsvm/classes/DateField.html)
* [`new AutodateField({ ... })`](/jsvm/classes/AutodateField.html)
* [`new SelectField({ ... })`](/jsvm/classes/SelectField.html)
* [`new FileField({ ... })`](/jsvm/classes/FileField.html)
* [`new RelationField({ ... })`](/jsvm/classes/RelationField.html)
* [`new JSONField({ ... })`](/jsvm/classes/JSONField.html)

### [Create new collection](#create-new-collection)

`// missing default options, system fields like id, email, etc. are initialized automatically
// and will be merged with the provided configuration
let collection = new Collection({
type: "base", // base | auth | view
name: "example",
listRule: null,
viewRule: "@request.auth.id != ''",
createRule: "",
updateRule: "@request.auth.id != ''",
deleteRule: null,
fields: [
{
name: "title",
type: "text",
required: true,
max: 10,
},
{
name: "user",
type: "relation",
required: true,
maxSelect: 1,
collectionId: "ae40239d2bc4477",
cascadeDelete: true,
},
],
indexes: [
"CREATE UNIQUE INDEX idx_user ON example (user)"
],
})
// validate and persist
// (use saveNoValidate to skip fields validation)
$app.save(collection)`
### [Update existing collection](#update-existing-collection)

`let collection = $app.findCollectionByNameOrId("example")
// change the collection name
collection.name = "example_update"
// add new editor field
collection.fields.add(new EditorField({
name: "description",
required: true,
}))
// change existing field
// (returns a pointer and direct modifications are allowed without the need of reinsert)
let titleField = collection.fields.getByName("title")
titleField.min = 10
// or: collection.indexes.push("CREATE INDEX idx_example_title ON example (title)")
collection.addIndex("idx_example_title", false, "title", "")
// validate and persist
// (use saveNoValidate to skip fields validation)
$app.save(collection)`
### [Delete collection](#delete-collection)

`let collection = $app.findCollectionByNameOrId("example")
$app.delete(collection)` 

---

  [Prev: Record operations](js-records.md) [Next: Migrations](js-migrations.md)  [FAQ](/faq) [Discussions](https://github.com/pocketbase/pocketbase/discussions) [Documentation](/docs) [JavaScript SDK](https://github.com/pocketbase/js-sdk) [Dart SDK](https://github.com/pocketbase/dart-sdk) Pocket**Base**   © 2023-2025 Pocket**Base** The Gopher artwork is from
[marcusolsson/gophers](https://github.com/marcusolsson/gophers)  Crafted by [**Gani**](https://gani.bg)   
