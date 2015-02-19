(function() {

    if ((typeof ko === "undefined") ||
        (typeof ko.version !== "string") ||
        (parseFloat(ko.version.split("-")[0]) < 3.3)) {
        throw new Error("This library requires Knockout 3.3");
    }

    // Simple binding that we can use to keep a side-effecting pureComputed awake
    ko.bindingHandlers.execute = {
        init: function() {
            return { 'controlsDescendantBindings': true };
        },
        update: function (element, valueAccessor) {
            // Unwrap recursively - so binding can be to an array, etc.
            ko.toJS(valueAccessor());
        }
    };
    ko.virtualElements.allowedBindings.execute = true;

    // Wrap ko.pureComputed to allow us to check if something was created by it
    var pureComputedId = "__execute_isPureComputed__";
    var originalPureComputed = ko.pureComputed.bind(ko);
    ko.pureComputed = function (evaluatorFunctionOrOptions, evaluatorFunctionTarget) {
        var pc = originalPureComputed(evaluatorFunctionOrOptions, evaluatorFunctionTarget);
        pc[pureComputedId] = true;
        return pc;
    };
    ko.isPureComputed = function(obs) {
        return obs && obs[pureComputedId];
    }

    // Creates a computed that is not designed to have a return value, just
    // side-effects. It must be given a pureComputed that keeps it awake.
    ko.execute = function(pureComputed, evaluator, thisObj) {

        if (!ko.isPureComputed(pureComputed)) {
            throw new Error("ko.execute must be passed a ko.pureComputed");
        }

        function wake() {
            if (!disposable) {
                disposable = ko.computed(function() {
                    // If pureComputed's count of "change" subscribers changes
                    // due to our evaluator running, that's not good!
                    var count = pureComputed.getSubscriptionsCount("change");
                    evaluator.call(thisObj);
                    if (pureComputed.getSubscriptionsCount("change") !== count) {
                        throw new Error("The pureComputed passed as the first " +
                            "argument to ko.execute cannot be a dependency of the " +
                            "evaluator function");
                    }
                });
            }
        }

        // Should we start in the awake state?
        if (pureComputed.getSubscriptionsCount("change") !== 0) {
            wake();
        }

        var disposable; // Our impure computed
        pureComputed.subscribe(wake, null, "awake");
        pureComputed.subscribe(function() {
            if (disposable) {
                disposable.dispose();
                disposable = null;
            }
        }, null, "asleep");
    }
}());
