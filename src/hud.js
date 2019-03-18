let config = {
  regions:{
    top:true,
    left:false,
    right:false,
    bottom:false
  }
}

import RingDial from './ring-dial';
import Meter from './meter';

export default CS1=>{

  window.addEventListener('load', function () {
    CS1.hud = {};
    let hudElement = document.querySelector('#hud');
    let containers = generateRegions(hudElement);
    CS1.hud.pointsDial = new RingDial({
        container: containers.top,
        labelText: 'points',
        labelColor: '#ccc',
        gradientColor1: 'white',
        gradientColor2: 'red',
        max: 400                     
    });
    CS1.hud.energyDial = new RingDial({
        container: containers.top,
        labelText: 'energy',
        labelColor: '#ccc',
        gradientColor1: 'white',
        gradientColor2: 'lime',
        max: 1000                     
    });
    CS1.hud.magicDial = new RingDial({
        container: containers.top,
        labelText: 'magic',
        labelColor: '#ccc',
        gradientColor1: 'white',
        gradientColor2: '#b45ef9',
        suffix: '%',
        max: 100                     
    });
    CS1.hud.oxygenMeter = new Meter(containers.top,'oxygen','#ccc',1.0);
  
  function generateRegions(hudElement){
   let containers = {};
   if(config.regions.top){
     let top = document.createElement('div');
     top.id = 'hud-top';
     top.style.position = 'relative';
     top.style.left = '0px';
     top.style.top = '0px';
     top.style.width = window.innerWidth + 'px';
     top.style.height = window.innerWidth/8 + 'px';
     containers.top = top;
     hudElement.appendChild(top);
   }
   if(config.regions.left){
   
   }
   if(config.regions.right){
   
   }
   if(config.regions.bottom){
     let bottom = document.createElement('div');
     bottom.id = 'hud-bottom';
     bottom.style.position = 'absolute';
     bottom.style.left = '0px';
     bottom.style.top = window.innerHeight - window.innerWidth/8 + 'px';
     bottom.style.width = window.innerWidth + 'px';
     bottom.style.height = window.innerWidth/8 + 'px';
     containers.bottom = bottom;
     hudElement.appendChild(bottom);
   }
   return containers;
  }
  
  })
  
}
