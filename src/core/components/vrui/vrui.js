import config from "../../../../.data/client-config.json";
import styles from './styles.html';
import panels from './panels.html';
import {controls} from './controls';

export default(()=>{

AFRAME.registerSystem('vrui', {
  schema: {
	  panels: {default: 3}
  },
  
  dependencies: ['htmlembed'],
  
  init: ()=>{
     
    
    
    document.head.innerHTML += styles;
    
    const ec = document.createElement('a-entity');
    ec.setAttribute('style','visibility:hidden');
    ec.setAttribute('vrui','');
    ec.id = 'embed-container';
    ec.innerHTML = panels;
    ec.setAttribute('scale',`${config.vrui.scale} ${config.vrui.scale} ${config.vrui.scale}`);
    let scn = document.querySelector('a-scene');
    scn.appendChild(ec);
        
    
    document.addEventListener('gameStart',e=>{
      
      const w = document.createElement('div');
      w.style.width = '100%';
      w.style.height = '100%';
      w.appendChild(CS1.stats.container);
     
      
    CS1.__display__stats = function(){
      const c = document.querySelector('#main');
      c.innerHTML='';
      c.appendChild(w); 
    }
    
    
   document.querySelector('#main').appendChild(w);  
      
    let scn = document.querySelector('a-scene');
    let ctr = document.querySelector('#embed-container');
    ctr.setAttribute('visible',false);
    ctr.setAttribute('position',config.vrui.offset);
    CS1.myPlayer.add(ctr);
    CS1.stats.container = ctr;
    let m = document.querySelector('#main');
    let m1 = document.querySelector('#menu1');
    let m2 = document.querySelector('#menu2');
    m.setAttribute('htmlembed','');
    m1.setAttribute('htmlembed','');
    m2.setAttribute('htmlembed','');


   controls.init();
      
      
    document.querySelectorAll('.dark').forEach(e=>{
               e.classList.remove('screen')
              })  
      
    
    let lh = CS1.myPlayer.components.player.lh.components["oculus-touch-controls"];
    let rh = CS1.myPlayer.components.player.rh.components["oculus-touch-controls"];
    if(CS1.device=="Oculus Quest"){
       //AFRAME.utils.device.checkHeadsetConnected()
      
        let cursor = document.querySelector('a-cursor');
        cursor.pause();
        if(CS1.cam.components.raycaster)CS1.cam.components.raycaster.pause();
          lh.el.addEventListener('abuttondown',e=>{
            CS1.stats.container.object3D.rotation.y = CS1.cam.object3D.rotation.y;
            let v = CS1.stats.container.getAttribute('visible');
            CS1.stats.container.setAttribute('visible',!v);
            if(v){
              document.querySelectorAll('.dark').forEach(e=>{
               e.classList.remove('screen')
              })
            }else{
              document.querySelectorAll('.dark').forEach(e=>{
               e.classList.add('screen')
              })
            }
          });
          rh.el.addEventListener('abuttondown',e=>{
            CS1.stats.container.object3D.rotation.y = CS1.cam.object3D.rotation.y;
            let v = CS1.stats.container.getAttribute('visible');
            CS1.stats.container.setAttribute('visible',!v); 
            if(v){
              document.querySelectorAll('.dark').forEach(e=>{
               e.classList.remove('screen')
              })
            }else{
              document.querySelectorAll('.dark').forEach(e=>{
               e.classList.add('screen')
              })
            }
          });   
    } else if(CS1.device=="Standard") {
      
      document.addEventListener('keypress',e=>{
          if(e.code=='Backquote'){
            CS1.stats.container.object3D.rotation.y = CS1.cam.object3D.rotation.y;
            let v = CS1.stats.container.getAttribute('visible');
            CS1.stats.container.setAttribute('visible',!v);
            if(v){
              document.querySelectorAll('.dark').forEach(e=>{
               e.classList.remove('screen')
              })
            }else{
              document.querySelectorAll('.dark').forEach(e=>{
               e.classList.add('screen')
              })
            }
          }
        });       
          
    } else if(CS1.device=="Mobile"){
      
      
      document.addEventListener('doubleTapMenu',e=>{
        CS1.stats.container.object3D.rotation.y = CS1.cam.object3D.rotation.y;
        let v = CS1.stats.container.getAttribute('visible');
        CS1.stats.container.setAttribute('visible',!v);
        if(v){
              document.querySelectorAll('.dark').forEach(e=>{
               e.classList.remove('screen')
              })
            }else{
              document.querySelectorAll('.dark').forEach(e=>{
               e.classList.add('screen')
              })
            }
        
      });
      
      
    }  
      
      
      
    });
    
       
    
  },

  
  
  
});
  
})()