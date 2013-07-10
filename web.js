var express = require('express');
var fs = require('fs');

var app = express.createServer(express.logger());

app.get('/', function(request, response) {
  var name = 'index.html';
  fs.readFile(name, function (err, html) {
    if(err) {
    	console.log(err);
    } else {
    	response.send(html);
    	console.log('Sending ' + name);
    }
  });
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log('Listening on ' + port);
});