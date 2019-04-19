export default CS1=>{
  
  AFRAME.registerComponent('ufo', {
    schema:{
      type: {type:'string', default:'sentinel'},
      speed: {type:'number', default:10},
      rotOffset: {type:'number', default:0}
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
    
    },
    setTarget: function(id){
      let target = id ? document.getElementById(id) : id;
      this.target = target;
    }
  });
    
}