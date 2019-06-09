const ideAPI = {
  
  setApp: app=>{
    
    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });
    
    app.get("/ide-get-client-config", function (request, response) {
      response.setHeader('Content-Type', 'application/json');
      //response.end(JSON.stringify({ a: 1 }));
      response.sendFile('./src/core/config/client-config.json',{root:'.'});
    });  
    
    
  }
  
}

module.exports = ideAPI;