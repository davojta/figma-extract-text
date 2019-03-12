var express = require('express');
var port = process.env.PORT || 3000;
var app = express();
var { extractText } = require('./extract_text');

app.use(express.static('public'))

app.get('/', function (req, res) {
 res.send(JSON.stringify({ Hello: 'World'}));
});

app.get('/extractText', function (req, res) {
    extractText().then(() => {
        res.send(JSON.stringify("the file is ready!"));
    })
    
   });

app.listen(port, function () {
 console.log(`Example app listening on port !`);
});