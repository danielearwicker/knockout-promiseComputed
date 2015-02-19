
var counter = ko.observable(0);

var container = document.querySelector('#container');

function setup() {

    var html =
        '<div>' +
        '    Enter a message: <input type="text" data-bind="textInput: message">' +
        '</div>' +
        '<div>' +
        '    <label>' +
        '        <input type="checkbox" data-bind="checked: activated"> Activate' +
        '    </label>' +
        '</div>' +
        '<div data-bind="if: activated">' +
        '    <!-- ko if: response -->' +
        '        Response is: <span data-bind="text: response"></span>' +
        '    <!-- /ko -->' +
        '    <!-- ko execute: mySideEffects --><!-- /ko -->' +
        '    <div data-bind="text: pcm"></div>' +
        '</div>';

    container.innerHTML = html;

    var message = ko.observable(location.hash === "#old" ? "nonpure" : "pure"),
        activated = ko.observable(false),
        response = ko.promiseComputed("", function() {
            return HTTP.get("bracketize/" + message() + counter())
                       .catch(function() { return ""; });
        });

    var pcm = ko.pureComputed(message);

    ko.execute(pcm, function() {
        console.log("Here's a side-effect: " + message());
    });

    ko.applyBindings({
        message: message,
        activated: activated,
        response: response,
        mySideEffects: ko.pureComputed(function() {
            /*console.log("Here's a side-effect: " +
                message() + " and " + activated());*/
        }),
        pcm: pcm
    }, container);
}

function teardown() {
    ko.cleanNode(container);
    container.innerHTML = "";
}

setup();

window.startTest = function() {

    setInterval(function() {

        counter(counter() + 1);

        if (container.innerHTML) {
            teardown();
        } else {
            setup();
        }

    }, 200);
};
