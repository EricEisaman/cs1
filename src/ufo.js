export default CS1=>{
  
  AFRAME.registerComponent('ufo', {
    schema:{
      type: {type:'string', default:'sentinel'},
      speed: {type:'number', default:10},
      rotOffset: {type:'number', default:0},
      engineSound: {type:'string', default:'https://cdn.glitch.com/6b222f93-e194-41e2-aaf6-59e5af64658d%2Fufo_engines.mp3?1555803047342'},
      engineVolume: {type:'number', default: 16}
    },
    init: function () {
      CS1.ufo = this; // NOTE: this is a singleton.
	    this.target = false;
      //console.log('UFO Target:');
	    //console.log(this.target);
      self = this;
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
      this.el.object3D.rotation.set(
        0,
        ang+THREE.Math.degToRad(this.data.rotOffset),
        0
      );
      if(new THREE.Vector2(this.el.object3D.position.x,this.el.object3D.position.z).distanceTo(new THREE.Vector2(this.target.object3D.position.x,this.target.object3D.position.z))>1){
        this.el.object3D.translateZ(-this.data.speed*dt/3000);
        if(!this.engineSoundPlaying){
          this.el.components.sound__engine.playSound();
          this.engineSoundPlaying = true;
        }
      }else{
        this.el.components.sound__engine.pauseSound();
        this.engineSoundPlaying = false;
      }
        
    
    },
    setTarget: function(id){
      let target = id ? document.getElementById(id) : id;
      this.target = target;
    }
  });
    
}