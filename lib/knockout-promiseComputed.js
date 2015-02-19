if (location.hash === "#old") {

    console.log("Using non-pure implementation");

    ko.promiseComputed = function(init, evaluator) {
        var latest = ko.observable(init), // our current value
            waitingOn = 0; // for discarding superceded results

        disposable = ko.computed(function() {
            var p = evaluator();
            var w = ++waitingOn;
            if (p.then) {
                p.then(function(v) {
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

    if ((typeof ko === "undefined") || (typeof ko.execute !== "function")) {
        throw new Error("This library requires Knockout 3.3");
    }

    ko.promiseComputed = function(init, evaluator, thisObj) {
        var latest = ko.observable(init), // our current value
            waitingOn = 0; // for discarding superceded results
            result = ko.pureComputed(latest); // what we return
        ko.execute(result, function() {
            var p = evaluator.call(thisObj);
            var w = ++waitingOn;
            if (p.then) {
                p.then(function(v) {
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
