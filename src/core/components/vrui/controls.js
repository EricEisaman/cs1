import config from "../../../../.data/client-config.json";
import page1 from "./page1.html";
import page2 from "./page2.html";
import page3 from "./page3.html";
import page4 from "./page4.html";

export const controls = {
  init: function() {
    const m1 = document.querySelector("#menu1");
    const m = document.querySelector("#main");
    const m2 = document.querySelector("#menu2");
    const avatar1 = config.avatar.models[0];
    const avatar2 = config.avatar.models[1];
    const avatar3 = config.avatar.models[2];
    const hiddenDiv = document.createElement('div');
    hiddenDiv.style.display = 'None';
    document.body.appendChild(hiddenDiv);
    const p1 = document.createElement('span');
    p1.innerHTML = page1;
    hiddenDiv.appendChild(p1);
    const p2 = document.createElement('span');
    p2.innerHTML = page2;
    hiddenDiv.appendChild(p2);
    const p3 = document.createElement('span');
    p3.innerHTML = page3;
    hiddenDiv.appendChild(p3);
    const p4 = document.createElement('span');
    p4.innerHTML = page4;
    hiddenDiv.appendChild(p4);
    CS1.ui = {};
    CS1.ui.controls = {};

    /* 
  ___           _                     ___    _ _ _       
 | _ ) ___ __ _(_)_ _  _ _  ___ _ _  | __|__| (_) |_ ___ 
 | _ \/ -_) _` | | ' \| ' \/ -_) '_| | _|/ _` | |  _(_-< 
 |___/\___\__, |_|_||_|_||_\___|_|   |___\__,_|_|\__/__/ 
 / __| |_ |___/_ _| |_  | || |___ _ _ ___                
 \__ \  _/ _` | '_|  _| | __ / -_) '_/ -_)               
 |___/\__\__,_|_|  \__| |_||_\___|_| \___|  
     
    */

    const box = document.createElement("a-box");
    box.setAttribute("scale", "0.7 0.7 0.7");
    box.object3D.visible = true;
    box.object3D.position.set(0, 2.3, -0.25);
    box.setAttribute("material", `src:${avatar2.thumbnail}`);
    m2.appendChild(box);

    CS1.ui.controls.showBox = e => {
      box.object3D.visible = box.object3D.visible ? false : true;
    };

    CS1.ui.controls.addBlasterBall = e => {
      const sphere = document.createElement("a-sphere");
      sphere.setAttribute("color", "brown");
      sphere.setAttribute("collectible", "affects:energyDial ; value: -10");
      sphere.setAttribute("launchable", "");
      sphere.classList = "blasterball";
      const pp = CS1.myPlayer.object3D.position;
      sphere.object3D.position.set(pp.x, pp.y + 4, pp.z);
      CS1.scene.appendChild(sphere);
    };

    CS1.ui.controls.addMagicPellet = e => {
      const sphere = document.createElement("a-sphere");
      sphere.setAttribute("color", "purple");
      sphere.setAttribute("scale", "0.3 0.3 0.3");
      sphere.setAttribute("collectible", "affects:magicDial ; value:10; threshold:1.7");
      sphere.setAttribute("grabbable", "");
      sphere.classList = "magicpellet";
      const pp = CS1.myPlayer.object3D.position;
      sphere.object3D.position.set(pp.x, pp.y + 4, pp.z);
      CS1.scene.appendChild(sphere);
    };

    /* 
  ___           _                     ___    _ _ _       
 | _ ) ___ __ _(_)_ _  _ _  ___ _ _  | __|__| (_) |_ ___ 
 | _ \/ -_) _` | | ' \| ' \/ -_) '_| | _|/ _` | |  _(_-< 
 |___/\___\__, |_|_||_|_||_\___|_|   |___\__,_|_|\__/__/ 
  ___     |___/   _  _                                   
 | __|_ _  __| | | || |___ _ _ ___                       
 | _|| ' \/ _` | | __ / -_) '_/ -_)                      
 |___|_||_\__,_| |_||_\___|_| \___|
     
    */
    
    CS1.playDMSound = true;
    CS1.ui.controls.msgMuteToggle = e => {
      const dmSoundControl = document.querySelector('#dm-sound-control');
      if(dmSoundControl.innerText.includes('🔊')){
        dmSoundControl.innerHTML='🔇';
        CS1.playDMSound = false;
      }else{
        dmSoundControl.innerHTML='🔊';
        CS1.playDMSound = true;
      }
      
    }
    

    function runOnce() {
      m.setAttribute(
        "sound",
        "src:url(https://cdn.glitch.com/36918312-2de3-4283-951d-240b263949f7%2Fclick.mp3?v=1561929149589)"
      );
      document.removeEventListener("click", runOnce);
    }

    document.addEventListener("click", runOnce);
    
    const m1b1 = document.querySelector("#menu1-b1");
    if (m1b1)
      m1b1.onclick = e => {
        hiddenDiv.appendChild(m.firstChild);
        m.innerHTML = '';
        CS1.__display__stats();
      };

    const m1b2 = document.querySelector("#menu1-b2");
    if (m1b2)
      m1b2.onclick = e => {
        hiddenDiv.appendChild(m.firstChild);
        m.innerHTML = '';
        m.appendChild(p2);
      };

    const m1b3 = document.querySelector("#menu1-b3");
    if (m1b3)
      m1b3.onclick = e => {
        hiddenDiv.appendChild(m.firstChild);
        m.innerHTML = '';
        m.appendChild(p3);
        const mbs = document.querySelectorAll(".main button ,.main.imgLink");
        if (mbs)
          mbs.forEach(b => {
            CS1.ui.controls.addHoverSound(b);
          });
      };

    const m1b4 = document.querySelector("#menu1-b4");
    if (m1b4)
      m1b4.onclick = e => {
        hiddenDiv.appendChild(m.firstChild);
        m.innerHTML = '';
        m.appendChild(p4);
      };
    
    const m2b1 = document.querySelector("#menu2-b1");
    if (m2b1)
      m2b1.addEventListener("click", e => {
        e.preventDefault();
        box.setAttribute("material", `src:${avatar1.thumbnail}`);
        CS1.socket.playerData.faceIndex = 0;
        CS1.myPlayer._avatarType =
          config.avatar.models[CS1.socket.playerData.faceIndex].type;
      });

    const m2b2 = document.querySelector("#menu2-b2");
    if (m2b2)
      m2b2.addEventListener("click", e => {
        e.preventDefault();
        box.setAttribute("material", `src:${avatar2.thumbnail}`);
        CS1.socket.playerData.faceIndex = 1;
        CS1.myPlayer._avatarType =
          config.avatar.models[CS1.socket.playerData.faceIndex].type;
      });

    const m2b3 = document.querySelector("#menu2-b3");
    if (m2b3)
      m2b3.addEventListener("click", e => {
        e.preventDefault();
        box.setAttribute("material", `src:${avatar3.thumbnail}`);
        CS1.socket.playerData.faceIndex = 2;
        CS1.myPlayer._avatarType =
          config.avatar.models[CS1.socket.playerData.faceIndex].type;
      });
    
    const m2b1img = document.querySelector('#m2-b1-img');
    const m2b1name = document.querySelector('#m2-b1-name');
    const m2b2img = document.querySelector('#m2-b2-img');
    const m2b2name = document.querySelector('#m2-b2-name');
    const m2b3img = document.querySelector('#m2-b3-img');
    const m2b3name = document.querySelector('#m2-b3-name');
    
    m2b1img.src = avatar1.thumbnail;
    m2b2img.src = avatar2.thumbnail;
    m2b3img.src = avatar3.thumbnail;
    
    m2b1name.innerHTML = avatar1.name;
    m2b2name.innerHTML = avatar2.name;
    m2b3name.innerHTML = avatar3.name;


    CS1.ui.controls.addHoverSound = b => {
      b.addEventListener("mouseenter", e => {
        if (CS1.stats.container.getAttribute("visible") && m.components.sound)
          m.components.sound.playSound();
      });
    };
    const mbs = document.querySelectorAll(".menu button , .imgLink");
    if (mbs)
      mbs.forEach(b => {
        CS1.ui.controls.addHoverSound(b);
      });
  }
};