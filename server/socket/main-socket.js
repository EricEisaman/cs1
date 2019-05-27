const db = require('../db/db');  
const uuidv4 = require('uuid/v4');
let addons = [];
let userdataSocket = require('./addons/userdata-socket');
addons.push(userdataSocket);
let iotapi = require('./addons/iot-api');
addons.push(iotapi);
module.exports = (io)=>{
    var players = {};
    var bodies = {};
    var collectibles = [];
    var changedBodies = [];
    var signedIn = [];
    var ufoTarget = false;
    var npc = {};
    var lastSocketSentBodies = {broadcast:{emit:()=>{}}};
    let intervalId = setInterval(()=>{
          io.emit('update-players',players);
        },100);
    io.on('connection', function(socket){
        socket.ip = socket.handshake.headers['x-forwarded-for'];
        //Uncomment second part below if storing to Firebase
        socket.ip = socket.ip.split(',')[0]//.replace(/\./g, "_");
        console.log(`New connection with socket id: ${socket.id}.`);
        socket.auth = false;
        socket.on('new-player',function(shared_state_data){ 
          if(!socket.auth)return;
          console.log('sending players already here');
          console.log(players);
          socket.emit('players-already-here',players);
          if(signedIn.length>0)socket.emit('players-already-signed-in',signedIn);
          if(ufoTarget)socket.emit('set-ufo-target',ufoTarget);
          console.log('changedBodies length:',changedBodies.length);
          // (changedBodies.length > 0) && 
          if((Object.keys(players).length > 0) ) {
           let ibs = [];
           for(name in bodies){
             ibs.push(bodies[name]);
           }  
           socket.emit('initial-bodies-state',ibs);
           console.log('sending initial bodies state');
           //console.log(ibs);
          }
          if(Object.keys(players).length === 0){
            socket.emit('request-for-bodies');
            socket.emit('request-for-collectibles');
          }else{
            collectibles.forEach((c,index)=>{
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
          players[socket.id] = shared_state_data;
          let id = socket.id; 
          io.emit('new-player',{"id":id,"name":socket.name,"data":shared_state_data});
        })   
        socket.on('disconnect',function(){
          // Delete from object on disconnect
          if(socket.auth){
           console.log(`Player named ${socket.name} disconnected. Removing ${socket.id}`);
           if(socket.id == ufoTarget){
             ufoTarget=false;
             io.emit('set-ufo-target',false);
           }
           delete players[socket.id]; 
           if(Object.keys(players)===0){
             bodies = {};
             changedBodies = [];
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
          if(players[socket.id] == null || !socket.auth) return;
          players[socket.id].position = data.position; 
          players[socket.id].rotation = data.rotation;
          players[socket.id].faceIndex = data.faceIndex;
          //console.log(data);
        });  
        socket.on('request-collection',function(data){
         if(!socket.auth)return;
         // console.log('collection requested');
         // console.log(data);
         console.log(collectibles[data.index].collector);
         if(!collectibles[data.index].collector){
           collectibles[data.index].collector = socket.id;
           io.emit('collect',{index:data.index,collector:socket.id});
           console.log('collection made');
           if(collectibles[data.index].spawns){
             setTimeout(()=>{
               io.emit('spawn-collectible',data.index);
               collectibles[data.index].collector = false;
               console.log('calling to spawn collectible');
             },collectibles[data.index].spawnDelay*1000);
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
             collectibles[i] = c;
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
          if(!signedIn.includes(socket.name)){
            io.emit('sign-in',socket.name);
            signedIn.push(socket.name);
            console.log(socket.name + ' has been added to sign in list.');
          }
        });
        socket.on('set-ufo-target',function(id){
          io.emit('set-ufo-target', id);
          ufoTarget = id;
        });
      
      
      
      
        socket.on('register-npc',data=>{
          if(!npc[data.name]){
            npc[data.name]={};
            npc[data.name].waypoints=data.waypoints;
            console.log('Registering NPC.');
            //console.log(npc[data.name]);
          }
        });
        socket.on('set-npc-waypoints',data=>{
          if(npc[data.name]){
            npc[data.name].waypoints=data.waypoints;
            console.log('Setting NPC waypoints.');
            //console.log(npc[data.name]);
          }
        });
        socket.on('add-npc-waypoint',data=>{
          if(npc[data.name]){
            npc[data.name].waypoints.push(data.waypoint);
            console.log('Adding NPC waypoint.');
            console.log(npc[data.name]);
          }
        });
        socket.on('npc-move',data=>{
          io.emit('npc-move',data);
        });
      
      
      
        socket.on('initial-bodies-state',obj=>{
          console.log('Initial bodies state received.');
          bodies = obj;
        });
        socket.on('update-bodies',function(data){
          console.log(data);
          changedBodies = data;
          changedBodies.forEach(bd=>{
            bodies[bd.name]=bd;
          });
          if(Object.keys(players).length > 1 ) socket.broadcast.emit('update-bodies',changedBodies);
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
      
      
       socket.on('vr-log',data=>{
         
         io.sockets.emit('vr-log', data);
         
       });
      
      
        //INITIALIZE ADDONS
        addons.forEach(addon=>{
           console.log(`Initializing ${addon.name} for socket id: ${socket.id} ...`);
           addon.init(socket);
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