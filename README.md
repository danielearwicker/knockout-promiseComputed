# knockout-pureasync

To run this example:

    npm install
    node server.js

Then in your browser visit:

    http://localhost:3210/

When you check and uncheck *Activated*, note the debug console messages about
sleeping and waking.

`server.js` - a trivial example server that accepts a string and returns the
same string in square brackets

`lib/promise-http.js` - minimal helper that does HTTP get into an ES6 promise

`lib/knockout-promiseComputed.js` - adds `ko.promiseComputed(init, evaluator)`
where `init` is the starting value and `evaluator` is a function that returns
a value that may be wrapped in a promise. The return value is a `pureComputed`
whose value is the unwrapped value.

`index.js` - example in which `ko.promiseComputed` is used to let the server
wrap a string in brackets. By unchecking *Activated* we can remove any bindings
to the `promiseComputed` and thus cause it to switch to a sleeping state,
allowing it to be garbage collected rather than being kept alive by any
dependencies it might have on longer-lived observables.
