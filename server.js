let express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
require('./socket.js')(io);
app.use(express.static('public'));
app.get("/", function (request, response) {
  response.sendFile('index.html',{root:'.'});
}); 
app.get("/admin", function (request, response) {
  response.sendFile('admin.html',{root:'.'});
}); 
app.set('port', (process.env.PORT || 5000));
http.listen(app.get('port'), function(){
  console.log('listening on port',app.get('port'));
});      
       