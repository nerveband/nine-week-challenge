






















































Extend with Go - Miscellaneous - Docs - PocketBase


[![PocketBase logo](/images/logo.svg) Pocket**Base** v0.24.4](/)   Go JavaScript  Clear      [FAQ](/faq)  [Documentation](/docs)   [Introduction](/docs)   [Going to production](going-to-production.md)   [Web APIs reference](api-records.md)    [Extend with
  
 **Go**](go-overview.md) [Extend with
  
 **JavaScript**](js-overview.md) [Go Overview](go-overview.md)  [Go Event hooks](go-event-hooks.md)  [Go Routing](go-routing.md)  [Go Database](go-database.md)  [Go Record operations](go-records.md)  [Go Collection operations](go-collections.md)  [Go Migrations](go-migrations.md)  [Go Jobs scheduling](go-jobs-scheduling.md)  [Go Sending emails](go-sending-emails.md)  [Go Rendering templates](go-rendering-templates.md)  [Go Console commands](go-console-commands.md)  [Go Realtime messaging](go-realtime.md)  [Go Filesystem](go-filesystem.md)  [Go Logging](go-logging.md)  [Go Testing](go-testing.md)  [Go Miscellaneous](go-miscellaneous.md)  [Go Record proxy](go-record-proxy.md)   [JS Overview](js-overview.md)  [JS Event hooks](js-event-hooks.md)  [JS Routing](js-routing.md)  [JS Database](js-database.md)  [JS Record operations](js-records.md)  [JS Collection operations](js-collections.md)  [JS Migrations](js-migrations.md)  [JS Jobs scheduling](js-jobs-scheduling.md)  [JS Sending emails](js-sending-emails.md)  [JS Rendering templates](js-rendering-templates.md)  [JS Console commands](js-console-commands.md)  [JS Sending HTTP requests](js-sending-http-requests.md)  [JS Realtime messaging](js-realtime.md)  [JS Filesystem](js-filesystem.md)  [JS Logging](js-logging.md)  [JS Types reference](/jsvm/index.html)   Extend with Go - Miscellaneous Miscellaneous 

* [app.Store()](#app-store)
* [Security helpers](#security-helpers)
  + [Generating random strings](#generating-random-strings)
  + [Compare strings with constant time](#compare-strings-with-constant-time)
  + [AES Encrypt/Decrypt](#aes-encryptdecrypt)
### [app.Store()](#app-store)

[`app.Store()`](https://pkg.go.dev/github.com/pocketbase/pocketbase/core#BaseApp.Store)
returns a concurrent-safe application memory store that you can use to store anything for the duration of the
application process (e.g. cache, config flags, etc.).

You can find more details about the available store methods in the
[`store.Store`](https://pkg.go.dev/github.com/pocketbase/pocketbase/tools/store#Store)
documentation but the most commonly used ones are `Get(key)`, `Set(key, value)` and
`GetOrSet(key, setFunc)`.

`app.Store().Set("example", 123)
v1 := app.Store().Get("example").(int) // 123
v2 := app.Store().GetOrSet("example2", func() any {
// this setter is invoked only once unless "example2" is removed
// (e.g. suitable for instantiating singletons)
return 456
}).(int) // 456`  

Keep in mind that the application store is also used internally usually with `pb*`
prefixed keys (e.g. the collections cache is stored under the `pbAppCachedCollections`
key) and changing these system keys or calling `RemoveAll()`/`Reset()` could
have unintended side-effects.

If you want more advanced control you can initialize your own store independent from the
application instance via
`store.New[K, T](nil)`.

### [Security helpers](#security-helpers)

*Below are listed some of the most commonly used security helpers but you can find detailed
documentation for all available methods in the
[`security`](https://pkg.go.dev/github.com/pocketbase/pocketbase/tools/security)
subpackage.*

##### [Generating random strings](#generating-random-strings)

`secret := security.RandomString(10) // e.g. a35Vdb10Z4
secret := security.RandomStringWithAlphabet(5, "1234567890") // e.g. 33215`
##### [Compare strings with constant time](#compare-strings-with-constant-time)

`isEqual := security.Equal(hash1, hash2)`
##### [AES Encrypt/Decrypt](#aes-encryptdecrypt)

`// must be random 32 characters string
const key = "a7NjyJkP1Mvd9fsvIUZ1qBNVoDvbcoz1"
encrypted, err := security.Encrypt([]byte("test"), key)
if err != nil {
return err
}
decrypted := security.Decrypt(encrypted, key) // []byte("test")` 

---

  [Prev: Testing](go-testing.md) [Next: Record proxy](go-record-proxy.md)  [FAQ](/faq) [Discussions](https://github.com/pocketbase/pocketbase/discussions) [Documentation](/docs) [JavaScript SDK](https://github.com/pocketbase/js-sdk) [Dart SDK](https://github.com/pocketbase/dart-sdk) Pocket**Base**   © 2023-2025 Pocket**Base** The Gopher artwork is from
[marcusolsson/gophers](https://github.com/marcusolsson/gophers)  Crafted by [**Gani**](https://gani.bg)   
