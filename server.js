var express = require("express");

var app = express();
app.use(express.static(__dirname));

app.get('/bracketize/:str', function(req, res) {
    res.send("[" + req.params.str + "]");
});

app.listen(3210);
