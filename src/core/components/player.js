import config from '../../../.data/client-config.json';

export default CS1=>{
  
  AFRAME.registerSystem('player', {
  schema: {
    avatars:{default:config.avatar.models}
  },  // System schema. Parses into `this.data`.

  init: function () {
    
    function avatarType2Add(p,c){
      
      p.model.removeAttribute('gltf-model');

      
      if(!p.HEAD){
        
        
        p.HEAD = document.createElement('a-gltf-model');
        p.HAND_L = document.createElement('a-gltf-model');
        p.HAND_R = document.createElement('a-gltf-model');
        
        p.model.appendChild(p.HEAD);
        p.model.appendChild(p.HAND_L);
        p.model.appendChild(p.HAND_R);
        
        p.HEAD.setAttribute('src',c.url);
        p.HAND_L.setAttribute('src',c.lefthand);
        p.HAND_R.setAttribute('src',c.righthand);
        
      }else{
        p.HEAD.setAttribute('visible',true);
        p.HAND_L.setAttribute('visible',true);
        p.HAND_R.setAttribute('visible',true);
      }
      
      
    }
    
    
    CS1.__addOtherPlayer = newPlayerObject=>{
      console.log(`Adding new player with id: ${newPlayerObject.id}`)
      console.log(newPlayerObject);
      console.log(newPlayerObject.data);
      let c = config.avatar.models[newPlayerObject.data.faceIndex];
      let p = document.createElement('a-entity');
      p.model = document.createElement('a-gltf-model');
      p.avatarType = c.type;
      p.faceIndex = newPlayerObject.data.faceIndex;
      p.device = newPlayerObject.data.device;
      p.appendChild(p.model);
      p.setAttribute('player','');
      p.model.setAttribute('shadow','');
      p.model.setAttribute('scale',`${c.scale} ${c.scale} ${c.scale}`);
      p.model.setAttribute('visible','true');
      if(p.avatarType === 1){
        
         
        p.model.setAttribute('src',`${c.url}`);
        p.model.setAttribute('animation-mixer','clip:idle');
        p.model.setAttribute('rotation',`${-newPlayerObject.data.rotation.x} ${newPlayerObject.data.rotation.y+180} ${newPlayerObject.data.rotation.z}`);
        
      } else if(p.avatarType === 2){
         
        avatarType2Add(p,c);
       
       
      }
        
      p.id = newPlayerObject.id;
      p.name = newPlayerObject.name;
      p.setAttribute('position',`${newPlayerObject.data.position.x} ${newPlayerObject.data.position.y} ${newPlayerObject.data.position.z}`);
      //DO SOMETHING MAYBE HERE WITH AVATAR TYPE 2
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
  
    CS1.__updateOtherPlayers = o=>{
      Object.keys(o).forEach(function(key,index) {
        if(key != CS1.socket.id){
          if(CS1.otherPlayers[key]){
            let c = config.avatar.models[o[key].faceIndex];
            let op = CS1.otherPlayers[key];
            
            if(op.faceIndex != o[key].faceIndex){
              
              
              op.faceIndex = o[key].faceIndex;
              (c.type == 1)?op.model.setAttribute('src',c.url):op.model.setAttribute('src','');
              
              if(op.avatarType != c.type){
                
                op.avatarType = c.type;
                
                if(c.type == 1){
                  //op.model.object3D.rotateY(Math.PI);
                  //op.msg.setAttribute('rotation','0 0 0'); 
                  
                  if(op.HEAD){
                      op.HEAD.setAttribute('visible',false);
                      op.HAND_L.setAttribute('visible',false);
                      op.HAND_R.setAttribute('visible',false);
                    }
                  op.model.setAttribute('animation-mixer','clip:idle');
                  op.model.object3D.position.y = 0;
                  
                  
                }  
                else{
                  
                  op.model.setAttribute('rotation','0 0 0');  
                  avatarType2Add(op,c);
                }
                    
                
                  
              }
              
              
            }
            op.setAttribute('position',`${o[key].position.x} ${o[key].position.y+c.yOffset} ${o[key].position.z}`);
            op.model.setAttribute('scale',`${c.scale} ${c.scale} ${c.scale}`);
            op.msg.setAttribute('text',`color:${c.msg.color}`);
            if(    op.avatarType===2 &&   op.HEAD  &&  (op.device === 'Oculus Quest')   ){
              
              
              op.model.object3D.rotation.set(0,  THREE.Math.degToRad(o[key].rotation.y+180), 0 );
              if(op.isWalking){ 
                  op.model.object3D.position.y = Math.cos(CS1.myPlayer.timePlayed/100)/10;
              }
              
              op.msg.object3D.position.set(0,3,0);
              op.HEAD.object3D.position.y = 1.4;
              op.HEAD.object3D.rotation.set( THREE.Math.degToRad(-o[key].rotation.x/2), 0, 0 );
              
              op.HAND_L.object3D.position.set(-1.2*o[key].lhp.x , 1.2*o[key].lhp.y+0.1, -3*o[key].lhp.z);
              op.HAND_L.object3D.rotation.set(THREE.Math.degToRad(-o[key].lhr.x+45) , 
                                              THREE.Math.degToRad(o[key].lhr.y-90) , 
                                              THREE.Math.degToRad(o[key].lhr.z)
                                             );
              op.HAND_R.object3D.position.set(-1.2*o[key].rhp.x  , 1.2*o[key].rhp.y+0.1 , -3*o[key].rhp.z); 
              op.HAND_R.object3D.rotation.set(THREE.Math.degToRad(-o[key].rhr.x+45) , 
                                              THREE.Math.degToRad(o[key].rhr.y+90) , 
                                              THREE.Math.degToRad(o[key].rhr.z)
                                             );
              

              
            }
            else if(op.avatarType===2 && op.HEAD){  // TYPE 2 WITHOUT OCULUS
              
              op.msg.setAttribute('position',`${c.msg.offset}`);
              
              op.model.object3D.rotation.set(0,  THREE.Math.degToRad(o[key].rotation.y+180), 0 );
              if(op.isWalking){ 
                  op.model.object3D.position.y = 1.4 + Math.cos(CS1.myPlayer.timePlayed/100)/10;
              }
              else op.model.object3D.position.y = 1.4;
              
              op.HEAD.object3D.rotation.set( THREE.Math.degToRad(-o[key].rotation.x/2), 0, 0 );
              
              op.HAND_L.object3D.position.set(1 , 0 , 0);
              op.HAND_L.object3D.rotation.set(THREE.Math.degToRad(0) , 
                                              THREE.Math.degToRad(0) , 
                                              THREE.Math.degToRad(0)
                                             );
              op.HAND_R.object3D.position.set(-1  , 0 , 0);
              op.HAND_R.object3D.rotation.set(THREE.Math.degToRad(0) , 
                                              THREE.Math.degToRad(0) , 
                                              THREE.Math.degToRad(0)
                                             );
            
          
              
              
            }
            else if(op.avatarType===1){
              op.msg.setAttribute('position',`${c.msg.offset}`);
              op.model.setAttribute('rotation',`${-o[key].rotation.x/8} ${o[key].rotation.y+180} ${o[key].rotation.z}`);  
            }
            
            
            
          }
        }
      });
    }
  
    CS1.__removePlayer = id=>{
      CS1.otherPlayers[id].parentNode.removeChild(CS1.otherPlayers[id]);
      delete CS1.otherPlayers[id]; 
      CS1.sounds.playerLeft.play();
    }
  
    CS1.__setPlayerMessage = data=>{
      if(CS1.otherPlayers[data.id]){
        let c = config.avatar.models[CS1.otherPlayers[data.id].faceIndex];
        CS1.otherPlayers[data.id].msg.setAttribute('text',`value:${data.msg};
        align:center;width:8;wrap-count:24;color:${c.msg.color}`);
      }
    }
    
  },

 
});
  
  AFRAME.registerComponent('player', {
    schema:{
      me:{type:'boolean',default:false},
      eyelevel:{default:1.6},
      cursorcolor:{default:'crimson'},
      rayobjects:{default:'[grabbable],.screen,.collidable,.jukebox'},
      rayfar:{default:4},
      speed:{default:0.2}
    },
    init: function () {
      const self = this;
      if(this.data.me){
        CS1.myPlayer = this.el;
        this.addCam(self);
        this.addHands(self);
        this.isWalking=false;
        this.addMyListeners();
        this.el.timePlayed = 0;
        this.el.setAttribute('chat','');
        this.el.setAttribute('userdata','');
        CS1.myPlayer.spawnPos = this.el.getAttribute('position');
        CS1.myPlayer.spawnRot = this.el.getAttribute('rotation');
        this.totalSteps = 0;
        this.active = false;
      }else{
        
      }
    
    },
    addCam: function(self){
      const ic = document.querySelector('[camera][wasd-controls]');
      ic.removeAttribute('wasd-controls');
      ic.removeAttribute('look-controls');
      ic.setAttribute('camera','active:false');
      //console.log(ic);
      self.cam = document.createElement('a-entity');
      self.cam.id = 'cam';
      CS1.cam = self.cam;
      self.cam.setAttribute('camera','active:true');
      self.cam.setAttribute('position',`0 ${this.data.eyelevel} 0`);
      self.cam.setAttribute('look-controls','pointerLockEnabled:true;reverseTouchDrag:true');
      const cc = document.createElement('a-cursor');
      cc.id = 'cam-cursor';
      cc.setAttribute('material',`color:${this.data.cursorcolor}`);
      cc.setAttribute('raycaster',`objects:${this.data.rayobjects};far:${this.data.rayfar}`);
      self.cam.appendChild(cc);
      self.el.appendChild(self.cam);
      self.cam.addEventListener('loaded',_=>{
        ic.parentNode.removeChild(ic);
      });
    },
    addHands: function(self){
      self.lh = document.createElement('a-entity');
      self.lh.setAttribute('laser-controls','hand:left');
      //self.lh.setAttribute('position','-1 0 0');
      //self.lh.setAttribute('oculus-touch-controls','hand:left');
      self.lh.setAttribute('raycaster',`objects:${this.data.rayobjects};far:${this.data.rayfar};useWorldCoordinates:true`);
      self.rh = document.createElement('a-entity');
      self.rh.setAttribute('laser-controls','hand:right');
      //self.rh.setAttribute('position','1 0 0');
      //self.rh.setAttribute('oculus-touch-controls','hand:right');
      self.rh.setAttribute('raycaster',`objects:${this.data.rayobjects};far:${this.data.rayfar};useWorldCoordinates:true`);
      self.el.appendChild(self.lh);
      self.el.appendChild(self.rh);
    },
    addMyListeners: function(){
      let self = this;
      CS1.myPlayer.setAttribute('movement-controls',`speed:0;camera:#cam`);
      document.addEventListener('gameStart',e=>{
        //console.log('Handling gameStart on my player.');
        self.el.id = CS1.socket.id;
        self.el.classList = 'my-player';
        self.active = true;
        
        
        
        if(CS1.device == 'Oculus Quest'){
          self.setOculusCtls();
          CS1.scene.enterVR();
          this.lh.addEventListener('model-loaded',e=>{
            
            this.lh.loaded = true;
            

            const object = this.lh.getObject3D('mesh');
            
            if (object) {
              object.traverse(function (node) {
                if (node.isMesh && node.name === 'stick') {
              

                  
                 }
               });
            }
            
            
            
            
          });
        }
        if(CS1.device == 'Mobile'){
          this.setTouchCtls();
        }
        if(CS1.device == 'Standard'){
          this.setKeyCtls();
        }
          
          
        
        CS1.myPlayer.setAttribute('movement-controls',`speed:${self.data.speed};camera:#cam`);
        
//         CS1.sounds.playerJoined.onended = ()=>{
//           CS1.myPlayer.setAttribute('movement-controls',`speed:${self.data.speed};camera:#cam`);
//         }

        CS1.sounds.playerJoined.play()
        .catch(err=>{
          //CS1.myPlayer.setAttribute('movement-controls',`speed:${self.data.speed};camera:#cam`);            
        });
        
        
        //let c = config.avatar.models[0];
        let playerData = {};
        let pos = Object.assign({},CS1.myPlayer.getAttribute('position'));
        pos.x = Number(pos.x.toFixed(2));
        pos.y = Number(pos.y.toFixed(2))+0.3;
        pos.z = Number(pos.z.toFixed(2));
        playerData.position = pos;
        let rot = Object.assign({},CS1.cam.getAttribute('rotation'));
        rot.x = Number(Number(rot.x).toFixed(1));
        rot.y = Number(Number(rot.y).toFixed(1));
        rot.z = Number(Number(rot.z).toFixed(1));
        playerData.rotation = rot;
        playerData.faceIndex = 1;
        playerData.device = CS1.device;
        CS1.socket.playerData.faceIndex = playerData.faceIndex;
        CS1.myPlayer._avatarType = config.avatar.models[CS1.socket.playerData.faceIndex].type;
        if(    (CS1.device == 'Oculus Quest') &&  (CS1.myPlayer._avatarType === 2)  ){
          playerData.lhp = {x:0,y:0,z:0};
          playerData.lhr = {x:0,y:0,z:0};
          playerData.rhp = {x:0,y:0,z:0};
          playerData.rhr = {x:0,y:0,z:0};
        }
        CS1.socket.emit('new-player',playerData);
        
        
        
        
        
        
        
        
      })
    },
    setKeyCtls: function(){
      document.body.addEventListener('keydown',e=>{
        // 0=idle, 1=walk
         switch(e.which){
           case 87:
           case 38:
           case 83:
           case 40:
             if(!this.isWalking){
               CS1.socket.emit('anim',1);
               this.isWalking=true;    
             }       
         }
      });
      document.body.addEventListener('keyup',e=>{
        // 0=idle, 1=walk
         switch(e.which){
           case 87:
           case 38:
           case 83:
           case 40:
             CS1.socket.emit('anim',0);
             this.isWalking=false;
         }
      });
    },
    setTouchCtls: function(){
      window.addEventListener('touchstart',e=>{
        if(!this.isWalking){
               CS1.socket.emit('anim',1);
               this.isWalking=true;    
             }    
      });
      window.addEventListener('touchend',e=>{
         CS1.socket.emit('anim',0);
         this.isWalking=false;
      });
    },
    setOculusCtls: function(){
      
      let lh = this.lh.components["oculus-touch-controls"];
      let rh = this.rh.components["oculus-touch-controls"];
        
      
      setTimeout(()=>{
        
        
        if(AFRAME.utils.device.checkHeadsetConnected()){
          lh.el.addEventListener('thumbsticktouchstart',e=>{
             if(!this.isWalking){
                   CS1.socket.emit('anim',1);
                   this.isWalking=true;    
                 }   
          });
          lh.el.addEventListener('thumbsticktouchend',e=>{
             CS1.socket.emit('anim',0);
             this.isWalking=false; 
          });
          rh.el.addEventListener('thumbsticktouchstart',e=>{
             if(!this.isWalking){
                   CS1.socket.emit('anim',1);
                   this.isWalking=true;    
                 }   
          });
          rh.el.addEventListener('thumbsticktouchend',e=>{
             CS1.socket.emit('anim',0);
             this.isWalking=false; 
          });
        }
        
        
        
      },3000);
      
      
    },
    tick: function(t,dt){
      
    if(!this.data.me && this.active)return;
      
    if(++this.totalSteps%6 == 0) {
      
      
      let playerData = {};
      let pos = Object.assign({},CS1.myPlayer.getAttribute('position'));
      pos.x = Number(pos.x.toFixed(2));
      pos.y = Number(pos.y.toFixed(2));
      pos.z = Number(pos.z.toFixed(2));
      playerData.position = pos;
      let rot = Object.assign({},CS1.cam.getAttribute('rotation'));
      rot.x = Number(Number(rot.x).toFixed(1));
      rot.y = Number(Number(rot.y).toFixed(1));
      rot.z = Number(Number(rot.z).toFixed(1));
      playerData.rotation = rot;
      playerData.faceIndex = CS1.socket.playerData.faceIndex;
      if(   (CS1.device == 'Oculus Quest') &&  (CS1.myPlayer._avatarType === 2)  && this.lh.hasLoaded ){
          
          let lhp = this.lh.getAttribute('position');
            
          playerData.lhp = {};
          playerData.lhp.x = Number(lhp.x.toFixed(2));
          playerData.lhp.y = Number(lhp.y.toFixed(2));
          playerData.lhp.z = Number(lhp.z.toFixed(2));
          let lhr = this.lh.getAttribute('rotation')
          playerData.lhr = {};
          playerData.lhr.x = Number(lhr.x.toFixed(1));
          playerData.lhr.y = Number(lhr.y.toFixed(1));
          playerData.lhr.z = Number(lhr.z.toFixed(1));
          let rhp = this.rh.getAttribute('position')
          playerData.rhp = {};
          playerData.rhp.x = Number(rhp.x.toFixed(2));
          playerData.rhp.y = Number(rhp.y.toFixed(2));
          playerData.rhp.z = Number(rhp.z.toFixed(2));
          let rhr = this.rh.getAttribute('rotation')
          playerData.rhr = {};
          playerData.rhr.x = Number(rhr.x.toFixed(1));
          playerData.rhr.y = Number(rhr.y.toFixed(1));
          playerData.rhr.z = Number(rhr.z.toFixed(1));
        
      }
      CS1.socket.setPlayerData(playerData);
      CS1.socket.sendUpdateToServer();
      if(this.totalSteps%36 == 0 && CS1.hud && CS1.hud.oxygenMeter){
        CS1.hud.oxygenMeter.animateTo(CS1.hud.oxygenMeter.el.value-0.0035);
      }
      
      
    }
      
      
    this.el.timePlayed += dt;
      
      
    },
    setSpeed: function(s){
      if(document.querySelector('#navmesh'))
        this.el.setAttribute('movement-controls',`constrainToNavMesh: true; speed: ${s}`);
      else
        this.el.setAttribute('movement-controls',`speed: ${s}`);  
    }
    
  });
  
  
  
  AFRAME.registerPrimitive('a-player', {
  defaultComponents: {
    player: {me:true},
  },

  // Maps HTML attributes to component properties.
  mappings: {
    eyelevel: 'player.eyelevel',
    cursorcolor: 'player.cursorcolor',
    rayobjects: 'player.rayobjects',
    rayfar: 'player.rayfar',
    speed: 'player.speed'
  }
});
  
  
  
  
  
  
  
  
  
  
}



/*
<a-entity id="my-player" 
              position="0 0 0"
              movement-controls="constrainToNavMesh: true; speed: 0.2"
              player="me:true"
              chat
              userdata>
      
        <a-entity id="cam"
                camera
                position="0 1.6 0"
                rotation="31.283 -12.834 0"
                look-controls="pointerLockEnabled:true;reverseTouchDrag:true">
        
          <a-cursor id="cam-cursor" 
                    material="color:crimson"
                    raycaster="objects:[grabbable],[sign-in],[iot-api], .screen, .collidable;far:4"></a-cursor>

        </a-entity>
        
        <a-entity id="left-hand" position="0 1 0" laser-controls="hand: left"  
                raycaster="objects:[grabbable],[sign-in],[iot-api], .screen, .collidable;far:4;useWorldCoordinates:true" ></a-entity>
        
      
<a-entity id="right-hand" position="0 1 0" laser-controls="hand: right"  
                raycaster="objects:[grabbable],[sign-in],[iot-api], .screen, .collidable;far:4;useWorldCoordinates:true" ></a-entity>
        
        
          
</a-entity>
*/



/*


p.model.addEventListener('model-loaded', () => { 
        
          const object = p.model.getObject3D('mesh');


          if (object) {
            object.traverse(function (node) {
              
              switch(node.name){
                case 'BODY': p.BODY = node;
                  break;
                case 'HAND_L': p.HAND_L = node;
                  break;
                case 'HAND_R': p.HAND_R = node;
                  break;
                case 'HEAD': p.HEAD = node;
                  break;
              }
       
             });
          }
        
        
        
        });


*/