import config from '../config/client-config.json';
export default CS1=>{
  
  AFRAME.registerSystem('collectible', {
  schema: {},  // System schema. Parses into `this.data`.

  init: function () {
    
    CS1.collectibles=[];
   
    CS1.socket.on('collect',data=>{
      if(!(CS1.game && CS1.game.hasBegun))return;
      let collectedEntity = CS1.collectibles[data.index];
      if(collectedEntity.el.components.sound__loop)collectedEntity.el.components.sound__loop.pause();
      collectedEntity.el.setAttribute('visible',false);
      //collectedEntity.el.setAttribute('scale','0 0 0');
      collectedEntity.soundIsPlaying=true;
      collectedEntity.el.components.sound__collect.playSound();
      if(collectedEntity.data.cb && !AFRAME.utils.device.isMobile()){
        CS1.game[collectedEntity.data.cb](collectedEntity.el);
      }
      collectedEntity.el.addEventListener('sound-ended',e=>{
        collectedEntity.soundIsPlaying=false;
        collectedEntity.pause();     
      });
      if(data.collector==CS1.socket.id && collectedEntity.data.affects){  
        if(collectedEntity.data.affects.includes('avatar')){
           let s;
           switch(collectedEntity.el.id){
             case 'avatar-upgrade-1':
               s=0.35;
               break;
             case 'avatar-upgrade-2':
               s=0.5
           }
           CS1.myPlayer.components.player.setSpeed(s);
           console.log('speed boost');
        }else  
        CS1.hud[collectedEntity.data.affects].changeBy(collectedEntity.data.value);
      }
      if( (data.collector!=CS1.socket.id) && (collectedEntity.data.affects=='avatarUpgrade')){  
         console.log(CS1.otherPlayers[data.collector]);
        let m,t;
         switch(collectedEntity.el.id){
           case 'avatar-upgrade-1':
              m = document.querySelector('#avatar-to-clone-1').cloneNode();
              t = 'Skully';
              break;
           case 'avatar-upgrade-2':
              m = document.querySelector('#avatar-to-clone-2').cloneNode();
              t = 'Speedy';
         }
        
         let op = CS1.otherPlayers[data.collector];
         m.appendChild(op.msg);
         op.msg.setAttribute('text',`value:${t};
                                   align:center;
                                   width:8;
                                   wrap-count:24; 
                                   color:yellow`);
         m.setAttribute('visible',true);
         op.appendChild(m);
         op.removeChild(op.model);
         op.model = m;
         
      }
    });
    
    CS1.socket.on('spawn-collectible',index=>{
      let collectedEntity = CS1.collectibles[index];
      if(collectedEntity.el.components.sound__loop)collectedEntity.el.components.sound__loop.play();
      collectedEntity.el.setAttribute('visible',true);
      //collectedEntity.el.setAttribute('scale','1 1 1');
      collectedEntity.play();
    });

    CS1.socket.on('request-for-collectibles',()=>{
      let d=[];
      CS1.collectibles.forEach(c=>{
        d.push({spawns:c.data.spawns,spawnDelay:c.data.spawnDelay});
      });
      CS1.socket.emit('initial-collectibles-state', d);
    });
    
    
    
    
    
  },

 
});
  
  
  AFRAME.registerComponent("collectible", {
	schema: {
    threshold: {type: 'number', default: 2.7},
    soundCollect: {type: 'string',default:'https://cdn.glitch.com/f8abb766-9950-44ff-9adb-2f5f53fdaf1b%2Fpowerup_1.mp3?1552158629039'},
    soundLoop: {},
    cb:{type:'string',default:''},
    affects:{type:'string',default:''},
    value:{type:'number',default:1},
    spawns:{type:'boolean',default:false},
    spawnDelay:{type:'number',default:5}
	},
	init: function()
	{
    
    this.el.setAttribute('sound__collect',`src:url(${this.data.soundCollect})`);
    if(this.data.soundLoop)this.el.setAttribute('sound__loop',`src:url(${this.data.soundLoop});autoplay:true;loop:true`);
    CS1.collectibles.push(this);
    this.soundIsPlaying=false;
      
  }, 
	tick: function()
	{   
     if((this.el.object3D.position.distanceTo(CS1.myPlayer.object3D.position) < this.data.threshold)&&
          this.data.affects!='avatarUpgrade'){ 
       this.collect();
     }
     if(this.data.affects=='avatarUpgrade' &&
        (this.el.parentElement.object3D.position.distanceTo(CS1.myPlayer.object3D.position) < this.data.threshold) ){
       this.collect();
     }
		
	},
  
  collect: function(){
    if(this.soundIsPlaying)return;
    if(CS1.socket.disconnected){
      if(this.el.components.sound__loop)this.el.components.sound__loop.pause();
      this.el.setAttribute('visible',false);
      this.el.setAttribute('scale','0 0 0');
      this.soundIsPlaying=true;
      this.el.components.sound__collect.playSound();
      if(this.data.cb)CS1.game[this.data.cb](this.el);
      if(this.data.affects && this.data.affects !== 'avatarUpgrade')
        CS1.hud[this.data.affects].animateTo(CS1.hud[this.data.affects].value+this.data.value);
      this.el.addEventListener('sound-ended',e=>{
        this.soundIsPlaying=false;
        this.pause();   
      }); 
      if(this.data.spawns){
             setTimeout(()=>{
                if(this.el.components.sound__loop)this.el.components.sound__loop.play();
                this.el.setAttribute('visible',true);
                this.el.setAttribute('scale','1 1 1');
                this.play();
             },this.data.spawnDelay*1000);
           }
    } else{
      CS1.socket.emit('request-collection',{index: CS1.collectibles.indexOf(this)}); 
    
    }
 
  }
  
  
})
  
}