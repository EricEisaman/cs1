function findComponent(componentName) {
  return document.querySelector(`[${componentName}]`).components[componentName];
}
//Moves the subject to a new parent while preserving its transform in the world
function reparentObject3D(subject, newParent) {
  subject.updateMatrixWorld();
  subject.matrix.copy(subject.matrixWorld);
  subject.applyMatrix(new THREE.Matrix4().getInverse(newParent.matrixWorld));
  newParent.add(subject);
}
// Copys the world transforms between objects even if the have different parents
var copyTransform = (function() {
  var scratchMat = new THREE.Matrix4();
  return function(source, destination) {
    destination.matrix.copy(source.matrixWorld);
    destination.applyMatrix(
      scratchMat.getInverse(destination.parent.matrixWorld)
    );
  };
})();
function toVector(o) {
  return new THREE.Vector3(o.x, o.y, o.z);
}
function toList(collection) {
  var list = [];
  for (var i = 0; i < collection.length; i++) {
    list.push(collection[i]);
  }
  return list;
}
function addDot(el, position, radius, color) {
  color = color || "red";
  var dot = document.createElement("a-sphere");
  dot.setAttribute("radius", radius);
  dot.setAttribute("position", position);
  dot.setAttribute("color", color);
  el.appendChild(dot);
}
function directionLocalToWorld(object, localDirection) {
  return localDirection.transformDirection(object.matrixWorld);
}

