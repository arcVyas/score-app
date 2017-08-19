var express = require('express');
var path = require('path');

var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(express.static(path.join(__dirname, 'public')));

var scoreR = require('./routes/score')
app.use('/matches',scoreR)

//app.set('port', 9080);
var server = app.listen(process.env.PORT || 9080, function() {
  console.log('Express server listening on port ' + server.address().port);
});
module.exports = app;