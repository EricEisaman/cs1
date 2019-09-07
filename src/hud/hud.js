let config = {
  regions:{
    top:true,
    left:false,
    right:false,
    bottom:false
  }
}

import RingDial from './elements/ring-dial';
import Meter from './elements/meter';

export default CS1=>{

  window.addEventListener('load', function () {
    CS1.hud = {};
    let hudElement = document.createElement('div');
    hudElement.id = 'vr-hud';
    CS1.hud.container = hudElement;
    if(!hudElement)return;
    let containers = generateRegions(hudElement);
    containers.top.style.pointerEvents='none';
    CS1.hud.pointsDial = new RingDial({
        container: containers.top,
        labelText: 'points',
        labelColor: '#ccc',
        gradientColor1: 'white',
        gradientColor2: 'red',
        max: 1000                     
    });
    CS1.hud.energyDial = new RingDial({
        container: containers.top,
        labelText: 'energy',
        labelColor: '#ccc',
        gradientColor1: 'white',
        gradientColor2: 'lime',
        max: 1000
    });
    CS1.hud.energyDial.setValue(500);
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
     top.style.width = 2000 + 'px';
     top.style.height = 2000/4 + 'px';
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
     bottom.style.top = 900 - 2000/8 + 'px';
     bottom.style.width = 2000 + 'px';
     bottom.style.height = 2000/8 + 'px';
     containers.bottom = bottom;
     hudElement.appendChild(bottom);
   }
   return containers;
  }
  
  })
  
}
