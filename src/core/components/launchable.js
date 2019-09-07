export default (()=>{
  
  AFRAME.registerSystem('launchable', {
  schema: {},  // System schema. Parses into `this.data`.

  init: function () {

    CS1.socket.on('launch-sound',name=>{
      CS1.grabbables[name].components.sound__launch.playSound();
    });
    
  },

  
});
  
  AFRAME.registerComponent('launchable', {
    schema:{
      burst:{type:'boolean',default:true},
      launchSound:{type:'string',default:'https://cdn.glitch.com/83b7f985-f6ce-40dd-ac98-772aff98ebbf%2Fwoosh.mp3'}
    },
    // will listen for the grabbable release event 
    dependencies: ['grabbable'],
    
    init: function () {
      
      let self = this;
      
      self.grabbable = self.el.components.grabbable;
      
      self.el.setAttribute('sound__launch',`src:url(${this.data.launchSound})`);
      
      self.el.addEventListener('grabEnd',e=>{
        CS1.socket.emit('logall',{msg:`${CS1.myPlayer.name} launched grabbable ${self.grabbable.name}!`,channel:'0'});
        self.grabbable.isDragging = true; // can't grab while it is in launch
        let launchData = {name:self.grabbable.name,dir:self.getDir()};
        //console.log(launchData);
        CS1.socket.emit('launch',launchData);
      });
      
      
      
      
         
    },
    
    getDir: function(){
     if(CS1.device == 'Oculus Quest'){
       let d = this.grabbable.cursor.components.raycaster.raycaster.ray.direction;
       d.x *= -1;
       d.y *= -1;
       d.z *= -1;
       return d;
     }else{
       return this.grabbable.cursor.object3D.getWorldDirection(); 
     }
     
    }
    
    
  });

})()