const db = require('../../db/db');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const fs = require('fs');

const contents = fs.readFileSync("./src/core/config/client-config.json");
const clientConfig = JSON.parse(contents);
   

const dashboardAPI = {
   
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
    
  },
  
  setAdmin: (socket,state)=>{
    //IDE API Helpers
    async function ls() {
      const { stdout, stderr } = await exec('ls');
      console.log('stdout:', stdout);
      console.log('stderr:', stderr);
    }
    
    async function bash(cmd) {
      const { stdout, stderr } = await exec(cmd);
      console.log('stdout:', stdout);
      console.log('stderr:', stderr);
    }


    async function build(cb) {
      try{
        const { stdout, stderr } = await exec('pnpm run build');
        socket.emit('log', stdout);
        socket.emit('log', stderr);
        cb('success');
      }catch(err){
        socket.emit('log', err.name + '\n' + err.message );
        cb('fail');
      }

    }
    
    async function envSetProp(prop,value) {
      try{
        const { stdout, stderr } = await exec(`
sed -i '/${prop}/ { c \
${prop}="${value}"
}' .env
refresh`);
        console.log(stdout);
        console.log(stderr);
      }catch(err){
        console.log(err);
      }

    }
    
    async function cat(path) {
      try{
        const { stdout, stderr } = await exec(`cat ${path}`);
      }catch(err){
        console.log('Failed call to cat!');
      }

    }
    
    
     
       
    //DASHBOARD API: 
    
socket.on('db-set',(data,cb)=>{
      
      let result = db.get('users').find({name:data.name}).assign(data.data).write();
      if(result && typeof cb == "function"){
        cb('success');
        let msg = 'ADMIN dashboard set userdata was a success!'
        console.log(msg);
        console.log(result);
        if(data.name=="admin"&&data.data.pw){
          envSetProp("ADMIN_KEY",data.data.pw);
          socket.emit('new-admin-key',data.data.pw);
        }
        //console.log(JSON.stringify(data));
        //console.log(db.get('users').find({name:data.name}).value());
        //bash('cat .data/db.json');
      }else{
        cb('fail');
        let msg = 'ADMIN dashboard save was attempted but failed!'
        console.log(msg);
      }
      

    });
   
   
socket.on('db-get',(data,cb)=>{
      let result = db.get('users').find({name:data.name}).value()[data.key];
      if(result && typeof cb == "function"){
        cb(result);
      }else{
        let msg = `Failed to retrieve ${data.key} for ${data.name} from database.`
        socket.emit('msg',msg);
      }  
   });
    
    
socket.on('db-get-users',(cb)=>{
      let result = db.get('users').value();
      if(result && typeof cb == "function"){
        cb(result);
        //socket.emit('msg','You got the users.');
      }else{
        let msg = `Failed to retrieve users from database.`
        socket.emit('msg',msg);
      }  
   });
    
    
socket.on('db-remove-user',(name,cb)=>{
      
      let result = db.get('users').remove({ name: name }).write();
      if(result && typeof cb == "function"){
        cb("success");
        console.log(`users.${name}`);
        console.log(`User ${name} removed from database.`);
      }else{
        let msg = `Failed to remove user from database.`
        socket.emit('msg',msg);
      }  
   });  
    
socket.on('get-logo-url',cb=>{
   if(typeof cb == "function"){
        cb({result:'success',url:clientConfig.theme.logo});
        
      }else{
        let msg = `Failed to get project logo.`
        socket.emit('msg',msg);
      } 
 }); 
    
socket.on('get-current-players',cb=>{
  let players = {};
  Object.keys(state.players).forEach(key=>{
    players[key]= {name:state.players[key].name};
  });
  cb(players); 
}); 
    

       
    
  }
  
}

module.exports = dashboardAPI;