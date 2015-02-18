ko.bindingHandlers.execute = {
    init: function() {
        return { 'controlsDescendantBindings': true };
    },
    update: function (element, valueAccessor) {
        ko.toJS(valueAccessor());
    }
};
ko.virtualElements.allowedBindings.execute = true;

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

    // Attempts to determine if the argument is a ko.pureComputed
    ko.isPureComputed = function(obs) {
        // There are hacks, and then there are hacks
        return !!(obs && obs.beforeSubscriptionAdd &&
            obs.beforeSubscriptionAdd.toString().match(/"awake"/));
    }

    // Creates a computed that is not designed to have a return value, just
    // side-effects. It must be given a pureComputed that keeps it awake.
    ko.execute = function orphanComputed(pureComputed, evaluator, thisObj) {

        if (!ko.isPureComputed(pureComputed)) {
            throw new Error("ko.execute must be passed a ko.pureComputed");
        }

        function wake() {
            if (!disposable) {
                disposable = ko.computed(evaluator, thisObj);
            }
        }

        if (pureComputed.isActive()) {
            wake();
        }

        var disposable; // An impure computed
        pureComputed.subscribe(wake, null, "awake");
        pureComputed.subscribe(function sleep() {
            if (disposable) {
                disposable.dispose();
                disposable = null;
            }
        }, null, "asleep");
    }

    ko.promiseComputed = function promiseComputed(init, evaluator, thisObj) {
        var latest = ko.observable(init), // our current value
            waitingOn = 0; // for discarding superceded results
            result = ko.pureComputed(latest); // what we return
        ko.execute(result, function promiseComputedObserver() {
            var p = evaluator.call(thisObj);
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
        return result;
    }
}
