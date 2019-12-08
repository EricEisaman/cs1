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
      CS1.particles.star = Particles_Energy;
      
      const energyImg = document.createElement('img');
      energyImg.setAttribute('crossorigin','anonymous');
      energyImg.src = 'https://cdn.glitch.com/f8abb766-9950-44ff-9adb-2f5f53fdaf1b%2Fblue_dart.png';
      energyImg.id = 'energy';
      document.body.appendChild(energyImg);
      
      const dustImg = document.createElement('img');
      dustImg.setAttribute('crossorigin','anonymous');
      dustImg.src = 'https://cdn.glitch.com/f8abb766-9950-44ff-9adb-2f5f53fdaf1b%2Fdust.png';
      dustImg.id = 'dust';
      document.body.appendChild(dustImg);
      
      const starImg = document.createElement('img');
      starImg.setAttribute('crossorigin','anonymous');
      starImg.src = 'https://cdn.glitch.com/f8abb766-9950-44ff-9adb-2f5f53fdaf1b%2Fstar.png';
      starImg.id = 'star';
      document.body.appendChild(starImg);

      
    }
  });
  
  AFRAME.registerComponent('particles', {
    schema: {
      types: {type:'array'},
      color: {type:'string',default:'white'},
      scale: {type:'number',default:1},
      loop: {type:'boolean',default:false},
      offset: {type:'vec3'}
    },
    init: function () {
      
      this.e = document.createElement('a-entity');
      this.e.object3D.position.copy(this.el.object3D.position).add(this.data.offset);
      this.e.setAttribute('scale','3 3 3');
      this.types = {};
      if(!this.data.types.length)this.data.types = ['energy','dust','star'];
      
      this.data.types.forEach(type=>{
        
      this.types[type] = document.createElement('a-entity');
      this.types[type].setAttribute('particleplayer',`src:${type}; img:#${type}; dur: 1000; count: 40%; scale: ${this.data.scale}; pscale: 2; interpolate: false; shader: standard; poolSize: 1; loop: ${this.data.loop}`);
      this.e.appendChild(this.types[type]);
        
      });
      
      CS1.scene.appendChild(this.e);
          
      
    },
    tick: function(t,dt){
      if(this.data.loop)this.e.object3D.position.copy(this.el.object3D.position).add(this.data.offset);
    },
    fire: function(type){
      this.e.object3D.position.copy(this.el.object3D.position).add(this.data.offset);
      if(this.types[type])this.types[type].components.particleplayer.start();
    },
    fireAt: function(type,pos){
      this.e.object3D.position.set(pos.x,pos.y,pos.z).add(this.data.offset);
      if(this.types[type])this.types[type].components.particleplayer.start();
    }
    
  });


  
})()



  

  
