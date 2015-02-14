(function(exports) {

    exports.get = function(url) {
        return new Promise(function (done, fail) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        done(xhr.responseText);
                    } else {
                        fail(new Error("Status - " + xhr.status));
                    }
                }
            };
            xhr.open("GET", url, true);
            xhr.send();
        });
    };

})(window.HTTP || (window.HTTP = {}));
