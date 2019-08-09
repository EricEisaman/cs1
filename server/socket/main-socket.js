const db = require('../db/db');    
const uuidv4 = require('uuid/v4');
let addons = [];
addons.push(require('./addons/userdata-socket'));
addons.push(require('./addons/iot-api'));
addons.push(require('./addons/launchable'));
addons.push(require('./addons/admin'));
module.exports = (io)=>{
    var state = {
      players:{},
      bodies:{},
      collectibles:[],
      changedBodies:[],
      signedIn:[],
      ufoTarget:false,
      npc:{},
      lastSocketSentBodies:{broadcast:{emit:()=>{}}},
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
        socket.on('new-player',function(shared_state_data){ 
          if(!socket.auth)return;
          console.log('sending players already here');
          console.log(state.players);
          socket.emit('players-already-here',state.players);
          if(state.signedIn.length>0)socket.emit('players-already-signed-in',state.signedIn);
          if(state.ufoTarget)socket.emit('set-ufo-target',state.ufoTarget);
          console.log('changedBodies length:',state.changedBodies.length);
          // (changedBodies.length > 0) && 
          if((Object.keys(state.players).length > 0) ) {
           let ibs = [];
           for(name in state.bodies){
             ibs.push(state.bodies[name]);
           }  
           socket.emit('initial-bodies-state',ibs);
           console.log('sending initial bodies state');
           //console.log(ibs);
          }
          if(Object.keys(state.players).length === 0){
            socket.emit('request-for-bodies');
            socket.emit('request-for-collectibles');
          }else{
            state.collectibles.forEach((c,index)=>{
               if(c.collector){
                 socket.emit('collect',{index:index,collector:c.collector});
                 console.log('Sending collectible update to new player:');
                 //console.log(c);
               }
            });
          }
          console.log("New player has state:",shared_state_data);
          // Add the new player to the object
          shared_state_data.name = socket.name;
          state.players[socket.id] = shared_state_data;
          let id = socket.id; 
          io.emit('new-player',{"id":id,"name":socket.name,"data":shared_state_data});
        })   
        socket.on('disconnect',function(){
          // Delete from object on disconnect
          if(socket.auth){
           console.log(`Player named ${socket.name} disconnected. Removing ${socket.id}`);
           if(socket.id == state.ufoTarget){
             state.ufoTarget=false;
             io.emit('set-ufo-target',false);
           }
           delete state.players[socket.id]; 
           if(Object.keys(state.players)===0){
             state.bodies = {};
             state.changedBodies = [];
           }
           socket.broadcast.emit('remove-player',socket.id);
           socket.emit('failed-socket');
           db.get('users').find({id:socket.dbid}).assign({isPlaying:false}).write();
          }else{
           console.log('Unauthorized connection has disconnected',socket.id);
          }     
        }) 
        // Online players' shared data throughput
        socket.on('send-update',function(data){
          if(state.players[socket.id] == null || !socket.auth) return;
          state.players[socket.id].position = data.position; 
          state.players[socket.id].rotation = data.rotation;
          state.players[socket.id].faceIndex = data.faceIndex;
          //console.log(data);
        });  
        socket.on('request-collection',function(data){
         if(!socket.auth)return;
         // console.log('collection requested');
         // console.log(data);
         console.log(state.collectibles[data.index].collector);
         if(!state.collectibles[data.index].collector){
           state.collectibles[data.index].collector = socket.id;
           io.emit('collect',{index:data.index,collector:socket.id});
           console.log('collection made');
           if(state.collectibles[data.index].spawns){
             setTimeout(()=>{
               io.emit('spawn-collectible',data.index);
               state.collectibles[data.index].collector = false;
               console.log('calling to spawn collectible');
             },state.collectibles[data.index].spawnDelay*1000);
           }
         }
        });
        socket.on('initial-collectibles-state',function(d){
           console.log('Collectibles initializing.');
           for(let i=0; i<d.length; i++){
             let c = {};
             c.spawns = d[i].spawns;
             c.spawnDelay = Number(d[i].spawnDelay);
             c.collector = false;
             state.collectibles[i] = c;
           }
          //console.log(collectibles);
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
      
      
      
      
        socket.on('register-npc',data=>{
          if(!state.npc[data.name]){
            state.npc[data.name]={};
            state.npc[data.name].waypoints=data.waypoints;
            console.log('Registering NPC.');
            //console.log(npc[data.name]);
          }
        });
        socket.on('set-npc-waypoints',data=>{
          if(state.npc[data.name]){
            state.npc[data.name].waypoints=data.waypoints;
            console.log('Setting NPC waypoints.');
            //console.log(npc[data.name]);
          }
        });
        socket.on('add-npc-waypoint',data=>{
          if(state.npc[data.name]){
            state.npc[data.name].waypoints.push(data.waypoint);
            console.log('Adding NPC waypoint.');
            console.log(state.npc[data.name]);
          }
        });
        socket.on('npc-move',data=>{
          io.emit('npc-move',data);
        });
      
      
      
        socket.on('initial-bodies-state',obj=>{
          console.log('Initial bodies state received.');
          state.bodies = obj;
        });
        socket.on('update-bodies',function(data){
          //console.log(data);
          state.changedBodies = data;
          state.changedBodies.forEach(bd=>{
            state.bodies[bd.name]=bd;
          });
          if(Object.keys(state.players).length > 1 ) socket.broadcast.emit('update-bodies',state.changedBodies);
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
        socket.on('add-user',function(data){
          if(data.key == process.env.ADMIN_KEY){
            if(db.get('users').find({name:data.name}).value()){
               let msg='User cannot be added. Name already exists in database.'
               console.log(msg);
               socket.emit('log',msg);
               return;
            }
            let result = db.get('users').push({id:uuidv4(),name:data.name,pw:data.pw,isPlaying:false}).write();
            if(result){
              let msg = "User successfully added to database";
              console.log(msg);
              socket.emit('log',msg);
            }else{
              let msg = "Error adding user to database";
              console.log(msg);
              socket.emit('log',msg);
            }
          } 
        }); 
      
      
       socket.on('logall',data=>{
         
         io.sockets.emit('vr-log', data);
         
       });
      
      socket.on('sayall',data=>{
         
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