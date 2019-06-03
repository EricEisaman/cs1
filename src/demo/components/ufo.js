export default CS1=>{
  
  AFRAME.registerComponent('ufo', {
    schema:{
      type: {type:'string', default:'sentinel'},
      speed: {type:'number', default:10},
      rotOffset: {type:'number', default:0},
      engineSound: {type:'string', default:'https://cdn.glitch.com/6b222f93-e194-41e2-aaf6-59e5af64658d%2Fufo_engines.mp3?1555803047342'},
      engineVolume: {type:'number', default: 15}
    },
    init: function () {
      CS1.ufo = this; // NOTE: this is a singleton.
	    this.target = false;
      this.lockedIn = false;
      this.lerpCount = 0;
      this.thruster = document.getElementById('thruster');
      this.thruster.object3D.visible = false;
      //console.log('UFO Target:');
	    //console.log(this.target);
      let self = this;
      CS1.socket.on('set-ufo-target',id=>{
        self.setTarget(id);
      });
      document.addEventListener('signInFail',e=>{
        console.log('Handling signInFail on ufo.');
        CS1.socket.emit('set-ufo-target',CS1.socket.id);
      });
      this.el.setAttribute('sound__engine',`src:url(${this.data.engineSound});loop:true;volume:${this.data.engineVolume}`);
	  },
    tick: function (t,dt) {
      if(!this.target)return;
      let vec = this.el.object3D.position.clone().sub(this.target.object3D.position);
      //console.log(vec);
      let ang = Math.atan2(vec.x,vec.z);
      //console.log(ang);
      if(!this.lockedIn){
        this.el.object3D.rotateY( (ang+THREE.Math.degToRad(this.data.rotOffset))/40 );
        this.lerpCount += 1;
        if(this.lerpCount>40){
          this.lockedIn=true;
          this.lerpCount = 0;
        }
      }else{
        
        if(new THREE.Vector2(this.el.object3D.position.x,this.el.object3D.position.z).distanceTo(new THREE.Vector2(this.target.object3D.position.x,this.target.object3D.position.z))>1){
        this.el.object3D.translateZ(-this.data.speed*dt/3000);
        this.thruster.object3D.visible = true;
        if(!this.engineSoundPlaying){
          this.el.components.sound__engine.playSound();
          this.engineSoundPlaying = true;
        }
          
        this.el.object3D.rotation.set(
          0,
          ang+THREE.Math.degToRad(this.data.rotOffset),
          0
        );
          
      }else{
        this.el.components.sound__engine.pauseSound();
        this.engineSoundPlaying = false;
        this.thruster.object3D.visible = false;
      }
        
      
      
      }
      
           
    
    },
    setTarget: function(id){
      let target = id ? document.getElementById(id) : id;
      this.target = target;
      this.lockedIn = false;
    }
  });
    
}