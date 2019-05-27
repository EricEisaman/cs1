export default CS1=>{
  
  AFRAME.registerComponent('player', {
    schema:{
      me:{type:'boolean',default:false}
    },
    init: function () {
      if(this.data.me){
        this.isWalking=false;
        this.setKeyCtls();
        this.setTouchCtls();
        this.setOculusCtls();
        this.setAvatarChoices();
        this.addMyListeners();
        this.el.timePlayed = 0;
      }
    },
    addMyListeners: function(){
      let self = this;
      document.addEventListener('gameStart',e=>{
        //console.log('Handling gameStart on my player.');
        self.el.id = CS1.socket.id;
        self.el.classList = 'my-player';
        self.isPlaying = true;
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
      let lh = document.querySelector('#left-hand').components["oculus-touch-controls"];
      let rh = document.querySelector('#right-hand').components["oculus-touch-controls"];
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
    setAvatarChoices: function(){
      this.avatar_0 = document.querySelector('#starter-avatar');
      this.avatar_1 = document.querySelector('#avatar-upgrade');
      this.avatarUpgradeZone = document.querySelector('#avatar-upgrade-zone');
    },
    tick: function(t,dt){
      if(this.data.me && CS1.game.hasBegun){
        this.el.timePlayed += dt;
      }  
    },
    
    setAvatar: function(data){
      if(!this.avatar_1)this.avatar_1 = document.querySelector('#avatar-upgrade');
      this.avatar_0 = this.el.firstElementChild;
      CS1.scene.appendChild(this.avatar_0);
      this.avatar_0.setAttribute('visible',false);
      if(data==1){
        this.avatar_1.setAttribute('position','0 8 0');
        this.avatar_1.setAttribute('scale','2 2 2');
        this.avatar_1.setAttribute('rotation','0 180 0');
        this.avatar_1.setAttribute('animation-mixer','clip:idle');
        this.el.model = this.avatar_1;
        this.el.appendChild(this.avatar_1);}
      else{
      
      }
      
    },
    
    setSpeed: function(s){
      this.el.setAttribute('movement-controls',`constrainToNavMesh: true; speed: ${s}`);
    }
    
  });
  
}