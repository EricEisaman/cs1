let express = require('express'); 
var app = express();  
var http = require('http').Server(app); 
var io = require('socket.io')(http);
require('./socket/main-socket.js')(io);
require('./socket/addons/iot-api.js').setApp(app);
require('./admin/ide/ide-api.js').setApp(app);
app.use(express.static('public'));
app.use(function(req, res, next) {
      if ((req.get('X-Forwarded-Proto') !== 'https')) {
        res.redirect('https://' + req.get('Host') + req.url);
      } else
        next();
    });
app.get("/", function (request, response) {
  response.sendFile('./public/index.html',{root:'.'});
}); 
app.get("/admin", function (request, response) {
  response.sendFile('admin.html',{root:'.'});
}); 
app.set('port', (process.env.PORT || 5000));
http.listen(app.get('port'), function(){
  console.log('listening on port',app.get('port'));
}); 
   
                            
  