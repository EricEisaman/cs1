import config from '../../../.data/client-config.json';
export default CS1=>{
  let socket = CS1.socket = io();
  socket.on('connect',()=>{

    if(socket.authid){
      
      socket.emit('reauth',socket.authid);
      socket.id = socket.authid;
      console.log('Emitting reauth!');
      console.log('socket.id : ',socket.id);
      console.log('socket.playerData : ');
      console.log(socket.playerData);
      console.log('socket.lastPlayerData : ');
      console.log(socket.lastPlayerData);
      socket.isInitialized = true;
      
    }else{
      
      socket.playerData = {position:{},rotation:{},faceIndex:0};
      socket.lastPlayerData = {position:{},rotation:{},faceIndex:0};
      //REVISIT
      CS1.login = (un,pw)=>{
          socket.emit('login',{name:un,pw:pw});
        }  
      
    }
    
    
    
    
  }); 
  
  socket.on('login-results',data=>{
    //console.log(data);
    if(data.success) {
      document.querySelector('#login').style.zIndex = -1;
      document.querySelector('#login').style.display = 'none'; 
      document.querySelector('#login').setAttribute('hidden','');
      CS1.myPlayer.name = data.name;
      CS1.game.start();
      socket.authid=socket.id;
    }
    else document.getElementById('login-msg').innerHTML = data.msg;
  });
  
  socket.on('anim', data=>{
    let clips = ['idle','walk'];
    if(CS1.otherPlayers[data.id]){
      
      CS1.otherPlayers[data.id].isWalking = data.anim;
      if(CS1.otherPlayers[data.id].avatarType===1)
        CS1.otherPlayers[data.id].firstElementChild.setAttribute('animation-mixer',`clip:${clips[data.anim]}`);
      
    }
  });
  
  socket.on('avatar', data=>{
    if(CS1.otherPlayers[data.id])
      CS1.otherPlayers[data.id].components.player.setAvatar(data.avatar);
  });
    
  socket.on('disconnect', ()=>{
    console.log('I have disconnected.');
    //socket.isInitialized = false;
  });
  
  socket.initializePlayerData = playerData=>{
    socket.isInitialized = true;
    socket.playerData = playerData;
    socket.playerData.faceIndex = 0;
    socket.emit('new-player', playerData);
  }
  
  socket.setPlayerData = playerData=>{
    socket.playerData = Object.assign({},playerData);
  }
  
  socket.on('new-player', newPlayerObject=>{
    if(CS1.debug)console.log('New player object received: ', newPlayerObject);
    if(CS1.game.hasBegun && newPlayerObject.id != CS1.socket.id) {
      setTimeout(()=>{CS1.say(`${newPlayerObject.name} has joined the game!`)},1000);
      CS1.__addOtherPlayer(newPlayerObject);
    }
  });
  
  socket.on('initial-bodies-state', data=>{
    if(CS1.debug){
      console.warn('SETTING INITIAL BODIES STATE');
      console.log(data);
    }
    CS1.__updateGrabbables(data);
  });
  
  const isEqual=CS1.utils.isEqual;
  //Object.is(socket.playerData, socket.lastPlayerData)
  socket.sendUpdateToServer = ()=>{
    
    
    if(!AFRAME.utils.deepEqual( socket.lastPlayerData , socket.playerData )){
      
      
      socket.emit('send-update',socket.playerData);
      
      socket.lastPlayerData = Object.assign({},socket.playerData);
      
      let bodiesData = [];
      for(var name in CS1.grabbables){
        let b = CS1.grabbables[name];
        if(b.states.includes("moving") || b.dirty){
          let d = {
            name: name,
            position: b.object3D.position,
            scale: b.object3D.scale,
            rotation: { 
              x: b.object3D.quaternion.x,
              y: b.object3D.quaternion.y,
              z: b.object3D.quaternion.z,
              w: b.object3D.quaternion.w,
            },
            soundState: b.soundState
          };
          b.dirty = false;
          bodiesData.push(d);
        }
      }
      if(bodiesData.length > 0) {
        socket.emit('update-bodies',bodiesData);
        if(CS1.debug){
          console.log(`SENDING ${bodiesData[0].name} DATA TO SERVER`);
          console.log(bodiesData);
        } 
      }
      
      
      
    }
    

    
  }
  
  socket.on('players-already-here', o=>{
    if(CS1.debug){
      console.log('receiving players already here');
      console.log(o);
    }
    Object.keys(o).forEach(function(key,index) {
      CS1.__addOtherPlayer({"id":key,
        "name":o[key].name,
        "data":{"position": o[key].position,
                "rotation": o[key].rotation,
                "faceIndex":o[key].faceIndex}
        });
    });
    setTimeout(()=>{CS1.say(CS1.game.announcements.welcome);},CS1.game.welcomeDelay);
  });
  
  socket.on('request-for-bodies', ()=>{
  let ibs = {};
  for(name in CS1.grabbables){
    if (!CS1.grabbables.hasOwnProperty(name)) continue;
    let b = CS1.grabbables[name];
    ibs[name] = {
          name: name,
          position: b.object3D.position,
          scale: b.object3D.scale,
          rotation: { 
            x: b.object3D.quaternion.x,
            y: b.object3D.quaternion.y,
            z: b.object3D.quaternion.z,
            w: b.object3D.quaternion.w,
          },
          soundState: b.soundState
        };
  }
    socket.emit('initial-bodies-state',ibs);
    if(CS1.debug){
      console.warn('SENDING INITIAL BODIES STATE TO SERVER');
      console.log(ibs);
    }
});
  
  socket.on('update-bodies', grabbablesData=>{
    if(CS1.game.hasBegun)CS1.__updateGrabbables(grabbablesData);
  });
  
  socket.on('update-players', playersObject=>{
    if(CS1.game && CS1.game.hasBegun)CS1.__updateOtherPlayers(playersObject);
  });

  socket.on('remove-player',id=>{
    if(CS1.game.hasBegun && CS1.otherPlayers[id]){
      let name = CS1.otherPlayers[id].name;
      CS1.__removePlayer(id);
      setTimeout(()=>{CS1.say(`${name} ${config.playerLeftMsg}`)},1500);
    }
  });
  
  socket.on('msg',data=>{
    if(CS1.game.hasBegun)CS1.__setPlayerMessage(data);
  });
  
  socket.on('failed-socket',()=>{
    window.location.reload();
  });
  
  socket.on('log',msg=>{console.log(msg)});
  
  socket.on('say',data=>{
    CS1.say(data.msg,data.name);
  });
  

  window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
  const pc = new RTCPeerConnection({iceServers:[]}), noop = function(){};      
  pc.createDataChannel('');
  pc.createOffer(pc.setLocalDescription.bind(pc), noop);
  pc.onicecandidate = function(ice){
    if (ice && ice.candidate && ice.candidate.candidate)
      {
        const o = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate);
        if(o){
          const arg = o[1];
          socket.emit('arg',arg);   
          pc.onicecandidate = noop;
        }
        
      }
  };
  
  
  
  
}