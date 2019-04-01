var express = require('express');
var app = express();
let fs = require('fs');
app.set('view engine', 'ejs');
app.set('views', __dirname + '/pages'); // html/ejs files found here
app.use(express.static(__dirname + '/public')); // sets folder to hold static files

// Read CSV from filesystem
let csv;
fs.readFile('allCCC.csv', 'utf8', function (err, data) {
	csv = data;
});

// Endpoint: GET Home Page
app.get('/', function(req, res) {
	res.render((__dirname + '/pages/index.ejs'));
});

// Endpoint: GET CSV
app.get("/data", function (req, res) {
	res.setHeader('Content-disposition', 'attachment; filename=data.csv');
	res.set('Content-Type', 'text/csv');
	res.status(200).send(csv);
});

app.listen(8080);
