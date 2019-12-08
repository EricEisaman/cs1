export default(()=>{
  

AFRAME.registerComponent('jump', {
  schema: {
    speed: {default: 8},
    g: {default: -9.8}
  },
  
  init: function(){
    this.el.isJumping = false;
    this.forwardVelocity = -this.data.speed;
    this.verticalVelocity = 0;
    this.jumpEvent = new Event('jump');
    this.landEvent = new Event('land');
    this.jumpDirection = new THREE.Vector3();
    document.addEventListener('keypress', e=>{
      if(e.code=='Space' && !this.el.isJumping){
        this.jump();
      }
    });
  },
  
  tick: function(t,dt){
    if(this.el.isJumping){
      this.verticalVelocity+=this.data.g*dt/1000;
      this.el.object3D.position.addScaledVector(this.jumpDirection,this.forwardVelocity*dt/1500);
      this.el.object3D.translateY(this.verticalVelocity*dt/1000);
      if(this.verticalVelocity<0 && this.el.object3D.position.y<=0){
        this.land();
      }
    }
  },
  
  jump: function(s){
    this.el.components['movement-controls'].pause();
    this.el.isJumping = true;
    CS1.cam.object3D.getWorldDirection(this.jumpDirection);
    this.jumpDirection.y = (this.jumpDirection.y>=0)?-0.02:this.jumpDirection.y;
    this.jumpDirection.x /= 2;
    this.jumpDirection.z /= 2;
    this.verticalVelocity = s?s:this.data.speed;
    this.el.dispatchEvent(this.jumpEvent);
  },
  
  land: function(){
    this.el.isJumping = false;
    this.verticalVelocity = 0;
    this.el.object3D.position.y = 0;
    this.el.components['movement-controls'].play();
    this.el.dispatchEvent(this.landEvent);  
  }
  
});
  
})()