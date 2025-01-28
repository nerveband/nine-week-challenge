






















































Extend with Go - Testing - Docs - PocketBase


[![PocketBase logo](/images/logo.svg) Pocket**Base** v0.24.4](/)   Go JavaScript  Clear      [FAQ](/faq)  [Documentation](/docs)   [Introduction](/docs)   [Going to production](going-to-production.md)   [Web APIs reference](api-records.md)    [Extend with
  
 **Go**](go-overview.md) [Extend with
  
 **JavaScript**](js-overview.md) [Go Overview](go-overview.md)  [Go Event hooks](go-event-hooks.md)  [Go Routing](go-routing.md)  [Go Database](go-database.md)  [Go Record operations](go-records.md)  [Go Collection operations](go-collections.md)  [Go Migrations](go-migrations.md)  [Go Jobs scheduling](go-jobs-scheduling.md)  [Go Sending emails](go-sending-emails.md)  [Go Rendering templates](go-rendering-templates.md)  [Go Console commands](go-console-commands.md)  [Go Realtime messaging](go-realtime.md)  [Go Filesystem](go-filesystem.md)  [Go Logging](go-logging.md)  [Go Testing](go-testing.md)  [Go Miscellaneous](go-miscellaneous.md)  [Go Record proxy](go-record-proxy.md)   [JS Overview](js-overview.md)  [JS Event hooks](js-event-hooks.md)  [JS Routing](js-routing.md)  [JS Database](js-database.md)  [JS Record operations](js-records.md)  [JS Collection operations](js-collections.md)  [JS Migrations](js-migrations.md)  [JS Jobs scheduling](js-jobs-scheduling.md)  [JS Sending emails](js-sending-emails.md)  [JS Rendering templates](js-rendering-templates.md)  [JS Console commands](js-console-commands.md)  [JS Sending HTTP requests](js-sending-http-requests.md)  [JS Realtime messaging](js-realtime.md)  [JS Filesystem](js-filesystem.md)  [JS Logging](js-logging.md)  [JS Types reference](/jsvm/index.html)   Extend with Go - Testing Testing

PocketBase exposes several test mocks and stubs (eg. `tests.TestApp`,
`tests.ApiScenario`, `tests.MockMultipartData`, etc.) to help you write unit and
integration tests for your app.

You could find more information in the
[`github.com/pocketbase/pocketbase/tests`](https://pkg.go.dev/github.com/pocketbase/pocketbase/tests)
sub package, but here is a simple example.

* [1. Setup](#1-setup)
* [2. Prepare test data](#2-prepare-test-data)
* [3. Integration test](#3-integration-test)
### [1. Setup](#1-setup)

Let's say that we have a custom API route `GET /my/hello` that requires admin authentication:

`// main.go
package main
import (
"log"
"net/http"
"github.com/pocketbase/pocketbase"
"github.com/pocketbase/pocketbase/apis"
"github.com/pocketbase/pocketbase/core"
)
func bindAppHooks(app core.App) {
app.OnServe().BindFunc(func(se *core.ServeEvent) error {
se.Router.Get("/my/hello", func(e *core.RequestEvent) error {
return e.JSON(http.StatusOK, "Hello world!")
}).Bind(apis.RequireSuperuserAuth())
return se.Next()
})
}
func main() {
app := pocketbase.New()
bindAppHooks(app)
if err := app.Start(); err != nil {
log.Fatal(err)
}
}`
### [2. Prepare test data](#2-prepare-test-data)

Now we have to prepare our test/mock data. There are several ways you can approach this, but the easiest
one would be to start your application with a custom `test_pb_data` directory, e.g.:

`./pocketbase serve --dir="./test_pb_data" --automigrate=0`

Go to your browser and create the test data via the Dashboard (both collections and records). Once
completed you can stop the server (you could also commit `test_pb_data` to your repo).

### [3. Integration test](#3-integration-test)

To test the example endpoint, we want to:

* ensure it handles only GET requests
* ensure that it can be accessed only by superusers
* check if the response body is properly set

Below is a simple integration test for the above test cases. We'll also use the test data created in the
previous step.

`// main_test.go
package main
import (
"net/http"
"testing"
"github.com/pocketbase/pocketbase/core"
"github.com/pocketbase/pocketbase/tests"
)
const testDataDir = "./test_pb_data"
func generateToken(collectionNameOrId string, email string) (string, error) {
app, err := tests.NewTestApp(testDataDir)
if err != nil {
return "", err
}
defer app.Cleanup()
record, err := app.FindAuthRecordByEmail(collectionNameOrId, email)
if err != nil {
return "", err
}
return record.NewAuthToken()
}
func TestHelloEndpoint(t *testing.T) {
recordToken, err := generateToken("users", "test@example.com")
if err != nil {
t.Fatal(err)
}
superuserToken, err := generateToken(core.CollectionNameSuperusers, "test@example.com")
if err != nil {
t.Fatal(err)
}
// setup the test ApiScenario app instance
setupTestApp := func(t testing.TB) *tests.TestApp {
testApp, err := tests.NewTestApp(testDataDir)
if err != nil {
t.Fatal(err)
}
// no need to cleanup since scenario.Test() will do that for us
// defer testApp.Cleanup()
bindAppHooks(testApp)
return testApp
}
scenarios := []tests.ApiScenario{
{
Name: "try with different http method, e.g. POST",
Method: http.MethodPost,
URL: "/my/hello",
ExpectedStatus: 405,
ExpectedContent: []string{"\"data\":{}"},
TestAppFactory: setupTestApp,
},
{
Name: "try as guest (aka. no Authorization header)",
Method: http.MethodGet,
URL: "/my/hello",
ExpectedStatus: 401,
ExpectedContent: []string{"\"data\":{}"},
TestAppFactory: setupTestApp,
},
{
Name: "try as authenticated app user",
Method: http.MethodGet,
URL: "/my/hello",
Headers: map[string]string{
"Authorization": recordToken,
},
ExpectedStatus: 401,
ExpectedContent: []string{"\"data\":{}"},
TestAppFactory: setupTestApp,
},
{
Name: "try as authenticated admin",
Method: http.MethodGet,
URL: "/my/hello",
Headers: map[string]string{
"Authorization": superuserToken,
},
ExpectedStatus: 200,
ExpectedContent: []string{"Hello world!"},
TestAppFactory: setupTestApp,
},
}
for _, scenario := range scenarios {
scenario.Test(t)
}
}` 

---

  [Prev: Logging](go-logging.md) [Next: Miscellaneous](go-miscellaneous.md)  [FAQ](/faq) [Discussions](https://github.com/pocketbase/pocketbase/discussions) [Documentation](/docs) [JavaScript SDK](https://github.com/pocketbase/js-sdk) [Dart SDK](https://github.com/pocketbase/dart-sdk) Pocket**Base**   © 2023-2025 Pocket**Base** The Gopher artwork is from
[marcusolsson/gophers](https://github.com/marcusolsson/gophers)  Crafted by [**Gani**](https://gani.bg)   
