import particlePlayer from './particle-player';

import Particles_Dust from './particles/Particles_Dust.json';

import Particles_Energy from './particles/Particles_Energy.json';

import Particles_Orb from './particles/Particles_Orb.json';


export default CS1=>{
  
  CS1.particles={};
  CS1.particles.dust = Particles_Dust;
  CS1.particles.energy = Particles_Energy;
  CS1.particles.orb = Particles_Orb;
  
  AFRAME.registerComponent('particles', {
    schema: {
      type: {type:'string',default:'magic'},
      color: {type:'string',default:'#891010'},
      scale: {type:'number',default:1},
      loop: {type:'boolean',default:false}
    },
    init: function () {
      
      let pos = this.el.getAttribute('position');
      
      let posString = `${pos.x} ${pos.y} ${pos.z}`;
      
      this.e;
  
      if(this.data.type=='magic'){
        this.e = document.createElement('a-entity');

        this.e.setAttribute('position',posString);
        this.e.setAttribute('scale','4 1.5 4');
        this.p1 = document.createElement('a-entity');
        this.p2 = document.createElement('a-entity');
        this.p3 = document.createElement('a-entity');


        this.p1.setAttribute('particleplayer',`src: orb; img: #star-tex; dur: 1000; count: 40%; scale: ${this.data.scale}; pscale: 9; interpolate: false; shader: standard; poolSize: 1; loop: ${this.data.loop}`);
        this.p2.setAttribute('particleplayer',`color:${this.data.color}; src: energy; img:#energy-tex; dur: 1000; count: 100%; scale: ${this.data.scale}; pscale: 12; interpolate: false; shader: standard; poolSize: 1; loop: ${this.data.loop};`);
        this.p3.setAttribute('particleplayer',`src: dust; img: #dust-tex; dur: 1000; count: 100%; scale: ${this.data.scale}; pscale: 1; interpolate: false; shader: standard; poolSize: 1; loop: ${this.data.loop}; color: #558`);

        this.e.appendChild(this.p1);
        this.e.appendChild(this.p2);
        this.e.appendChild(this.p3);

        document.querySelector('a-scene').appendChild(this.e);
          
      }
    },
    tick: function(t,dt){
    
    },
    fire: function(){
      let pos = this.el.getAttribute('position'); 
      let posString = `${pos.x} ${pos.y} ${pos.z}`;
      this.e.setAttribute('position',posString);
      this.p1.components.particleplayer.start();
      this.p2.components.particleplayer.start();
      this.p3.components.particleplayer.start();
    }
    
  });
  
}