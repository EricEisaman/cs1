const db = require('../../db/db');
const iotAPI = app => {
   
  
  //Handle polling from IoT Device
  
  //For setting IoT device state to game state.
  app.get("/iot-get", function (request, response) {
    console.log(`Geting IoT data value for ${request.query.prop} for user ${request.query.name}!`);
    let result = db.get('users').find({name:request.query.name}).value()[request.query.prop];
      if(result){
        response.send(result);
      }else{
        response.send('DB Fail!');
      }  
  }); 
  
  
  //For setting game state to IoT device state.
  app.get("/iot-set", function (request, response) {

    let d = {};
    d[request.query.prop]=request.query.value;
    console.log('Attempting to save the following to the user database:');
    console.log(d);
    let result = db.get('users').find({name:request.query.name}).assign(d).write();
      if(result){
        response.send(result);
      }else{
        response.send('Failed to set db value!');
      }  
  }); 
  
  


}
module.exports = iotAPI; 