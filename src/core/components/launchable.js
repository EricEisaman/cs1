export default (()=>{
  
  AFRAME.registerSystem('launchable', {
  schema: {},  // System schema. Parses into `this.data`.

  init: function () {

    CS1.socket.on('launch-sound',name=>{
      if(CS1.grabbables[name] && CS1.grabbables[name].components.sound__launch)
        CS1.grabbables[name].components.sound__launch.playSound();
    });
    
    CS1.socket.on('launch-complete',name=>{
      CS1.grabbables[name].components.grabbable.isDragging = false;
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
      
      this.name = this.el.components.grabbable.name;
      console.log(`Launchable added with name: ${this.name}.`);
      
      let self = this;
      
      this.grabbable = self.el.components.grabbable;
      
      self.el.setAttribute('sound__launch',`src:url(${this.data.launchSound})`);
      
      self.el.addEventListener('grabEnd',e=>{
        self.launch();
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
     
    },
    
    launch: function(dir){
      CS1.socket.emit('logall',{msg:`${CS1.myPlayer.name} launched grabbable ${this.el.components.grabbable.name}!`,channel:'0'});
      this.el.components.grabbable.isDragging = true; // can't grab while it is in launch
      const launchData = {name:this.name,dir:(dir)?dir:this.getDir()};
      CS1.socket.emit('launch',launchData);
    }
    
    
  });

})()