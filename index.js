var message = ko.observable("hello"),
    activated = ko.observable(true),
    response = ko.promiseComputed("", function() {
        return HTTP.get("bracketize/" + message())
                   .catch(function() { return ""; });
    });

ko.applyBindings({
    message: message,
    activated: activated,
    response: response
});
