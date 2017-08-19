var express = require('express');
var path = require('path');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.use(express.static(path.join(__dirname, 'public')));

require('./routes/score')(app,io)


io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});


//app.set('port', 9080);
var server = http.listen(process.env.PORT || 9080, function() {
  console.log('Express server listening on port ' + server.address().port);
});



module.exports = app;