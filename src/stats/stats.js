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
    CS1.stats = {};
    let statsElement = document.createElement('div');
    statsElement.id = 'vr-stats';
    CS1.stats.container = statsElement;
    if(!statsElement)return;
    let containers = generateRegions(statsElement);
    containers.top.style.pointerEvents='none';
    CS1.stats.pointsDial = new RingDial({
        container: containers.top,
        labelText: 'points',
        labelColor: '#ccc',
        gradientColor1: 'white',
        gradientColor2: 'red',
        max: 1000                     
    });
    CS1.stats.energyDial = new RingDial({
        container: containers.top,
        labelText: 'energy',
        labelColor: '#ccc',
        gradientColor1: 'white',
        gradientColor2: 'lime',
        max: 1000
    });
    CS1.stats.energyDial.setValue(500);
    CS1.stats.magicDial = new RingDial({
        container: containers.top,
        labelText: 'magic',
        labelColor: '#ccc',
        gradientColor1: 'white',
        gradientColor2: '#b45ef9',
        suffix: '%',
        max: 100                     
    });
    CS1.stats.oxygenMeter = new Meter(containers.top,'oxygen','#ccc',1.0);
  
  function generateRegions(statsElement){
   let containers = {};
   if(config.regions.top){
     let top = document.createElement('div');
     top.id = 'stats-top';
     top.style.position = 'relative';
     top.style.left = '0px';
     top.style.top = '0px';
     top.style.width = 2000 + 'px';
     top.style.height = 2000/4 + 'px';
     containers.top = top;
     statsElement.appendChild(top);
   }
   if(config.regions.left){
   
   }
   if(config.regions.right){
   
   }
   if(config.regions.bottom){
     let bottom = document.createElement('div');
     bottom.id = 'stats-bottom';
     bottom.style.position = 'absolute';
     bottom.style.left = '0px';
     bottom.style.top = 900 - 2000/8 + 'px';
     bottom.style.width = 2000 + 'px';
     bottom.style.height = 2000/8 + 'px';
     containers.bottom = bottom;
     statsElement.appendChild(bottom);
   }
   return containers;
  }
  
  })
  
}
