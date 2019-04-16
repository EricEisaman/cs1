export default CS1=>{

 AFRAME.registerComponent('proximity-glitch', {
   schema: {
     threshold: {type: 'number', default: 2},
     affects: {type: 'string', default: ''},
     value:{type:'number',default:-0.1},
     sound: {type: 'string',default:'https://cdn.glitch.com/6b222f93-e194-41e2-aaf6-59e5af64658d%2Fbuzz.mp3?1555284089077'},
   },
   init: function () {
      this.sound = document.createElement('a-sound');
      this.sound.setAttribute('src',`url(${this.data.sound})`);
      this.el.appendChild(this.sound);
      this.soundIsPlaying=false;
      this.sound.addEventListener('sound-ended',e=>{
        this.soundIsPlaying=false;     
      });
      this.scene=document.querySelector('a-scene');
      this.scene.setAttribute('glitch','');
      this.baseEffects=this.scene.getAttribute('effects');
    },
   tick: function (t,dt) {
     if(CS1.game.playerDistanceTo(this.el)<this.data.threshold){  
       this.scene.setAttribute('effects',`glitch,${this.baseEffects}`);
       if(this.data.affects){
         CS1.hud[this.data.affects].setValue(CS1.hud[this.data.affects].value+this.data.value);
         if(!this.soundIsPlaying){
           this.sound.components.sound.playSound();
           this.soundIsPlaying = true;
         }
       }
     }else{
       this.scene.setAttribute('effects',this.baseEffects);
     }
   }
  });

}