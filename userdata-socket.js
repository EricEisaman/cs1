const db = require('./low_db');
let userdataSocket = {
 name: 'userdataSocket',
 maxstore: 1000,
 init: socket=>{
    let allowedKeys = process.env.ALLOWED_KEYS.split(" ");
    socket.on('db-store',(data,cb)=>{
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
      if(result){
        cb('success');
        let msg = 'Userdata save was a success!'
        console.log(msg);
      }else{
        cb('fail');
        let msg = 'Userdata save was attempted but failed!'
        console.log(msg);
      }
      

    });
   
   
   socket.on('db-get',(key,cb)=>{
      console.log(`Attempting to get user.${key}.`);
      let result = db.get('users').find({id:socket.dbid}).value()[key];
      if(result){
        cb(result);
      }else{
        socket.emit('db-fail',key);
        let msg = `Failed to retrieve user.${key} from database.`
        socket.emit('log',msg);
      }
   
   
   });
   
   
 }
}
module.exports = userdataSocket; 