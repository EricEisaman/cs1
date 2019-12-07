import particlePlayer from './particle-player';

import Particles_Dust from './particles/Particles_Dust.json';

import Particles_Energy from './particles/Particles_Energy.json';

import Particles_Orb from './particles/Particles_Orb.json';

export default(()=>{
  

  
  AFRAME.registerSystem('particles', {
    
    init:function(){
      
      CS1.particles={};
      CS1.particles.dust = Particles_Dust;
      CS1.particles.energy = Particles_Energy;
      CS1.particles.orb = Particles_Orb;
      
      const energyImg = document.createElement('img');
      energyImg.setAttribute('crossorigin','anonymous');
      energyImg.src = 'https://cdn.glitch.com/f8abb766-9950-44ff-9adb-2f5f53fdaf1b%2Fblue_dart.png';
      energyImg.id = 'energy';
      const assets = document.querySelector('a-assets');
      assets.appendChild(energyImg);
      
      const dustImg = document.createElement('img');
      dustImg.setAttribute('crossorigin','anonymous');
      dustImg.src = 'https://cdn.glitch.com/f8abb766-9950-44ff-9adb-2f5f53fdaf1b%2Fdust.png';
      dustImg.id = 'dust';
      assets.appendChild(dustImg);
      
      const orbImg = document.createElement('img');
      orbImg.setAttribute('crossorigin','anonymous');
      orbImg.src = 'https://cdn.glitch.com/f8abb766-9950-44ff-9adb-2f5f53fdaf1b%2Fblue_dart.png';
      orbImg.id = 'orb';
      assets.appendChild(orbImg);

      
    }
  });
  
  AFRAME.registerComponent('particles', {
    schema: {
      type: {type:'string',default:'energy'},
      color: {type:'string',default:'white'},
      scale: {type:'number',default:1},
      loop: {type:'boolean',default:false},
      offset: {type:'vec3'}
    },
    init: function () {
      
      this.e = document.createElement('a-entity');
      this.e.object3D.position.copy(this.el.object3D.position).add(this.data.offset);
      this.e.setAttribute('scale','3 3 3');
      this.p = document.createElement('a-entity');
      this.p.setAttribute('particleplayer',`src:${this.data.type}; img:#${this.data.type}; dur: 1000; count: 40%; scale: ${this.data.scale}; pscale: 2; interpolate: false; shader: standard; poolSize: 1; loop: ${this.data.loop}`);
      this.e.appendChild(this.p);
      CS1.scene.appendChild(this.e);
          
      
    },
    tick: function(t,dt){
      if(this.data.loop)this.e.object3D.position.copy(this.el.object3D.position).add(this.data.offset);
    },
    fire: function(){
      this.e.object3D.position.copy(this.el.object3D.position).add(this.data.offset);
      this.p.components.particleplayer.start();
    },
    fireAt: function(entity){
      this.e.object3D.position.copy(entity.object3D.position).add(this.data.offset);
      this.p.components.particleplayer.start();
    }
    
  });


  
})()



  

  
