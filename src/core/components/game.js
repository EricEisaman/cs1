import config from '../../../.data/client-config';
export default CS1=>{AFRAME.registerComponent('game', {
  schema: {mode:{type: 'string',default:'standard'}},
  init: function () {
    
    CS1.game = this;
    this.isRunning = false;
    this.name = config.gameName;
    this.announcements = {};
    this.announcements['welcome'] = config.welcomeMsg;
    this.welcomeDelay = config.voice.welcomeDelay;
    
    document.querySelector('#scene-container').style.display='block';
    document.querySelector('#loading-screen').style.display='none';
    
    CS1.myPlayer = document.querySelector('#my-player');
    CS1.cam = document.querySelector('#cam');
    CS1.myPlayer.spawnPos = CS1.myPlayer.getAttribute('position');
    CS1.myPlayer.spawnRot = CS1.myPlayer.getAttribute('rotation');
    CS1.myPlayer.startSpeed = CS1.myPlayer.components["movement-controls"].data.speed;
    
    CS1.op_template = document.querySelector('#starter-avatar');
    
    
    CS1.voices = window.speechSynthesis.getVoices();
    
    CS1.say = function(msg,name="none given") {
      var msg = new SpeechSynthesisUtterance(msg);
      if(name == "none given")
        msg.voice = speechSynthesis.getVoices().filter(function(voice) { return voice.name == config.voice.name; })[0];
      else
        msg.voice = speechSynthesis.getVoices().filter(function(voice) { return voice.name == name; })[0];
      msg.pitch = config.voice.pitch;
      msg.rate = config.voice.rate;
      msg.volume = config.voice.volume;
      speechSynthesis.speak(msg);
    }
    
    CS1.printVoices = ()=>{
      speechSynthesis.getVoices().forEach(v=>{
        console.log(v.name,v.lang);
      });
    }
    
    CS1.sounds = {};
    
    Object.keys(config.sounds).forEach(soundName=>{
      CS1.sounds[soundName] = new Audio(config.sounds[soundName].url);
      CS1.sounds[soundName].loop = config.sounds[soundName].loop || false;
      CS1.sounds[soundName].volume = config.sounds[soundName].volume || 1;
    });
    
    CS1.scene=AFRAME.scenes[0];
    
    //uncomment to make player wait until player joined sound is done
    //CS1.myPlayer.components["movement-controls"].data.speed=0;
    
    CS1.otherPlayers = {};
    
    CS1.addOtherPlayer = newPlayerObject=>{
      console.log(`Adding new player with id: ${newPlayerObject.id}`)
      console.log(newPlayerObject);
      console.log(newPlayerObject.data);
      let c = config.avatar.models[newPlayerObject.data.faceIndex];
      let p = document.createElement('a-entity');
      // p.model = CS1.op_template.cloneNode();
      p.model = document.createElement('a-gltf-model');
      p.model.setAttribute('src',`${c.url}`);
      p.appendChild(p.model);
      p.setAttribute('player','');
      p.model.setAttribute('shadow','');
      p.model.setAttribute('scale',`${c.scale} ${c.scale} ${c.scale}`);
      p.model.setAttribute('visible','true');
      p.model.setAttribute('animation-mixer','clip:idle');
      p.id = newPlayerObject.id;
      p.name = newPlayerObject.name;
      p.setAttribute('position',`${newPlayerObject.data.position.x} ${newPlayerObject.data.position.y} ${newPlayerObject.data.position.z}`);
      p.model.setAttribute('rotation',`${-newPlayerObject.data.rotation.x} ${newPlayerObject.data.rotation.y+180} ${newPlayerObject.data.rotation.z}`);
      p.msg = document.createElement('a-entity');
      let test = `Hello\nI am\n${newPlayerObject.name}!`;
      p.msg.setAttribute('text',`value:${test};
                                     align:center;
                                     width:8;
                                     wrap-count:24; 
                                     color:yellow`);
      p.msg.setAttribute('position',c.msg.offset);
      p.msg.setAttribute('rotation','0 0 0');
      p.model.appendChild(p.msg);
      CS1.scene.appendChild(p);
      CS1.otherPlayers[p.id]=p;
      CS1.sounds.playerJoined.play();
    }
  
    CS1.updateOtherPlayers = o=>{
      Object.keys(o).forEach(function(key,index) {
        if(key != CS1.socket.id){
          if(CS1.otherPlayers[key]){
            let c = config.avatar.models[o[key].faceIndex];
            let op = CS1.otherPlayers[key];
            if(op.faceIndex != o[key].faceIndex){
              op.faceIndex = o[key].faceIndex;
            }
            op.faceIndex = o[key].faceIndex;
            op.setAttribute('position',`${o[key].position.x} ${o[key].position.y+c.yOffset} ${o[key].position.z}`);
            op.model.setAttribute('rotation',`${-o[key].rotation.x} ${o[key].rotation.y+180} ${o[key].rotation.z}`);
            op.model.setAttribute('src',`${c.url}`);
            //op.model.setAttribute('animation-mixer',`clip:${op.faceIndex}`);
            op.model.setAttribute('scale',`${c.scale} ${c.scale} ${c.scale}`);
            op.msg.setAttribute('text',`color:${c.msg.color}`);
            op.msg.setAttribute('position',`${c.msg.offset}`);
          }
        }
      });
    }
  
    CS1.removePlayer = id=>{
      CS1.otherPlayers[id].parentNode.removeChild(CS1.otherPlayers[id]);
      delete CS1.otherPlayers[id]; 
      CS1.sounds.playerLeft.play();
    }
  
    CS1.setPlayerMessage = data=>{
      if(CS1.otherPlayers[data.id]){
        let c = config.avatar.models[CS1.otherPlayers[data.id].faceIndex];
        CS1.otherPlayers[data.id].msg.setAttribute('text',`value:${data.msg};
        align:center;width:8;wrap-count:24;color:${c.msg.color}`);
      }
    }
    
    this.totalSteps = 0;
  
  },
  
  tick: function (time,dt) {
    if(!this.hasBegun)return;
    if(++this.totalSteps%6 == 0) {
      let playerData = {};
      let pos = CS1.myPlayer.getAttribute('position');
      pos.x = Number(pos.x.toFixed(2));
      pos.y = Number(pos.y.toFixed(2));
      pos.z = Number(pos.z.toFixed(2));
      playerData.position = pos;
      let rot = CS1.cam.getAttribute('rotation');
      rot.x = Number(Number(rot.x).toFixed(1));
      rot.y = Number(Number(rot.y).toFixed(1));
      rot.z = Number(Number(rot.z).toFixed(1));
      playerData.rotation = rot;
      playerData.faceIndex = CS1.socket.playerData.faceIndex;
      CS1.socket.setPlayerData(playerData);
      CS1.socket.sendUpdateToServer();
      if(this.totalSteps%36 == 0){
        CS1.hud.oxygenMeter.animateTo(CS1.hud.oxygenMeter.el.value-0.0035);
      }
    }
  },
  
  start: function () {
    
    if(CS1.device == "Oculus Quest"){
        CS1.socket.emit('vr-log',{msg:`${CS1.myPlayer.name} is playing with an Oculus VR device!`,channel:'0'});
      }
    
    CS1.sounds.playerJoined.onended = ()=>{
      CS1.myPlayer.components["movement-controls"].data.speed=CS1.myPlayer.startSpeed;
      this.isRunning=true;
    }
    
    CS1.sounds.playerJoined.play()
     .catch(err=>{
        CS1.myPlayer.components["movement-controls"].data.speed=CS1.myPlayer.startSpeed;
        this.isRunning=true;      
      });
    
    
    let c = config.avatar.models[0];
    CS1.game.hasBegun = true;
    let playerData = {};
    let pos = CS1.myPlayer.getAttribute('position');
    pos.x = Number(pos.x.toFixed(2));
    pos.y = Number(pos.y.toFixed(2))+0.3;
    pos.z = Number(pos.z.toFixed(2));
    playerData.position = pos;
    let rot = CS1.myPlayer.getAttribute('rotation');
    rot.x = Number(Number(rot.x).toFixed(1));
    rot.y = Number(Number(rot.y).toFixed(1));
    rot.z = Number(Number(rot.z).toFixed(1));
    playerData.rotation = rot;
    playerData.faceIndex = 0;
    CS1.socket.emit('new-player',playerData);
    
    // Create a new event    
    let event = new CustomEvent(
      "gameStart", 
      {
        detail: {
          message: "Let's play!",
          time: new Date(),
        },
        bubbles: true,
        cancelable: true
      }
    );

    // Dispatch the event
    document.body.dispatchEvent(event);
    
  },
  
  playerDistanceTo: function (entity) {
    return CS1.myPlayer.object3D.position.distanceTo(entity.object3D.position);
  },
  
  fireParticles: function(el){
    el.components.particles.fire();
  }
   
});}