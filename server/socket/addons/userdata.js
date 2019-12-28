const db = require('../../db/db');
let userdataSocket = {
 name: 'userdataSocket',
 maxstore: 1000,
 init: socket=>{
    if(!process.env.DATABASE_API_PROPERTIES){
     //console.log('Add DATABASE_API_PROPERTIES to your .env file, such as DATABASE_API_PROPERTIES="LED credits"');
     return;
    }
    let allowedKeys = process.env.DATABASE_API_PROPERTIES.split(" ");
    socket.on('db-set',(data,cb)=>{
      if(!socket.auth){
        socket.emit('db-fail',data);
        socket.emit('log','You attempted to store data before logging into the game!');
        console.log('Client attempted to store data before logging into the game!');
        return;
      }
      let key = Object.keys(data)[0];
      //check against allowed keys
      if(!allowedKeys.includes(key)){
        socket.emit('db-fail',data);
        socket.emit('log',`You attempted to store data to an unauthorized key ${key}!`);
        console.log('Client attempted to store data to an unauthorized key!');
        return;
      }
      //check against max data length
      if(JSON.stringify(data).length > this.maxstore){
        socket.emit('db-fail',data);
        socket.emit('log','You attempted to store too much data and have been denied!');
        console.log('Client attempted to store too much data and was denied!');
        return;
      }
      let d = {};
      d[key]=data[key];
      console.log('Attempting to save the following to the user database:');
      console.log(d);
      let result = db.get('users').find({id:socket.dbid}).assign(d).write();
      if(result && typeof cb == "function"){
        cb({success:true});
        let msg = `Userdata ${key} save was a success!`;
        console.log(msg);
      }else{
        let msg = `Userdata ${key} save was attempted but failed!`;
        cb({success:false,error:msg});
        console.log(msg);
      }
      

    });
   
   
   socket.on('db-get',(key,cb)=>{
      //console.log(`Attempting to get user.${key} for user with id: ${socket.dbid}`);
      let result = db.get('users').find({id:socket.dbid}).value()[key];
      if(result && typeof cb == "function"){
        cb({success:true,value:result});
      }else{
        let msg = `Userdata ${key} retrieval was attempted but failed!`;  
        socket.emit({success:false,error:msg});
        console.log(msg);
      }  
   });
   
   
 }
}
module.exports = userdataSocket; 