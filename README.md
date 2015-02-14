# knockout-promiseComputed

To run this example:

    npm install
    node server.js

Then in your browser visit:

    http://localhost:3210/

Files of interest:

* `server.js` - a trivial example server that accepts a string and returns the
same string in square brackets

* `lib/promise-http.js` - minimal helper that does HTTP GET into an ES6 promise

* `lib/knockout-promiseComputed.js` - defines `ko.promiseComputed(init, evaluator)`
where `init` is the starting value and `evaluator` is a function that returns
a value that *may* be wrapped in a promise. The return value is a `pureComputed`
whose value is the unwrapped value.

* `index.js` - example in which `ko.promiseComputed` is used to let the server
wrap a string in brackets. By unchecking *Activated* we can remove any bindings
to the `promiseComputed` and thus cause it to switch to a sleeping state,
allowing it to be garbage collected rather than being kept alive by any
dependencies it might have on longer-lived observables.

The example maintains a `counter` observable that is long-lived, in that it
survives as long as the page is open. It then has a setup function that injects
an HTML template into the page and binds a view-model to it. (There is a
corresponding teardown function which removes the bindings.)

From the browser's debug console, you can call:

    startTest();

This will start a loop that repeatedly alternates between calling `teardown`
and `setup`, as well as incrementing the counter.

You can also launch the page with:

    http://localhost:3210/#old

This will make it use a naive implementation of `ko.promiseComputed` that
fails to dispose `ko.computed`. If you call `startTest()` and monitor the
network requests in the Chrome debugging tools, you'll see that they grow
exponentially, because all the previously allocated `ko.computed` objects
are still observing changes to the `counter`, and triggering new network
requests, even though nothing will ever make use of the results. They
cannot be garbage collected because they depend on `counter`.

The new implementation avoids this problem by effectively behaving like a
`pureComputed`.
