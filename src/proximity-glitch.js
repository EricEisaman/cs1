export default (function proximityGlitch(){

 AFRAME.registerComponent('proximity-glitch', {
   schema: {
     threshold: {type: 'number', default: 2}
   },
   init: function () {
      this.scene=document.querySelector('a-scene');
      this.scene.setAttribute('glitch','');
      this.baseEffects=this.scene.getAttribute('effects');
    },
   tick: function (t,dt) {
     if(CS1.game.playerDistanceTo(this.el)<this.data.threshold){  
       this.scene.setAttribute('effects',`glitch,${this.baseEffects}`);
     }else{
       this.scene.setAttribute('effects',this.baseEffects);
     }
   }
  });

})()