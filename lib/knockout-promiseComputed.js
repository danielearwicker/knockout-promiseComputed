if (location.hash === "#old") {

    console.log("Using non-pure implementation");

    ko.promiseComputed = function promiseComputed(init, evaluator) {
        var latest = ko.observable(init), // our current value
            waitingOn = 0; // for discarding superceded results

        disposable = ko.computed(function promiseComputedObserver() {
            var p = evaluator();
            var w = ++waitingOn;
            if (p.then) {
                p.then(function promiseComputedThenHandler(v) {
                    if (w === waitingOn) {
                        latest(v);
                    }
                });
            } else {
                latest(p);
            }
        });
        return latest;
    }

} else {

    console.log("Using pure implementation");

    ko.promiseComputed = function promiseComputed(init, evaluator) {
        var latest = ko.observable(init), // our current value
            waitingOn = 0, // for discarding superceded results
            disposable; // An impure computed

        function wake() {
            if (!disposable) {
                disposable = ko.computed(function promiseComputedObserver() {
                    var p = evaluator();
                    var w = ++waitingOn;
                    if (p.then) {
                        p.then(function promiseComputedThenHandler(v) {
                            if (w === waitingOn) {
                                latest(v);
                            }
                        });
                    } else {
                        latest(p);
                    }
                });
            }
        }

        function sleep() {
            if (disposable) {
                disposable.dispose();
                disposable = null;
            }
        }

        var result = ko.pureComputed(latest);
        result.subscribe(wake, null, "awake");
        result.subscribe(sleep, null, "asleep");
        return result;
    }
}
