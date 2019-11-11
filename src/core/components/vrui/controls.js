import config from '../../../../.data/client-config.json';
import page1 from './page1.html';
import page2 from './page2.html';
import page3 from './page3.html';
import page4 from './page4.html';

export const controls = {
  
 init: function(){ 
   
 AFRAME.registerComponent('showbutton', {
      schema: {
        'target': {type: 'selector'},
      },
      init: function () {
        var show=false;    
        this.el.addEventListener("click",()=>{
          if(show){
            this.data.target.setAttribute("visible","false");
            this.el.querySelector("button").innerHTML="Show Box";
          }else{
            this.data.target.setAttribute("visible","true");
            this.el.querySelector("button").innerHTML="Hide Box";
          }
          show=!show;
        });
      }
    });
   
 
 const m1 = document.querySelector('#menu1');
 const m = document.querySelector('#main');
 const m2 = document.querySelector('#menu2');

 function runOnce(){
      m1.setAttribute('sound','src:url(https://cdn.glitch.com/36918312-2de3-4283-951d-240b263949f7%2Fclick.mp3?v=1561929149589)');
      m2.setAttribute('sound','src:url(https://cdn.glitch.com/36918312-2de3-4283-951d-240b263949f7%2Fclick.mp3?v=1561929149589)');
      document.removeEventListener('click',runOnce);
    }


    document.addEventListener('click',runOnce);
    
    const box = document.querySelector('#box');

    let topBtn = document.querySelector('#top-btn');
    if(topBtn)topBtn.addEventListener('mouseenter',e=>{
  
      if(CS1.hud.container.getAttribute('visible')&&m2.components.sound)m2.components.sound.playSound()

    });
    if(topBtn)topBtn.addEventListener('click',e=>{
      e.preventDefault();
      box.setAttribute('material','src:#chip');
      CS1.socket.playerData.faceIndex = 1;
      CS1.myPlayer._avatarType = config.avatar.models[CS1.socket.playerData.faceIndex].type;
    });

    let midBtn = document.querySelector('#mid-btn');
    if(midBtn)midBtn.addEventListener('mouseenter',e=>{

      if(CS1.hud.container.getAttribute('visible')&&m2.components.sound)m2.components.sound.playSound()

    });
    if(midBtn)midBtn.addEventListener('click',e=>{
      e.preventDefault();
      box.setAttribute('material','src:#mel');
      CS1.socket.playerData.faceIndex = 2;
      CS1.myPlayer._avatarType = config.avatar.models[CS1.socket.playerData.faceIndex].type;
    });

    let botBtn = document.querySelector('#bot-btn');
    if(botBtn)botBtn.addEventListener('mouseenter',e=>{

      if(CS1.hud.container.getAttribute('visible')&&m2.components.sound)m2.components.sound.playSound()

    });
    if(botBtn)botBtn.addEventListener('click',e=>{
      e.preventDefault();
      box.setAttribute('material','src:#vr1');
      CS1.socket.playerData.faceIndex = 0;
      CS1.myPlayer._avatarType = config.avatar.models[CS1.socket.playerData.faceIndex].type;
    });


    let Btn1 = document.querySelector('#b1');
    if(Btn1)Btn1.addEventListener('mouseenter',e=>{

      if(CS1.hud.container.getAttribute('visible')&&m1.components.sound)m1.components.sound.playSound()

    });
    Btn1.onclick = e=>{
      CS1.__vrui__main();
    }

    let Btn2 = document.querySelector('#b2');
    if(Btn2)Btn2.addEventListener('mouseenter',e=>{

      if(CS1.hud.container.getAttribute('visible')&&m1.components.sound)m1.components.sound.playSound()

    });
    Btn2.onclick = e=>{
      m.innerHTML = page2;
    }

    let Btn3 = document.querySelector('#b3');
    if(Btn3)Btn3.addEventListener('mouseenter',e=>{

      if(CS1.hud.container.getAttribute('visible')&&m1.components.sound)m1.components.sound.playSound()

    });
    Btn3.onclick = e=>{
      m.innerHTML = page3;
    }

    let Btn4 = document.querySelector('#b4');
    if(Btn4)Btn4.addEventListener('mouseenter',e=>{

      if(CS1.hud.container.getAttribute('visible')&&m1.components.sound)m1.components.sound.playSound()

    });
    Btn4.onclick = e=>{
      m.innerHTML = page4;
    }
  
 },
  
  }