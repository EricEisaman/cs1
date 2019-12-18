import config from "../../../.data/client-config.json";
export default CS1 => {
  AFRAME.registerComponent("game", {
    schema: { mode: { type: "string", default: "standard" } },
    init: function() {
      CS1.game = this;
      this.isRunning = false;
      this.hasBegun = false;

      CS1.callbacks = {};

      this.determineDevice();

      this.name = config.gameName;
      this.announcements = {};
      this.announcements["welcome"] = config.welcomeMsg;
      this.welcomeDelay = config.voice.welcomeDelay;

      document.querySelector("#scene-container").style.display = "block";
      document.querySelector("#loading-screen").style.display = "none";

      CS1.voices = window.speechSynthesis.getVoices();

      CS1.say = function(msg, name = "none given") {
        var msg = new SpeechSynthesisUtterance(msg);
        if (name == "none given")
          msg.voice = speechSynthesis.getVoices().filter(function(voice) {
            return voice.name == config.voice.name;
          })[0];
        else
          msg.voice = speechSynthesis.getVoices().filter(function(voice) {
            return voice.name == name;
          })[0];
        msg.pitch = config.voice.pitch;
        msg.rate = config.voice.rate;
        msg.volume = config.voice.volume;
        speechSynthesis.speak(msg);
      };

      CS1.sayall = function(msg, name) {
        CS1.socket.emit("sayall", { msg: msg, name: name });
      };

      CS1.printVoices = () => {
        speechSynthesis.getVoices().forEach(v => {
          console.log(v.name, v.lang);
        });
      };

      CS1.sounds = {};

      Object.keys(config.sounds).forEach(soundName => {
        CS1.sounds[soundName] = new Audio(config.sounds[soundName].url);
        CS1.sounds[soundName].loop = config.sounds[soundName].loop || false;
        CS1.sounds[soundName].volume = config.sounds[soundName].volume || 1;
      });

      CS1.scene = AFRAME.scenes[0];

      CS1.otherPlayers = {};
    },

    tick: function(time, dt) {},

    start: function() {
      CS1.logall = function(msg, channel = "") {
        CS1.socket.emit("logall", { msg: msg, channel: channel });
      };

      if (CS1.device == "Oculus Quest") {
        CS1.myPlayer.leftHand = CS1.myPlayer.components.player.lh;
        CS1.myPlayer.rightHand = CS1.myPlayer.components.player.rh;
      }
      
      CS1.game.hasBegun = true;
      
      // Create a new event
      let event = new CustomEvent("gameStart", {
        detail: {
          message: "Let's play!",
          time: new Date()
        },
        bubbles: true,
        cancelable: true
      });

      // Dispatch the gameStart event
      document.body.dispatchEvent(event);
      
      CS1.socket.emit("logall", {
          msg: `${CS1.myPlayer.name} is playing with a ${CS1.device} device!`,
          channel: "grab"
      });
      
      
    },

    playerDistanceTo: function(entity) {
      return CS1.myPlayer.object3D.position.distanceTo(
        entity.object3D.position
      );
    },

    fireParticles: function(el) {
      el.components.particles.fire();
    },
    
    mobileSetup: function(){
      CS1.myPlayer.cursor = document.querySelector("#cam-cursor");
            CS1.device = "Mobile";
            CS1.scene.setAttribute("vr-mode-ui", "enabled: false");
            CS1.mylatesttap = 0;
            let mbc = document.querySelector("#mobile-btn-container");

            let icon = document.createElement("img");

            icon.setAttribute(
              "src",
              "https://cdn.glitch.com/376724db-dc5f-44ca-af35-36d00838079c%2Fmenu-64-icon.png?v=1562375093680"
            );
            icon.setAttribute("style", "position:absolute;right:0px");
            mbc.appendChild(icon);

            icon.addEventListener("touchstart", e => {
              let now = new Date().getTime();
              let timesince = now - CS1.mylatesttap;

              if (timesince < 600 && timesince > 0) {
                // double tap

                // Create a new event
                let event = new CustomEvent("doubleTapMenu", {
                  detail: {
                    message: "Double Tappin!",
                    time: new Date()
                  },
                  bubbles: true,
                  cancelable: true
                });
                // Dispatch the event
                document.body.dispatchEvent(event);
              } else {
                // too much time to be a doubletap
              }
              CS1.mylatesttap = new Date().getTime();
            });

            let icon2 = document.createElement("img");

            icon2.setAttribute(
              "src",
              "https://cdn.glitch.com/376724db-dc5f-44ca-af35-36d00838079c%2Fchat-64-icon.png?v=1562528152057"
            );
            icon2.setAttribute("style", "position:absolute;left:0px");
            mbc.appendChild(icon2);

            icon2.addEventListener("touchstart", e => {
              let now = new Date().getTime();
              let timesince = now - CS1.mylatesttap;

              if (timesince < 600 && timesince > 0) {
                // double tap

                // Create a new event
                let event = new CustomEvent("doubleTapChat", {
                  detail: {
                    message: "Double Tappin!",
                    time: new Date()
                  },
                  bubbles: true,
                  cancelable: true
                });
                // Dispatch the event
                document.body.dispatchEvent(event);
              } else {
                // too much time to be a doubletap
              }
              CS1.mylatesttap = new Date().getTime();
            });
    },
    
    standardSetup: function(){
      //No headset and not mobile
      CS1.device = "Standard";
      CS1.scene.setAttribute("vr-mode-ui", "enabled: false");
      CS1.myPlayer.cursor = document.querySelector("#cam-cursor");
    },
    
    oculusSetup: function(){
      document.querySelector("#cam-cursor").setAttribute("visible", false);
      document.querySelector("#cam-cursor").setAttribute("fuse", false);
      document.querySelector("#cam-cursor").pause();
      CS1.device = "Oculus Quest";
    },

    determineDevice: function() {
      self = this;
      if (navigator.xr) {
        navigator.xr.isSessionSupported("immersive-vr").then(vrDevice => {
          if(vrDevice&&navigator.userAgent.includes('OculusBrowser')){
            self.oculusSetup();
          }else if(AFRAME.utils.device.isMobile()){
            self.mobileSetup();
          }else{
            self.standardSetup();
          }
        });
      } else {
        navigator.getVRDisplays().then(function(displays) {
          if (
            displays &&
            displays[0] &&
            displays[0].displayName == "Oculus Quest"
          ) 
          {
            self.oculusSetup();
          } else if (AFRAME.utils.device.isMobile()){
            self.mobileSetup();
          } else 
           {
            self.standardSetup();
          }
        });
      }
    }
  });
};
