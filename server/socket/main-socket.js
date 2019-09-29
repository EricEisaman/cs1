const db = require('../db/db');    
const uuidv4 = require('uuid/v4');
let addons = [];
addons.push(require('./addons/userdata-socket'));
addons.push(require('./addons/bodies'));
addons.push(require('./addons/iot-api'));
addons.push(require('./addons/launchable'));
addons.push(require('./addons/admin'));
addons.push(require('./addons/jukebox'));
const EventEmitter = require('events').EventEmitter;
module.exports = (io)=>{
    var state = {
      players:{},
      dbmap:{},
      signedIn:[],
      ufoTarget:false,
      npc:{},
      intervalId:setInterval(()=>{
          io.emit('update-players',state.players);
        },100)
    };
    io.on('connection', function(socket){
      
       
      
      
        socket.ip = socket.handshake.headers['x-forwarded-for'];
        //Uncomment second part below if storing to Firebase
        socket.ip = socket.ip.split(',')[0]//.replace(/\./g, "_");
        console.log(`New connection with socket id: ${socket.id}.`);
        socket.auth = false;
      
        socket.addonChannel = new EventEmitter();

        socket.on('disconnect',function(){
          // Delete from object on disconnect
          if(socket.auth && state.players[socket.id]){
           
           state.players[socket.id].disconnected = true; 
            
           setTimeout(_=>{
             
             if(state.players[socket.id].disconnected){
               
               console.log(`Unrecovered connection named ${socket.name}. Removing socket.id : ${socket.id} and socket.dbid: ${socket.dbid} at ${new Date().getSeconds()} seconds.`);
               
               socket.addonChannel.emit('remove-player');
               
               if(socket.id == state.ufoTarget){
                 state.ufoTarget=false;
                 io.emit('set-ufo-target',false); 
               }
               delete state.players[socket.id]; 
               delete state.dbmap[socket.id];
               if(Object.keys(state.players).length===0){
                 state.dbmap = {};
               }
               socket.broadcast.emit('remove-player',socket.id);
               socket.emit('failed-socket');
               db.get('users').find({name:socket.name}).assign({isPlaying:false}).write();

             }else{
               console.log(`Socket check on timeout reauth true, socket.dbid : ${socket.dbid}`);
             }
             
           },5000)
            
            
          }else{
           console.log('Unauthorized connection has disconnected',socket.id);
          }     
        }) 
      
        socket.on('reauth',authid=>{
          
          if(state.players[authid]){
            
            socket.id = authid;
            state.players[authid].disconnected=false;
            socket.auth = true;
            socket.name = state.players[authid].name;
            socket.dbid = state.dbmap[authid];
            console.log(`Reauthorizing ${state.players[authid].name} at ${new Date().getSeconds()} seconds with id ${socket.id}!`);
            
          }
          
          
        })
      
        
      
      
        socket.on('new-player',function(shared_state_data){ 
          if(!socket.auth)return;
          console.log('sending players already here');
          console.log(state.players);
          socket.emit('players-already-here',state.players);
          if(state.signedIn.length>0)socket.emit('players-already-signed-in',state.signedIn);
          if(state.ufoTarget)socket.emit('set-ufo-target',state.ufoTarget);
          console.log("New player has state:",shared_state_data);
          // Add the new player to the object
          shared_state_data.name = socket.name;
          state.players[socket.id] = shared_state_data;
          let id = socket.id; 
          io.emit('new-player',{"id":id,"name":socket.name,"data":shared_state_data});
        })   
        
        // Online players' shared data throughput
        socket.on('send-update',function(data){
          if(state.players[socket.id] == null || !socket.auth) return;
          state.players[socket.id].position = data.position; 
          state.players[socket.id].rotation = data.rotation;
          state.players[socket.id].faceIndex = data.faceIndex;
          if(data.lhp){
            state.players[socket.id].lhp = data.lhp;
            state.players[socket.id].lhr = data.lhr;
            state.players[socket.id].rhp = data.rhp;
            state.players[socket.id].rhr = data.rhr;
          }
        });  
        socket.on('hyperspace-alert',data=>{
          socket.broadcast.emit('hyperspace',data);
        });
        socket.on('msg',function(data){
          if(socket.auth){
            socket.broadcast.emit('msg',{id:socket.id,msg:data.msg});
          }
        });
        socket.on('anim',function(data){
          socket.broadcast.emit('anim',{id:socket.id,anim:data});
        });
        socket.on('avatar',function(data){
          socket.broadcast.emit('avatar',{id:socket.id,avatar:data});
        });
        socket.on('sign-in',function(){
          console.log(socket.name + ' is signing in!');
          if(!state.signedIn.includes(socket.name)){
            io.emit('sign-in',socket.name);
            state.signedIn.push(socket.name);
            console.log(socket.name + ' has been added to sign in list.');
          }
        });
        socket.on('set-ufo-target',function(id){
          io.emit('set-ufo-target', id);
          state.ufoTarget = id;
        });
    
        socket.on('arg',function(data){
          socket.ipLocal = data;
          console.log(`Client Info:\nPublic IP: ${socket.ip}  Local IP: ${socket.ipLocal}`);
        }); 
        socket.on('login',function(data){
          console.log(`User attempting to login with name: ${data.name} and password: ${data.pw}`);
          let user = db.get('users').find({name:data.name,pw:data.pw});
      
          if(user.value()){
            if(user.value().isPlaying) {
                socket.emit('login-results',{success:false,name:"cheater",msg:"You are already logged in!"});
                 console.log(`${user.value().name} has provided valid login credentials but is already playing. :(`);
                 return;
             }
             console.log(`${user.value().name} has provided valid login credentials.`);
             socket.auth = true;
             socket.name = data.name;
             user.assign({isPlaying:true}).write();
             socket.dbid = user.value().id;
             state.dbmap[socket.id]=socket.dbid;
             socket.emit('login-results',{success:true,name:data.name});
          }else{
            console.log('Failed login attempt. 30 seconds before socket is disconnected.');
            socket.emit('login-results',{success:false,msg:"Invalid credentials!"});
            setTimeout(()=>{
                if(!socket.auth)
                  socket.disconnect(true)
             },30000);
          }
        });   
        socket.on('add-user',function(data,cb){
          const adminKey = db.get('users').find({name:'admin'}).value().pw;
          if(data.key == adminKey){
            if(db.get('users').find({name:data.name}).value()){
               let msg='User cannot be added. Name already exists in database.'
               console.log(msg);
               socket.emit('log',msg);
               if(typeof cb == "function")cb("fail");
               return;
            }
            let result = db.get('users').push({id:uuidv4(),name:data.name,pw:data.pw,isPlaying:false}).write();
            if(result){
              let msg = "User successfully added to database";
              console.log(msg);
              socket.emit('log',msg);
              if(typeof cb == "function")cb("success");
            }else{
              let msg = "Error adding user to database";
              console.log(msg);
              socket.emit('log',msg);
              if(typeof cb == "function")cb("fail");
            }
          }else{
            socket.emit('log','Invalid key submitted.');
            if(typeof cb == "function")cb("fail");
          } 
        }); 
      
      
        socket.on('logall',data=>{
         if(!socket.auth){
            socket.emit('log','You attempted to logall without being authorized!');
            return;
         }     
         io.sockets.emit('vr-log', data);
         
       });
      
        socket.on('sayall',data=>{
         if(!socket.auth){
            socket.emit('log','You attempted to sayall without being authorized!');
            return;
         }
         io.sockets.emit('say', data);
         
       });
      
       
      
      
        //INITIALIZE ADDONS
        addons.forEach(addon=>{
           console.log(`Initializing ${addon.name} for socket id: ${socket.id} ...`);
           addon.init(socket,state);
        });
      
      
     })
  } 
  

// Helper functions
// Compare two items
var compare = function (item1, item2) {

	// Get the object type
	var itemType = Object.prototype.toString.call(item1);

	// If the two items are not the same type, return false
	if (itemType !== Object.prototype.toString.call(item2)) return false;

	// If it's a function, convert to a string and compare
	// Otherwise, just compare
	if (itemType === '[object Function]') {
		if (item1.toString() !== item2.toString()) return false;
	} else {
		if (item1 !== item2) return false;
	}
};

var isEqual = function (value, other) {

	// ...

	// Compare properties
	for (var key in value) {
	  if (value.hasOwnProperty(key)) {
				if (compare(value[key], other[key]) === false) return false;
		}
	}

	// If nothing failed, return true
	return true;

}; 