export default (function grabbable() {
  AFRAME.registerSystem("grabbable", {
    schema: {}, // System schema. Parses into `this.data`.

    init: function() {
      //use object to allow for further development
      CS1.grabbables = {};

      CS1.__updateGrabbables = grabbablesData => {
        if (
          Object.keys(CS1.grabbables).length === 0 ||
          !CS1.grabbables[grabbablesData[0].name] ||
          !CS1.game.hasBegun
        )
          return;
        grabbablesData.forEach((d, index) => {
          let b = CS1.grabbables[d.name];
          if(!b)return;
          if (CS1.debug) {
            console.log("Individual body data from server:");
            console.log(d);
          }
          if (d.position) b.object3D.position.copy(d.position);
          if (d.scale) b.object3D.scale.copy(d.scale);
          if (d.rotation) b.object3D.quaternion.copy(d.rotation);
        });
      };

      CS1.socket.on("add-grabbable-primitive", d => {
        if (d.origin == CS1.socket.id || !CS1.game.hasBegun) return;
        const entity = document.createElement(d.type);
        entity.setAttribute("grabbable", "remote:true");
        entity.object3D.position.set(
          d.position.x,
          d.position.y,
          d.position.z
        );
        entity.object3D.scale.set(
          d.scale.x,
          d.scale.y,
          d.scale.z
        );
        entity.object3D.setRotationFromQuaternion(
          new THREE.Quaternion(
            d.rotation.x,
            d.rotation.y,
            d.rotation.z,
            d.rotation.w
          )
        );
        entity.soundState = d.soundState;
        console.log("adding remote late grabbable");
        if (d.custom) {
          for (let [key, value] of Object.entries(d.custom)) {
            if (value) entity.setAttribute(key, value);
            if (key == "collectible") {
              console.log("detected collectible on remote late grabbable");
            }
            if (key == "launchable") {
              entity.setAttribute("launchable", "");
              console.log("detected launchable on remote late grabbable");
            }
            if (key == "postRelease") {
              entity.setAttribute('grabbable',`remote:true;postRelease:${value}`);
              console.log("detected postRelease on remote late grabbable");
            }
          }
        }
        CS1.scene.appendChild(entity);
      });
      
       CS1.socket.on("post-release", grabbableName=>{
        if( CS1.grabbables[grabbableName] &&
             typeof CS1.callbacks[CS1.grabbables[grabbableName].components.grabbable.data.postRelease]=='function' )
          CS1.callbacks[CS1.grabbables[grabbableName].components.grabbable.data.postRelease](grabbableName);
      });
      
    }
  }); //end system definition

  AFRAME.registerComponent("grabbable", {
    schema: {
      origin: { type: "selector" },
      remote: { default: false },
      postRelease: { default: '' }
    },

    init: function() {
      var self = this;
      self.cursor = false;
      self.isDragging = false;
      self.originEl = this.data.origin || this.el;
      self.proxyObject = null;

      self.el.classList.add("interactive");

      if (self.el.components.log) {
        //this.el.components.log.data.channel = this.name;
        self.el.setAttribute("log", `channel:${String(self.name)}`);
        if (!CS1.socket._callbacks["$vr-log"])
          CS1.socket.on("vr-log", data => {
            CS1.log(data.msg, String(data.channel));
          });
      }

      this.name = Object.keys(CS1.grabbables).length;
      CS1.grabbables[this.name] = self.el;
      
      

      if (CS1 && CS1.game && CS1.game.hasBegun && !this.data.remote) {
        console.log("Adding a local late grabbable.");
        const c = {};
        c.color = self.el.getAttribute("color");
        const s = self.el.getAttribute("src");
        if (s) c.src = s;
        const collectible = self.el.components.collectible;
        if (collectible) {
          c.collectible = collectible.data;
          console.log("detected collectible on local late grabbable");
        }
        const launchable = self.el.components.launchable;
        if (launchable) {
          c.launchable = true;
          console.log("detected launchable on local late grabbable");
        }
        if (this.data.postRelease) {
          c.postRelease = this.data.postRelease;
        }
        onGameStart();
        CS1.socket.emit("add-grabbable-primitive", {
          name: self.name,
          position: self.el.object3D.position,
          scale: self.el.object3D.scale,
          rotation: {
            x: self.el.object3D.quaternion.x,
            y: self.el.object3D.quaternion.y,
            z: self.el.object3D.quaternion.z,
            w: self.el.object3D.quaternion.w
          },
          soundState: self.el.soundState,
          type: self.el.nodeName,
          custom: c,
          origin: CS1.socket.id
        });
      }

      self.el.addEventListener("mousedown", grab);
      self.el.addEventListener("mouseup", release);

      function onGameStart() {
        if (CS1.device == "Mobile") {
          self.el.addEventListener("click", function(e) {
            grab(e);
            setTimeout(function(e) {
              document
                .querySelector("#cam-cursor")
                .setAttribute("material", "color: yellow");
              release(e);
              setTimeout(function(e) {
                document
                  .querySelector("#cam-cursor")
                  .setAttribute("material", "color: crimson");
              }, 500);
            }, 5000);
          });

          self.el.addEventListener("mouseenter", e => {
            document
              .querySelector("#cam-cursor")
              .setAttribute("material", { color: "green" });
          });
          self.el.addEventListener("mouseleave", e => {
            document
              .querySelector("#cam-cursor")
              .setAttribute("material", { color: "crimson" });
          });
        } else if (CS1.device == "Standard") {
          //No headset and not mobile

          self.el.addEventListener("mouseenter", e => {
            document
              .querySelector("#cam-cursor")
              .setAttribute("material", { color: "green" });
          });
          self.el.addEventListener("mouseleave", e => {
            document
              .querySelector("#cam-cursor")
              .setAttribute("material", { color: "crimson" });
          });
        }
        document.removeEventListener("gameStart", onGameStart);
      }

      document.addEventListener("gameStart", onGameStart);

      function grab(e) {
        e.cancelBubble = true;
        if (self.isDragging) return;

        self.isDragging = true;

        self.cursor = e.detail.cursorEl;
        if (self.cursor == self.el.sceneEl)
          self.cursor = document.querySelector("[camera]"); //This handles the scenario where the user isn't using motion controllers

        // avoid seeing flickering at origin during reparenting
        self.el.setAttribute("visible", false);
        setTimeout(function() {
          self.el.setAttribute("visible", true);
        }, 20);

        createProxyObject(self.cursor.object3D);

        self.originEl.emit("grabStart", e);
        self.originEl.addState("moving");
      }

      if (AFRAME.utils.device.checkHeadsetConnected()) {
        self.el.addEventListener("mouseup", release);
      } else self.el.addEventListener("mouseup", release);

      function release(e) {
        if (self.isDragging) {
          //CS1.socket.emit('logall',{msg:`${CS1.myPlayer.name} releasing!` ,channel:self.name});
          self.isDragging = false;

          if (self.proxyObject) {
            self.proxyObject.parent.remove(self.proxyObject);
            self.proxyObject = null;
          }

          self.originEl.setAttribute(
            "position",
            self.originEl.getAttribute("position")
          ); //seems pointless, but will force the event system to notify subscribers
          self.originEl.setAttribute(
            "rotation",
            self.originEl.getAttribute("rotation")
          ); //seems pointless, but will force the event system to notify subscribers

          
          
          if(self.data.postRelease){
            CS1.socket.emit("post-release", self.name); 
            CS1.callbacks[self.data.postRelease](self.name);
          }
          
          self.originEl.emit("grabEnd", e);
            
          setTimeout(e=>{
            self.originEl.removeState("moving");
          },500);
          
          
          
        }
      }

      function createProxyObject(cursorObject) {
        self.proxyObject = new THREE.Object3D();
        self.originEl.visible = false;
        //handle object momentary flicker at world origin
        setTimeout(function() {
          self.originEl.visible = true;
        }, 1000);
        cursorObject.add(self.proxyObject);
        copyTransform(self.originEl.object3D, self.proxyObject);
      }
    },

    tick: function() {
      var self = this;
      if (self.proxyObject) {
        copyTransform(self.proxyObject, self.originEl.object3D);
        self.originEl.setAttribute(
          "position",
          self.originEl.getAttribute("position")
        ); //seems pointless, but will force the event system to notify subscribers
        self.originEl.setAttribute(
          "rotation",
          self.originEl.getAttribute("rotation")
        ); //seems pointless, but will force the event system to notify subscribers
      }
    }
  });
})();
