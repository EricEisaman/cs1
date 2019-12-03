const db = require('../../db/db');
const IOT_API_KEY = process.env.IOT_API_KEY;
const iotAPI = {
  name: 'iotAPI',
  init: socket => {
    
    if(!process.env.DATABASE_API_PROPERTIES){
     //console.log('Add DATABASE_API_PROPERTIES to your .env file, such as DATABASE_API_PROPERTIES="LED credits"');
     return;
    }
    if(!db.get('iot').value()){ 
      db.set('iot.LED','on').write();  
      console.log('INITIALIZING iot.LED');
    } 
    let allowedKeys = process.env.DATABASE_API_PROPERTIES.split(" ");
    socket.on('iot-set',(data,cb)=>{
      if(!socket.auth){
        socket.emit('db-fail',data);
        socket.emit('log','You attempted to store IoT data before logging into the game!');
        console.log('Client attempted to store IoT data before logging into the game!');
        return;
      }
      let key = Object.keys(data)[0];
      //check against allowed keys
      if(!allowedKeys.includes(key)){
        socket.emit('db-fail',data);
        socket.emit('log',`You attempted to store IoT data to an unauthorized key ${key}!`);
        console.log('Client attempted to store IoT data to an unauthorized key!');
        return;
      }
      //check against max data length
      if(JSON.stringify(data).length > this.maxstore){
        socket.emit('db-fail',data);
        socket.emit('log','You attempted to store too much IoT data and have been denied!');
        console.log('Client attempted to store too much IoT data and was denied!');
        return;
      }
      let d = {};
      d[key]=data[key];
      console.log('Attempting to save the following to the IoT database:');
      console.log(d);
      let result = db.get('iot').assign(d).write();
      if(result && typeof cb == "function"){
        cb('success');
        let msg = 'IoT data save was a success!'
        console.log(msg);
        socket.broadcast.emit('iot-update',d);
      }else{
        cb('fail');
        let msg = 'IoT data save was attempted but failed!'
        console.log(msg);
      }
      

    });
   
   
   socket.on('iot-get',(key,cb)=>{
      //console.log(`Attempting to get user.${key} for user with id: ${socket.dbid}`);
      let result = db.get('iot').value()[key];
      if(result && typeof cb == "function"){
        cb(result);
      }else{
        socket.emit('db-fail',key);
        let msg = `Failed to retrieve iot.${key} from database.`
        socket.emit('log',msg);
      }  
   });
    
   
    
  
  },
  
  setApp: app => {
    
    if(!IOT_API_KEY) return;
  
    //Handle polling from IoT Device

  
    //For setting IoT device state to game state.
    app.get("/iot-get", function (request, response) {
      if(request.query.key != IOT_API_KEY){
         response.status(403);
         response.send();
      }else{
         console.log(`Geting value for iot.${request.query.prop}!`);
         let result = db.get('iot').value()[request.query.prop];
          if(result){
            response.send(result);
          }else{
            response.send('DB Fail!');
          }
      }
    });  


    //For setting game state to IoT device state.
    app.get("/iot-set", function (request, response) {
      if(request.query.key != IOT_API_KEY){
         response.status(403);
         response.send();
      }
      let d = {};
      d[request.query.prop]=request.query.value;
      console.log('Attempting to save the following to the user database:');
      console.log(d);
      let result = db.get('iot').assign(d).write();
        if(result){
          response.send(result);
        }else{
          response.send('Failed to set db value!');
        }  
    }); 
  
   
  
  }
  
  
  


}
module.exports = iotAPI; 