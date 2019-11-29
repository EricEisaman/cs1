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
    box.setAttribute("material", "src:#chip");
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
      sphere.setAttribute("radius", "0.3");
      sphere.setAttribute("collectible", "affects:magicDial ; value:10");
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

    function runOnce() {
      m.setAttribute(
        "sound",
        "src:url(https://cdn.glitch.com/36918312-2de3-4283-951d-240b263949f7%2Fclick.mp3?v=1561929149589)"
      );
      document.removeEventListener("click", runOnce);
    }

    document.addEventListener("click", runOnce);

    const m2b1 = document.querySelector("#menu2-b1");
    if (m2b1)
      m2b1.addEventListener("click", e => {
        e.preventDefault();
        box.setAttribute("material", "src:#chip");
        CS1.socket.playerData.faceIndex = 1;
        CS1.myPlayer._avatarType =
          config.avatar.models[CS1.socket.playerData.faceIndex].type;
      });

    const m2b2 = document.querySelector("#menu2-b2");
    if (m2b2)
      m2b2.addEventListener("click", e => {
        e.preventDefault();
        box.setAttribute("material", "src:#mel");
        CS1.socket.playerData.faceIndex = 2;
        CS1.myPlayer._avatarType =
          config.avatar.models[CS1.socket.playerData.faceIndex].type;
      });

    const m2b3 = document.querySelector("#menu2-b3");
    if (m2b3)
      m2b3.addEventListener("click", e => {
        e.preventDefault();
        box.setAttribute("material", "src:#vr1");
        CS1.socket.playerData.faceIndex = 0;
        CS1.myPlayer._avatarType =
          config.avatar.models[CS1.socket.playerData.faceIndex].type;
      });

    const m1b1 = document.querySelector("#menu1-b1");
    if (m1b1)
      m1b1.onclick = e => {
        CS1.__display__stats();
      };

    const m1b2 = document.querySelector("#menu1-b2");
    if (m1b2)
      m1b2.onclick = e => {
        m.innerHTML = page2;
      };

    const m1b3 = document.querySelector("#menu1-b3");
    if (m1b3)
      m1b3.onclick = e => {
        m.innerHTML = page3;
        const mbs = document.querySelectorAll(".main button ,.main.imgLink");
        if (mbs)
          mbs.forEach(b => {
            CS1.ui.controls.addHoverSound(b);
          });
      };

    const m1b4 = document.querySelector("#menu1-b4");
    if (m1b4)
      m1b4.onclick = e => {
        m.innerHTML = page4;
      };

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
