(function () {
  'use strict';

  var utils = CS1=>{
    CS1.utils = {
      uid: (()=>{
          const firstItem = {
              value: "0"
          };
          /*length can be increased for lists with more items.*/
          let counter = "123456789".split('')
              .reduce((acc, curValue, curIndex, arr) => {
                  const curObj = {};
                  curObj.value = curValue;
                  curObj.prev = acc;

                  return curObj;
              }, firstItem);
          firstItem.prev = counter;

          return function () {
              let now = Date.now();
              if (typeof performance === "object" && typeof performance.now === "function") {
                  now = performance.now().toString().replace('.', '');
              }
              counter = counter.prev;
              return `${now}${Math.random().toString(16).substr(2)}${counter.value}`;
          }
      })(),
      
      isEqual : function (value, other) {
        
        function compare(item1, item2) {

          // Get the object type
          var itemType = Object.prototype.toString.call(item1);

          // If the two items are not the same type, return false
          if (itemType !== Object.prototype.toString.call(item2)) return false;

          // If it's a function, convert to a string and compare
          // Otherwise, just compare
          if (itemType === '[object Function]') {
            if (item1.toString() !== item2.toString()) return false;
          } else {
            if (item1 !== item2) return false;
          }
        }
        

        // ...

        // Compare properties
        for (var key in value) {
          if (value.hasOwnProperty(key)) {
              if (compare(value[key], other[key]) === false) return false;
          }
        }

        // If nothing failed, return true
        return true;

      },
      
      toColor: function (num) {
            num >>>= 0;
            var b = num & 0xFF,
                g = (num & 0xFF00) >>> 8,
                r = (num & 0xFF0000) >>> 16,
                a = ( (num & 0xFF000000) >>> 24 ) / 255 ;
            return "rgba(" + [r, g, b, a].join(",") + ")";
        },
      
      randomFromArray: function (array) {
        if(array.length>0){
          return array[Math.floor(Math.random()*array.length)];
        }else{
          return false;
        }
      }
         

    };
  };

  (()=>{

    window.addEventListener('load', function () {
      let loadSpinner = document.createElement('div');
      loadSpinner.className = 'lds-grid';
      for(let i=0;i<9;i++){
        loadSpinner.appendChild(document.createElement('div'));
      } 
      loadSpinner.style.left = window.innerWidth/2 - 32 + 'px';
      let loadingScreen =  document.querySelector('#loading-screen');
      loadingScreen.style.width = window.innerWidth + 'px';
      loadingScreen.style.height = window.innerHeight + 'px';
      loadingScreen.appendChild(loadSpinner);
    }, false);
    
  })();

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

  ((function grabbable() {
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
  })());

  ((function navpointer(){

    AFRAME.registerComponent('nav-pointer', {
    init: function () {
      const el = this.el;
  // On click, send the NPC to the target location.
      el.addEventListener('click',e=>{
        const ctrlEl = el.sceneEl.querySelector('[nav-agent]');
        if(ctrlEl) ctrlEl.setAttribute('nav-agent', {
          active: true,
          destination: e.detail.intersection.point
        });
      });
      el.addEventListener('mouseenter',e=>{
        el.setAttribute('material', {color: 'green'});
      });
      el.addEventListener('mouseleave',e=>{
        el.setAttribute('material', {color: 'crimson'});
      });
      
      el.addEventListener('mousedown',e=>{
        //console.log(e);
      });
   
      // Refresh the raycaster after models load.
      el.sceneEl.addEventListener('object3dset',e=>{
        this.el.components.raycaster.refreshObjects();
      });
    }
  });
    
  })());

  ((function d3graph(){
    
    AFRAME.registerComponent('weather-viz', {
      schema:{
        side: {type:'string', default:'double'},
        url: {type:'string', default:'https://api.openweathermap.org/data/2.5/forecast/?appid=56df5e300fabead0a56fc2d706e6aa7d&id=4959473'}
      },
      dependencies: ['geometry', 'material'],
      init: function () {
        this.el.setAttribute('width',6);
        this.el.setAttribute('height',4);
        this.canvas=document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = -2000;
        this.canvas.id=CS1.utils.uid();
        this.canvas.setAttribute('crossOrigin','anonymous');
        document.querySelector('a-scene').appendChild(this.canvas);
        this.el.setAttribute('material',`shader:flat;src:#${this.canvas.id};side:${this.data.side}`);
        
        this.cursor = document.querySelector('#cam-cursor');

        var ctx = this.ctx = this.canvas.getContext('2d');
        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);  
        this.dataProcessed=false;
        fetch(this.data.url)
          .then(resp=>{return resp.json()})
          .then(json=>{this.processData(json);})
          .catch(err=>{console.log(err);});
      },
      processData: function(dataToProcess){
          this.data = [];
          dataToProcess.list.forEach(day=>{
            //console.log(day.dt_txt , this.k2f(day.main.temp_max)+'F');
            this.data.push({dt:day.dt_txt,temp_max:this.k2f(day.main.temp_max)});
          });
          this.dataProcessed=true;
      },
      k2f: function(k){
        return Math.round((k - 273.15) * 9/5 + 32);
      },
      tick: function(t,dt){
        if(!this.dataProcessed)return;
        this.visualizeData(t);
        this.updateCanvas(); 
      },
      visualizeData: function(t){
        let canvas = this.canvas;
        let dt_width = canvas.width/this.data.length;
        let ctx = this.ctx;
        if(this.cursor.getAttribute('material').color=='green')t=1000;
        this.data.forEach((d,i)=>{
          let hue = t*(d.temp_max / 900);
          ctx.fillStyle = 'hsl(' + hue + ', 50%, 30%)';
          ctx.fillRect(i*dt_width, 0, dt_width, canvas.height);
        });
        
        
        
      
      },
      drawRectangles: function(t){
        var canvas = this.canvas;
        var ctx = this.ctx;
        var x;
        var y;
        var hue = t / 10;
        ctx.fillStyle = 'hsl(' + hue + ', 50%, 80%)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        hue = t / 15;
        ctx.fillStyle = 'hsl(' + hue + ', 50%, 60%)';
        x = canvas.width / 10;
        y = canvas.height / 10;
        ctx.fillRect(x, y, canvas.width - x * 2, canvas.height - y * 2);
        hue = t / 20;
        ctx.fillStyle = 'hsl(' + hue + ', 50%, 40%)';
        x = canvas.width / 5;
        y = canvas.height / 5;
        ctx.fillRect(x, y, canvas.width - x * 2, canvas.height - y * 2);
      },
      updateCanvas: function(){
        var el = this.el;
        var material;
        material = el.getObject3D('mesh').material;
          if (!material.map) {
              return;
        }
        material.map.needsUpdate = true;   
      }
      
    });
    
  })());

  var id = 139;
  var name$1 = "Polkadot Shader";
  var fragment = "// Gives us dFdx\n#extension GL_OES_standard_derivatives : enable\n\nprecision highp float;\nprecision highp int;\n\nuniform vec3 cameraPosition;\nuniform vec3 color1;\nuniform vec3 color2;\nuniform float frequency;\nuniform float radius;\n\nvarying vec3 vPosition;\nvarying vec3 vNormal;\nvarying vec2 vUv;\n\n// Anti-alias step function\nfloat aastep(float threshold, float value) {\n    float afwidth = 0.7 * length(vec2(dFdx(value), dFdy(value)));\n    return smoothstep(threshold - afwidth, threshold + afwidth, value);\n}\n \nvoid main() {\n    // Rotate the UV coord by 45 degrees. See \n    // https://en.wikipedia.org/wiki/Rotation_matrix#Common_rotations\n    vec2 st2 = mat2( 0.5, -0.5, 0.5, 0.5 ) * vUv;\n    vec2 nearest = 2.0 * fract( frequency * st2 ) - 1.0;\n    float dist = length( nearest );\n    \n    vec3 fragcolor = mix( color1, color2, aastep( radius, dist ) );\n    gl_FragColor = vec4( fragcolor, 1.0 );\n}";
  var vertex = "/**\n* Example Vertex Shader\n* Sets the position of the vertex by setting gl_Position\n*/\n\n// Set the precision for data types used in this shader\nprecision highp float;\nprecision highp int;\n\n// Default THREE.js uniforms available to both fragment and vertex shader\nuniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 viewMatrix;\nuniform mat3 normalMatrix;\n\n// Default uniforms provided by ShaderFrog.\nuniform vec3 cameraPosition;\nuniform float time;\n\n// Default attributes provided by THREE.js. Attributes are only available in the\n// vertex shader. You can pass them to the fragment shader using varyings\nattribute vec3 position;\nattribute vec3 normal;\nattribute vec2 uv;\nattribute vec2 uv2;\n\n// Examples of variables passed from vertex to fragment shader\nvarying vec3 vPosition;\nvarying vec3 vNormal;\nvarying vec2 vUv;\nvarying vec2 vUv2;\n\nvoid main() {\n\n    // To pass variables to the fragment shader, you assign them here in the\n    // main function. Traditionally you name the varying with vAttributeName\n    vNormal = normal;\n    vUv = uv;\n    vUv2 = uv2;\n    vPosition = position;\n\n    // This sets the position of the vertex in 3d space. The correct math is\n    // provided below to take into account camera and object data.\n    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n\n}";
  var uniforms = {
  	cameraPosition: {
  		name: "cameraPosition",
  		type: "v3",
  		glslType: "vec3",
  		description: ""
  	},
  	time: {
  		name: "time",
  		type: "f",
  		glslType: "float",
  		description: ""
  	},
  	color1: {
  		name: null,
  		type: "c",
  		glslType: "vec3",
  		value: {
  			r: 1,
  			g: 0.5411764705882353,
  			b: 0.7294117647058823
  		},
  		description: ""
  	},
  	color2: {
  		name: null,
  		type: "c",
  		glslType: "vec3",
  		value: {
  			r: 0,
  			g: 0,
  			b: 0
  		},
  		description: ""
  	},
  	frequency: {
  		name: null,
  		type: "f",
  		glslType: "float",
  		value: "10",
  		description: ""
  	},
  	radius: {
  		name: null,
  		type: "f",
  		glslType: "float",
  		value: "0.5",
  		description: ""
  	}
  };
  var url = "http://shaderfrog.com/app/view/139";
  var user = {
  	username: "andrewray",
  	url: "http://shaderfrog.com/app/profile/andrewray"
  };
  var Polkadot_Shader = {
  	id: id,
  	name: name$1,
  	fragment: fragment,
  	vertex: vertex,
  	uniforms: uniforms,
  	url: url,
  	user: user
  };

  var id$1 = 1068;
  var name$2 = "Sun Shader";
  var fragment$1 = "#define OCTAVES 2\n\n#extension GL_OES_standard_derivatives : enable\n\nprecision highp float;\nprecision highp int;\nuniform float time;\nuniform float brightness;\nuniform float sunSpots;\nuniform vec3 color;\nuniform vec2 speed;\nuniform vec2 resolution;\nvarying vec2 vUv;\nfloat rand(vec2 n) \n{\n    return fract(sin(dot(n, vec2(13, 5))) * 43758.5453);\n}\nfloat noise(vec2 n) \n{\n    const vec2 d = vec2(0.0, 1.0);\n    vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));\n    return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);\n}\nfloat fbm(vec2 n) \n{\n    float total = 0.0;\n    float amplitude = 2.0;\n    for (int i = 0;\n i < OCTAVES; i++) \n    {\n        total += noise(n) * amplitude;\n        n += n;\n        amplitude *= 0.3;\n    }\n    return total;\n}\nvec3 tex(vec2 pos) \n{\n    vec3 c1 = (1.0 - sunSpots) * vec3(3.1, 0.0, 0.0);\n    vec3 c2 = vec3(c1);\n    vec3 c3 = vec3(c1);\n    vec3 c4 = vec3(3.0, 0.9, 0.0) * color;\n    vec3 c5 = vec3(c3);\n    vec3 c6 = vec3(c1);\n    vec2 p = pos;\n    float q = fbm(p + time * speed);\n    vec2 r = vec2(fbm(p + q + (time * speed.x) - p.x - p.y), fbm(p + p + (time * speed.y)));\n    vec3 c = color * (mix(c1, c2, fbm(p + r)) + mix(c3, c4, r.x) - mix(c5, c6, r.y));\n    return c;\n}\nvec4 Surface_of_The_Sun1478777938883_101_main() \n{\n    vec4 Surface_of_The_Sun1478777938883_101_gl_FragColor = vec4(0.0);\n    vec2 p = (vUv - 0.5) * resolution;\n    vec3 col = tex(p);\n    Surface_of_The_Sun1478777938883_101_gl_FragColor = vec4(col * brightness, 1.0);\n    return Surface_of_The_Sun1478777938883_101_gl_FragColor *= 1.0;\n}\nvoid main() \n{\n    gl_FragColor = (Surface_of_The_Sun1478777938883_101_main());}\n";
  var vertex$1 = "precision highp float;\nprecision highp int;\nuniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 viewMatrix;\nuniform mat3 normalMatrix;\nuniform vec3 cameraPosition;\nuniform float time;\nattribute vec3 position;\nattribute vec3 normal;\nattribute vec2 uv;\nattribute vec2 uv2;\nvarying vec3 vPosition;\nvarying vec3 vNormal;\nvarying vec2 vUv;\nvarying vec2 vUv2;\nvec4 Surface_of_The_Sun1478777938883_101_main() \n{\n    vec4 Surface_of_The_Sun1478777938883_101_gl_Position = vec4(0.0);\n    vNormal = normal;\n    vUv = uv;\n    vUv2 = uv2;\n    vPosition = position;\n    Surface_of_The_Sun1478777938883_101_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n    return Surface_of_The_Sun1478777938883_101_gl_Position *= 1.0;\n}\nvoid main() \n{\n    gl_Position = Surface_of_The_Sun1478777938883_101_main();}\n";
  var uniforms$1 = {
  	cameraPosition: {
  		type: "v3",
  		glslType: "vec3"
  	},
  	time: {
  		type: "f",
  		glslType: "float"
  	},
  	resolution: {
  		value: {
  			x: "100",
  			y: "100"
  		},
  		type: "v2",
  		glslType: "vec2"
  	},
  	brightness: {
  		value: "0.52098325",
  		type: "f",
  		glslType: "float"
  	},
  	speed: {
  		value: {
  			x: 0.9230769230769231,
  			y: 0.9230769230769231
  		},
  		type: "v2",
  		glslType: "vec2"
  	},
  	color: {
  		value: {
  			r: "1",
  			g: "1",
  			b: "1"
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	sunSpots: {
  		value: "1",
  		type: "f",
  		glslType: "float"
  	}
  };
  var url$1 = "http://shaderfrog.com/app/view/1068";
  var user$1 = {
  	username: "entropy",
  	url: "http://shaderfrog.com/app/profile/andrewray"
  };
  var Sun_Shader = {
  	id: id$1,
  	name: name$2,
  	fragment: fragment$1,
  	vertex: vertex$1,
  	uniforms: uniforms$1,
  	url: url$1,
  	user: user$1
  };

  var id$2 = 2901;
  var name$3 = "Jelly Shader";
  var fragment$2 = "#define TAU 6.28318530718\n#define MAX_ITER 5\n#define tau 6.2831853\n\n#extension GL_OES_standard_derivatives : enable\n\nprecision highp float;\nprecision highp int;\nuniform vec2 Tiling_Caustic1477531952046_152_resolution;\nuniform vec3 backgroundColor;\nuniform vec3 Tiling_Caustic1477531952046_152_color;\nuniform float Tiling_Caustic1477531952046_152_speed;\nuniform float Tiling_Caustic1477531952046_152_brightness;\nuniform float time;\nuniform float contrast;\nuniform float distortion;\nuniform float Noise_Ripples1477531959288_166_speed;\nuniform vec3 Noise_Ripples1477531959288_166_color;\nuniform float Noise_Ripples1477531959288_166_brightness;\nuniform sampler2D noiseImage;\nuniform vec2 Noise_Ripples1477531959288_166_resolution;\nuniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat3 normalMatrix;\nuniform float highlightIntensity;\nuniform vec3 highlightColor;\nuniform vec3 Wiggly_Improved1477532051339_181_color;\nuniform vec3 Transparent_Glow1477532059126_201_color;\nuniform float Transparent_Glow1477532059126_201_start;\nuniform float Transparent_Glow1477532059126_201_end;\nuniform float Transparent_Glow1477532059126_201_alpha;\nuniform vec3 Glow_Effect1477532183055_216_color;\nuniform float Glow_Effect1477532183055_216_start;\nuniform float Glow_Effect1477532183055_216_end;\nuniform float Glow_Effect1477532183055_216_alpha;\nvarying vec2 Tiling_Caustic1477531952046_152_vUv;\nvarying vec2 Noise_Ripples1477531959288_166_vUv;\nmat2 makem2(in float theta) \n    {\n        float c = cos(theta);\n        float s = sin(theta);\n        return mat2(c, -s, s, c);\n    }\nfloat noise(in vec2 x) \n    {\n        return texture2D(noiseImage, x * .01).x;\n    }\nfloat fbm(in vec2 p) \n    {\n        float z = 2.;\n        float rz = 0.;\n        vec2 bp = p;\n        for (float i = 1.;\n i < 6.0; i++) \n        {\n            rz += abs((noise(p) - 0.5) * 2.0) / z;\n            z = z * 2.;\n            p = p * 2.;\n        }\n        return rz;\n    }\nfloat dualfbm(in vec2 p) \n    {\n        vec2 p2 = p * distortion;\n        vec2 basis = vec2(fbm(p2 - time * Noise_Ripples1477531959288_166_speed * 1.6), fbm(p2 + time * Noise_Ripples1477531959288_166_speed * 1.7));\n        basis = (basis - .5) * .2;\n        p += basis;\n        return fbm(p * makem2(time * Noise_Ripples1477531959288_166_speed * 0.2));\n    }\nvarying vec3 Wiggly_Improved1477532051339_181_vNormal;\nvarying float light;\nvarying vec3 Transparent_Glow1477532059126_201_fPosition;\nvarying vec3 Transparent_Glow1477532059126_201_fNormal;\nvarying vec3 Glow_Effect1477532183055_216_fPosition;\nvarying vec3 Glow_Effect1477532183055_216_fNormal;\nvec4 Tiling_Caustic1477531952046_152_main() \n    {\n        vec4 Tiling_Caustic1477531952046_152_gl_FragColor = vec4(0.0);\n        vec2 uv = Tiling_Caustic1477531952046_152_vUv * Tiling_Caustic1477531952046_152_resolution;\n        vec2 p = mod(uv * TAU, TAU) - 250.0;\n        vec2 i = vec2(p);\n        float c = 1.0;\n        float inten = 0.005;\n        for (int n = 0;\n n < MAX_ITER; n++) \n        {\n            float t = time * Tiling_Caustic1477531952046_152_speed * (1.0 - (3.5 / float(n + 1)));\n            i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));\n            c += 1.0 / length(vec2(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten)));\n        }\n        c /= float(MAX_ITER);\n        c = 1.17 - pow(c, Tiling_Caustic1477531952046_152_brightness);\n        vec3 rgb = vec3(pow(abs(c), 8.0));\n        Tiling_Caustic1477531952046_152_gl_FragColor = vec4(rgb * Tiling_Caustic1477531952046_152_color + backgroundColor, 1.0);\n        return Tiling_Caustic1477531952046_152_gl_FragColor *= 1.0;\n    }\nvec4 Noise_Ripples1477531959288_166_main() \n    {\n        vec4 Noise_Ripples1477531959288_166_gl_FragColor = vec4(0.0);\n        vec2 p = (Noise_Ripples1477531959288_166_vUv.xy - 0.5) * Noise_Ripples1477531959288_166_resolution;\n        float rz = dualfbm(p);\n        vec3 col = (Noise_Ripples1477531959288_166_color / rz) * Noise_Ripples1477531959288_166_brightness;\n        col = ((col - 0.5) * max(contrast, 0.0)) + 0.5;\n        Noise_Ripples1477531959288_166_gl_FragColor = vec4(col, 1.0);\n        return Noise_Ripples1477531959288_166_gl_FragColor *= 1.0;\n    }\nvec4 Wiggly_Improved1477532051339_181_main() \n    {\n        vec4 Wiggly_Improved1477532051339_181_gl_FragColor = vec4(0.0);\n        Wiggly_Improved1477532051339_181_gl_FragColor = vec4(clamp(highlightColor * highlightIntensity * light, 0.0, 1.0), 1.0);\n        return Wiggly_Improved1477532051339_181_gl_FragColor *= 1.0;\n    }\nvec4 Transparent_Glow1477532059126_201_main() \n    {\n        vec4 Transparent_Glow1477532059126_201_gl_FragColor = vec4(0.0);\n        vec3 normal = normalize(Transparent_Glow1477532059126_201_fNormal);\n        vec3 eye = normalize(-Transparent_Glow1477532059126_201_fPosition.xyz);\n        float rim = smoothstep(Transparent_Glow1477532059126_201_start, Transparent_Glow1477532059126_201_end, 1.0 - dot(normal, eye));\n        float value = clamp(rim * Transparent_Glow1477532059126_201_alpha, 0.0, 1.0);\n        Transparent_Glow1477532059126_201_gl_FragColor = vec4(Transparent_Glow1477532059126_201_color * value, value);\n        return Transparent_Glow1477532059126_201_gl_FragColor *= 1.0;\n    }\nvec4 Glow_Effect1477532183055_216_main() \n    {\n        vec4 Glow_Effect1477532183055_216_gl_FragColor = vec4(0.0);\n        vec3 normal = normalize(Glow_Effect1477532183055_216_fNormal);\n        vec3 eye = normalize(-Glow_Effect1477532183055_216_fPosition.xyz);\n        float rim = smoothstep(Glow_Effect1477532183055_216_start, Glow_Effect1477532183055_216_end, 1.0 - dot(normal, eye));\n        Glow_Effect1477532183055_216_gl_FragColor = vec4(clamp(rim, 0.0, 1.0) * Glow_Effect1477532183055_216_alpha * Glow_Effect1477532183055_216_color, 1.0);\n        return Glow_Effect1477532183055_216_gl_FragColor *= 1.0;\n    }\nvoid main() \n    {\n        gl_FragColor = (Tiling_Caustic1477531952046_152_main() + Noise_Ripples1477531959288_166_main() + Wiggly_Improved1477532051339_181_main() + Transparent_Glow1477532059126_201_main() + Glow_Effect1477532183055_216_main());    }\n";
  var vertex$2 = "precision highp float;\nprecision highp int;\nuniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 viewMatrix;\nuniform mat3 normalMatrix;\nuniform vec3 cameraPosition;\nuniform float time;\nuniform float Wiggly_Improved1477532051339_181_speed;\nuniform float frequency;\nuniform float amplitude;\nattribute vec3 position;\nattribute vec3 normal;\nattribute vec2 uv;\nattribute vec2 uv2;\nvarying vec3 Tiling_Caustic1477531952046_152_vPosition;\nvarying vec3 Tiling_Caustic1477531952046_152_vNormal;\nvarying vec2 Tiling_Caustic1477531952046_152_vUv;\nvarying vec2 Tiling_Caustic1477531952046_152_vUv2;\nvarying vec3 Noise_Ripples1477531959288_166_vPosition;\nvarying vec3 Noise_Ripples1477531959288_166_vNormal;\nvarying vec2 Noise_Ripples1477531959288_166_vUv;\nvarying vec2 Noise_Ripples1477531959288_166_vUv2;\nvarying vec3 Wiggly_Improved1477532051339_181_vNormal;\nvarying float light;\nvarying vec3 Wiggly_Improved1477532051339_181_vPosition;\nvarying vec3 Transparent_Glow1477532059126_201_fNormal;\nvarying vec3 Transparent_Glow1477532059126_201_fPosition;\nvarying vec3 Glow_Effect1477532183055_216_fNormal;\nvarying vec3 Glow_Effect1477532183055_216_fPosition;\nvec4 Tiling_Caustic1477531952046_152_main() \n    {\n        vec4 Tiling_Caustic1477531952046_152_gl_Position = vec4(0.0);\n        Tiling_Caustic1477531952046_152_vNormal = normal;\n        Tiling_Caustic1477531952046_152_vUv = uv;\n        Tiling_Caustic1477531952046_152_vUv2 = uv2;\n        Tiling_Caustic1477531952046_152_vPosition = position;\n        Tiling_Caustic1477531952046_152_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        return Tiling_Caustic1477531952046_152_gl_Position *= 1.0;\n    }\nvec4 Noise_Ripples1477531959288_166_main() \n    {\n        vec4 Noise_Ripples1477531959288_166_gl_Position = vec4(0.0);\n        Noise_Ripples1477531959288_166_vNormal = normal;\n        Noise_Ripples1477531959288_166_vUv = uv;\n        Noise_Ripples1477531959288_166_vUv2 = uv2;\n        Noise_Ripples1477531959288_166_vPosition = position;\n        Noise_Ripples1477531959288_166_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        return Noise_Ripples1477531959288_166_gl_Position *= 1.0;\n    }\nvec4 Wiggly_Improved1477532051339_181_main() \n    {\n        vec4 Wiggly_Improved1477532051339_181_gl_Position = vec4(0.0);\n        vec3 offset = normalize(vec3(0.0) - position) * (amplitude * sin(Wiggly_Improved1477532051339_181_speed * time + position.y * frequency));\n        vec3 newPosition = position + vec3(offset.x, 0.0, offset.z);\n        light = amplitude * sin(Wiggly_Improved1477532051339_181_speed * time + 1.0 + position.y * frequency);\n        Wiggly_Improved1477532051339_181_vPosition = newPosition;\n        Wiggly_Improved1477532051339_181_gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);\n        return Wiggly_Improved1477532051339_181_gl_Position *= 1.0;\n    }\nvec4 Transparent_Glow1477532059126_201_main() \n    {\n        vec4 Transparent_Glow1477532059126_201_gl_Position = vec4(0.0);\n        Transparent_Glow1477532059126_201_fNormal = normalize(normalMatrix * normal);\n        vec4 pos = modelViewMatrix * vec4(position, 1.0);\n        Transparent_Glow1477532059126_201_fPosition = pos.xyz;\n        Transparent_Glow1477532059126_201_gl_Position = projectionMatrix * pos;\n        return Transparent_Glow1477532059126_201_gl_Position *= 1.0;\n    }\nvec4 Glow_Effect1477532183055_216_main() \n    {\n        vec4 Glow_Effect1477532183055_216_gl_Position = vec4(0.0);\n        Glow_Effect1477532183055_216_fNormal = normalize(normalMatrix * normal);\n        vec4 pos = modelViewMatrix * vec4(position, 1.0);\n        Glow_Effect1477532183055_216_fPosition = pos.xyz;\n        Glow_Effect1477532183055_216_gl_Position = projectionMatrix * pos;\n        return Glow_Effect1477532183055_216_gl_Position *= 1.0;\n    }\nvoid main() \n    {\n        gl_Position = Tiling_Caustic1477531952046_152_main() + Noise_Ripples1477531959288_166_main() + Wiggly_Improved1477532051339_181_main() + Transparent_Glow1477532059126_201_main() + Glow_Effect1477532183055_216_main();    }\n";
  var uniforms$2 = {
  	cameraPosition: {
  		type: "v3",
  		glslType: "vec3"
  	},
  	time: {
  		type: "f",
  		glslType: "float"
  	},
  	backgroundColor: {
  		value: {
  			r: "0",
  			g: "0",
  			b: "0"
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Tiling_Caustic1477531952046_152_resolution: {
  		value: {
  			x: 1,
  			y: 1
  		},
  		type: "v2",
  		glslType: "vec2"
  	},
  	Tiling_Caustic1477531952046_152_color: {
  		value: {
  			r: 1,
  			g: 1,
  			b: 1
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Tiling_Caustic1477531952046_152_speed: {
  		value: "0.5",
  		type: "f",
  		glslType: "float"
  	},
  	Tiling_Caustic1477531952046_152_brightness: {
  		value: "1.5",
  		type: "f",
  		glslType: "float"
  	},
  	noiseImage: {
  		value: null,
  		type: "t",
  		glslType: "sampler2D"
  	},
  	distortion: {
  		value: "2",
  		type: "f",
  		glslType: "float"
  	},
  	contrast: {
  		value: "1.5",
  		type: "f",
  		glslType: "float"
  	},
  	Noise_Ripples1477531959288_166_speed: {
  		value: "0.1",
  		type: "f",
  		glslType: "float"
  	},
  	Noise_Ripples1477531959288_166_color: {
  		value: {
  			r: 1,
  			g: 0.2823529411764706,
  			b: 0.4823529411764706
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Noise_Ripples1477531959288_166_brightness: {
  		value: "0.1",
  		type: "f",
  		glslType: "float"
  	},
  	Noise_Ripples1477531959288_166_resolution: {
  		value: {
  			x: "2",
  			y: "2"
  		},
  		type: "v2",
  		glslType: "vec2"
  	},
  	amplitude: {
  		value: "2",
  		type: "f",
  		glslType: "float"
  	},
  	frequency: {
  		value: "2",
  		type: "f",
  		glslType: "float"
  	},
  	highlightIntensity: {
  		value: "0.4",
  		type: "f",
  		glslType: "float"
  	},
  	highlightColor: {
  		value: {
  			r: 1,
  			g: 0.5450980392156862,
  			b: 0.23529411764705882
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Wiggly_Improved1477532051339_181_color: {
  		value: {
  			r: 0,
  			g: 0,
  			b: 0
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Wiggly_Improved1477532051339_181_speed: {
  		value: "1",
  		type: "f",
  		glslType: "float"
  	},
  	Transparent_Glow1477532059126_201_color: {
  		value: {
  			r: 1,
  			g: 0.5294117647058824,
  			b: 0.8156862745098039
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Transparent_Glow1477532059126_201_start: {
  		value: "0.54674743",
  		type: "f",
  		glslType: "float"
  	},
  	Transparent_Glow1477532059126_201_end: {
  		value: "0.44399246",
  		type: "f",
  		glslType: "float"
  	},
  	Transparent_Glow1477532059126_201_alpha: {
  		value: "0.5",
  		type: "f",
  		glslType: "float"
  	},
  	Glow_Effect1477532183055_216_color: {
  		value: {
  			r: "1",
  			g: "1",
  			b: "1"
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Glow_Effect1477532183055_216_start: {
  		value: "0",
  		type: "f",
  		glslType: "float"
  	},
  	Glow_Effect1477532183055_216_end: {
  		value: "1.9",
  		type: "f",
  		glslType: "float"
  	},
  	Glow_Effect1477532183055_216_alpha: {
  		value: "1",
  		type: "f",
  		glslType: "float"
  	}
  };
  var url$2 = "http://shaderfrog.com/app/view/2901";
  var user$2 = {
  	username: "SirFizX",
  	url: "http://shaderfrog.com/app/profile/andrewray"
  };
  var Jelly_Shader = {
  	id: id$2,
  	name: name$3,
  	fragment: fragment$2,
  	vertex: vertex$2,
  	uniforms: uniforms$2,
  	url: url$2,
  	user: user$2
  };

  var id$3 = 2894;
  var name$4 = "Green Dance";
  var fragment$3 = "#define PI 3.1415926535897932384626433832795\n\nprecision highp float;\nprecision highp int;\nuniform float time;\nuniform float Flowing_Image_Combination1547651045656_420_speed;\nuniform float Flowing_Image_Combination1547651045656_420_resolution;\nuniform sampler2D image1;\nuniform sampler2D image2;\nuniform vec3 Flowing_Image_Combination1547651045656_420_color;\nuniform vec3 Horizontal_Stripes1547651045669_423_color1;\nuniform vec3 Horizontal_Stripes1547651045669_423_color2;\nuniform float Horizontal_Stripes1547651045669_423_speed;\nuniform float Horizontal_Stripes1547651045669_423_multiplicationFactor;\nuniform vec3 Vertical_2_Color_Graident1547651045681_426_color1;\nuniform vec3 Vertical_2_Color_Graident1547651045681_426_color2;\nuniform float Checkerboard1547651045687_429_multiplicationFactor;\nuniform float Borg_Hull1547651045698_432_speed;\nuniform float Borg_Hull1547651045698_432_resolution;\nuniform vec3 Borg_Hull1547651045698_432_color;\nuniform float brightness;\nuniform float Disco_Dots1547651045724_435_speed;\nuniform vec2 Disco_Dots1547651045724_435_resolution;\nuniform vec3 Disco_Dots1547651045724_435_color;\nvarying vec2 Flowing_Image_Combination1547651045656_420_vUv;\nvarying vec2 Horizontal_Stripes1547651045669_423_vUv;\nvarying vec2 Vertical_2_Color_Graident1547651045681_426_vUv;\nvarying vec2 Checkerboard1547651045687_429_vUv;\nvarying vec3 vPosition;\nvarying vec2 Borg_Hull1547651045698_432_vUv;\nvec2 circuit(vec2 p) \n    {\n        p = fract(p);\n        float r = 5.123;\n        float v = 0.0, g = 0.0;\n        r = fract(r * 9184.928);\n        float cp, d;\n        d = p.x;\n        g += pow(clamp(1.0 - abs(d), 0.0, 1.0), 1000.0);\n        d = p.y;\n        g += pow(clamp(1.0 - abs(d), 0.0, 1.0), 1000.0);\n        d = p.x - 1.0;\n        g += pow(clamp(3.0 - abs(d), 0.0, 1.0), 1000.0);\n        d = p.y - 1.0;\n        g += pow(clamp(1.0 - abs(d), 0.0, 1.0), 10000.0);\n        const int iter = 20;\n        for (int i = 0;\n i < iter; i++) \n        {\n            cp = 0.5 + (r - 0.5) * 0.9;\n            d = p.x - cp;\n            g += pow(clamp(1. - abs(d), 0.0, 1.0), 200.0);\n            if (d > 0.0) \n            {\n                r = fract(r * 4829.013);\n                p.x = (p.x - cp) / (1.0 - cp);\n                v += 1.0;\n            }\n else \n            {\n                r = fract(r * 1239.528);\n                p.x = p.x / cp;\n            }\n            p = p.yx;\n        }\n        v /= float(iter);\n        return vec2(g, v);\n    }\nvarying vec2 Disco_Dots1547651045724_435_vUv;\nfloat rand(vec2 co) \n    {\n        return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n    }\nvec4 Flowing_Image_Combination1547651045656_420_main() \n    {\n        vec4 Flowing_Image_Combination1547651045656_420_gl_FragColor = vec4(0.0);\n        vec2 uv = Flowing_Image_Combination1547651045656_420_vUv.xy * Flowing_Image_Combination1547651045656_420_resolution;\n        vec4 texCol = vec4(texture2D(image1, uv));\n        mat3 tfm;\n        tfm[0] = vec3(texCol.z, 0.0, 0);\n        tfm[1] = vec3(0.0, texCol.y, 0);\n        tfm[2] = vec3(0, 0, 1.0);\n        vec2 muv = (vec3(uv, 1.0) * tfm).xy + time * Flowing_Image_Combination1547651045656_420_speed;\n        texCol = vec4(vec3(texture2D(image2, muv)) * Flowing_Image_Combination1547651045656_420_color, 1.0);\n        Flowing_Image_Combination1547651045656_420_gl_FragColor = texCol;\n        return Flowing_Image_Combination1547651045656_420_gl_FragColor *= 1.0;\n    }\nvec4 Horizontal_Stripes1547651045669_423_main() \n    {\n        vec4 Horizontal_Stripes1547651045669_423_gl_FragColor = vec4(0.0);\n        float x = fract((Horizontal_Stripes1547651045669_423_vUv.y + (time * Horizontal_Stripes1547651045669_423_speed)) * Horizontal_Stripes1547651045669_423_multiplicationFactor);\n        float f = smoothstep(0.40, 0.5, x) - smoothstep(0.90, 1.0, x);\n        Horizontal_Stripes1547651045669_423_gl_FragColor = vec4(mix(Horizontal_Stripes1547651045669_423_color2, Horizontal_Stripes1547651045669_423_color1, f), 1.0);\n        return Horizontal_Stripes1547651045669_423_gl_FragColor *= 0.3;\n    }\nvec4 Vertical_2_Color_Graident1547651045681_426_main(void) \n    {\n        vec4 Vertical_2_Color_Graident1547651045681_426_gl_FragColor = vec4(0.0);\n        vec3 mixCol = mix(Vertical_2_Color_Graident1547651045681_426_color2, Vertical_2_Color_Graident1547651045681_426_color1, Vertical_2_Color_Graident1547651045681_426_vUv.y);\n        Vertical_2_Color_Graident1547651045681_426_gl_FragColor = vec4(mixCol, 1.);\n        return Vertical_2_Color_Graident1547651045681_426_gl_FragColor *= 1.0;\n    }\nvec4 Checkerboard1547651045687_429_main() \n    {\n        vec4 Checkerboard1547651045687_429_gl_FragColor = vec4(0.0);\n        vec2 t = Checkerboard1547651045687_429_vUv * Checkerboard1547651045687_429_multiplicationFactor;\n        vec3 p = vPosition * Checkerboard1547651045687_429_multiplicationFactor;\n        vec3 color;\n        if (mod(floor(t.x) + floor(t.y), 2.0) == 1.0) color = vec3(1.0, 1.0, 1.0);\n else color = vec3(0.0, 0.0, 0.0);\n        Checkerboard1547651045687_429_gl_FragColor = vec4(color, 1.0);\n        return Checkerboard1547651045687_429_gl_FragColor *= -0.5;\n    }\nvec4 Borg_Hull1547651045698_432_main() \n    {\n        vec4 Borg_Hull1547651045698_432_gl_FragColor = vec4(0.0);\n        float scale = 2.0;\n        vec2 uv = (Borg_Hull1547651045698_432_vUv.yx - 0.5) * Borg_Hull1547651045698_432_resolution;\n        uv = uv * scale + vec2(0.0, time * Borg_Hull1547651045698_432_speed);\n        vec2 cid2 = floor(uv);\n        float cid = (cid2.y * 10.0 + cid2.x) * 0.1;\n        vec2 dg = circuit(uv);\n        float d = dg.x;\n        vec3 col1 = (brightness - vec3(max(min(d, 2.0) - 1.0, 0.0) * 2.0 * 0.25)) * Borg_Hull1547651045698_432_color;\n        Borg_Hull1547651045698_432_gl_FragColor = vec4(col1, 1.0);\n        return Borg_Hull1547651045698_432_gl_FragColor *= -0.7;\n    }\nvec4 Disco_Dots1547651045724_435_main(void) \n    {\n        vec4 Disco_Dots1547651045724_435_gl_FragColor = vec4(0.0);\n        vec2 v = Disco_Dots1547651045724_435_vUv.xy * Disco_Dots1547651045724_435_resolution;\n        float brightness = fract(rand(floor(v)) + time * Disco_Dots1547651045724_435_speed);\n        brightness *= 0.5 - length(fract(v) - vec2(0.5, 0.5));\n        Disco_Dots1547651045724_435_gl_FragColor = vec4(2.0 * brightness * Disco_Dots1547651045724_435_color, 1.0);\n        return Disco_Dots1547651045724_435_gl_FragColor *= 1.0;\n    }\nvoid main() \n    {\n        gl_FragColor = (Flowing_Image_Combination1547651045656_420_main() + Horizontal_Stripes1547651045669_423_main() + Vertical_2_Color_Graident1547651045681_426_main() + Checkerboard1547651045687_429_main() + Borg_Hull1547651045698_432_main() + Disco_Dots1547651045724_435_main());    }\n";
  var vertex$3 = "precision highp float;\nprecision highp int;\nuniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 viewMatrix;\nuniform mat3 normalMatrix;\nattribute vec3 position;\nattribute vec3 normal;\nattribute vec2 uv;\nattribute vec2 uv2;\nvarying vec2 Flowing_Image_Combination1547651045656_420_vUv;\nvarying vec2 Horizontal_Stripes1547651045669_423_vUv;\nvarying vec2 Vertical_2_Color_Graident1547651045681_426_vUv;\nvarying vec2 Checkerboard1547651045687_429_vUv;\nvarying vec3 vPosition;\nvarying vec2 Borg_Hull1547651045698_432_vUv;\nvarying vec2 Disco_Dots1547651045724_435_vUv;\nvec4 Flowing_Image_Combination1547651045656_420_main() \n    {\n        vec4 Flowing_Image_Combination1547651045656_420_gl_Position = vec4(0.0);\n        Flowing_Image_Combination1547651045656_420_vUv = uv;\n        Flowing_Image_Combination1547651045656_420_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        return Flowing_Image_Combination1547651045656_420_gl_Position *= 1.0;\n    }\nvec4 Horizontal_Stripes1547651045669_423_main() \n    {\n        vec4 Horizontal_Stripes1547651045669_423_gl_Position = vec4(0.0);\n        Horizontal_Stripes1547651045669_423_vUv = uv;\n        Horizontal_Stripes1547651045669_423_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        return Horizontal_Stripes1547651045669_423_gl_Position *= 0.3;\n    }\nvec4 Vertical_2_Color_Graident1547651045681_426_main() \n    {\n        vec4 Vertical_2_Color_Graident1547651045681_426_gl_Position = vec4(0.0);\n        Vertical_2_Color_Graident1547651045681_426_vUv = uv;\n        Vertical_2_Color_Graident1547651045681_426_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        return Vertical_2_Color_Graident1547651045681_426_gl_Position *= 1.0;\n    }\nvec4 Checkerboard1547651045687_429_main() \n    {\n        vec4 Checkerboard1547651045687_429_gl_Position = vec4(0.0);\n        Checkerboard1547651045687_429_vUv = uv;\n        vPosition = position;\n        Checkerboard1547651045687_429_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        return Checkerboard1547651045687_429_gl_Position *= -0.5;\n    }\nvec4 Borg_Hull1547651045698_432_main() \n    {\n        vec4 Borg_Hull1547651045698_432_gl_Position = vec4(0.0);\n        Borg_Hull1547651045698_432_vUv = uv;\n        Borg_Hull1547651045698_432_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        return Borg_Hull1547651045698_432_gl_Position *= -0.7;\n    }\nvec4 Disco_Dots1547651045724_435_main() \n    {\n        vec4 Disco_Dots1547651045724_435_gl_Position = vec4(0.0);\n        Disco_Dots1547651045724_435_vUv = uv;\n        Disco_Dots1547651045724_435_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        return Disco_Dots1547651045724_435_gl_Position *= 1.0;\n    }\nvoid main() \n    {\n        gl_Position = Flowing_Image_Combination1547651045656_420_main() + Horizontal_Stripes1547651045669_423_main() + Vertical_2_Color_Graident1547651045681_426_main() + Checkerboard1547651045687_429_main() + Borg_Hull1547651045698_432_main() + Disco_Dots1547651045724_435_main();    }\n";
  var uniforms$3 = {
  	time: {
  		type: "f",
  		glslType: "float"
  	},
  	image1: {
  		value: null,
  		type: "t",
  		glslType: "sampler2D"
  	},
  	image2: {
  		value: null,
  		type: "t",
  		glslType: "sampler2D"
  	},
  	Flowing_Image_Combination1547651045656_420_speed: {
  		value: "0.1",
  		type: "f",
  		glslType: "float"
  	},
  	Flowing_Image_Combination1547651045656_420_resolution: {
  		value: "2",
  		type: "f",
  		glslType: "float"
  	},
  	Flowing_Image_Combination1547651045656_420_color: {
  		value: {
  			r: 1,
  			g: 1,
  			b: 1
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Horizontal_Stripes1547651045669_423_color1: {
  		value: {
  			r: 1,
  			g: 1,
  			b: 1
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Horizontal_Stripes1547651045669_423_color2: {
  		value: {
  			r: 0,
  			g: 0,
  			b: 0
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Horizontal_Stripes1547651045669_423_speed: {
  		value: "0",
  		type: "f",
  		glslType: "float"
  	},
  	Horizontal_Stripes1547651045669_423_multiplicationFactor: {
  		value: "6",
  		type: "f",
  		glslType: "float"
  	},
  	Vertical_2_Color_Graident1547651045681_426_color1: {
  		value: {
  			r: 0,
  			g: 0,
  			b: 0
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Vertical_2_Color_Graident1547651045681_426_color2: {
  		value: {
  			r: 0,
  			g: 0.9764705882352941,
  			b: 0
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Checkerboard1547651045687_429_multiplicationFactor: {
  		value: "12",
  		type: "f",
  		glslType: "float"
  	},
  	brightness: {
  		value: "0.25",
  		type: "f",
  		glslType: "float"
  	},
  	Borg_Hull1547651045698_432_speed: {
  		value: "0.001",
  		type: "f",
  		glslType: "float"
  	},
  	Borg_Hull1547651045698_432_resolution: {
  		value: "1",
  		type: "f",
  		glslType: "float"
  	},
  	Borg_Hull1547651045698_432_color: {
  		value: {
  			r: 1,
  			g: 1,
  			b: 1
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Disco_Dots1547651045724_435_speed: {
  		value: "0.01",
  		type: "f",
  		glslType: "float"
  	},
  	Disco_Dots1547651045724_435_resolution: {
  		value: {
  			x: "12",
  			y: "12",
  			z: 0
  		},
  		type: "v2",
  		glslType: "vec2"
  	},
  	Disco_Dots1547651045724_435_color: {
  		value: {
  			r: 0.5254901960784314,
  			g: 0.9725490196078431,
  			b: 0.6352941176470588
  		},
  		type: "c",
  		glslType: "vec3"
  	}
  };
  var url$3 = "http://shaderfrog.com/app/view/2894";
  var user$3 = {
  	username: "SirFizX",
  	url: "http://shaderfrog.com/app/profile/sirfizx"
  };
  var Green_Dance_Shader = {
  	id: id$3,
  	name: name$4,
  	fragment: fragment$3,
  	vertex: vertex$3,
  	uniforms: uniforms$3,
  	url: url$3,
  	user: user$3
  };

  var id$4 = 2987;
  var name$5 = "Cosmic Shader";
  var fragment$4 = "#define TAU 6.28318530718\n#define MAX_ITER 5\n#define tau 6.2831853\n\n#extension GL_OES_standard_derivatives : enable\n\nprecision highp float;\nprecision highp int;\nuniform vec2 Tiling_Caustic1477531952046_152_resolution;\nuniform vec3 backgroundColor;\nuniform vec3 Tiling_Caustic1477531952046_152_color;\nuniform float Tiling_Caustic1477531952046_152_speed;\nuniform float Tiling_Caustic1477531952046_152_brightness;\nuniform float time;\nuniform float contrast;\nuniform float distortion;\nuniform float Noise_Ripples1477531959288_166_speed;\nuniform vec3 Noise_Ripples1477531959288_166_color;\nuniform float Noise_Ripples1477531959288_166_brightness;\nuniform sampler2D noiseImage;\nuniform vec2 Noise_Ripples1477531959288_166_resolution;\nuniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat3 normalMatrix;\nuniform float highlightIntensity;\nuniform vec3 highlightColor;\nuniform vec3 Wiggly_Improved1477532051339_181_color;\nuniform vec3 Transparent_Glow1477532059126_201_color;\nuniform float Transparent_Glow1477532059126_201_start;\nuniform float Transparent_Glow1477532059126_201_end;\nuniform float Transparent_Glow1477532059126_201_alpha;\nuniform vec3 Glow_Effect1477532183055_216_color;\nuniform float Glow_Effect1477532183055_216_start;\nuniform float Glow_Effect1477532183055_216_end;\nuniform float Glow_Effect1477532183055_216_alpha;\nvarying vec2 Tiling_Caustic1477531952046_152_vUv;\nvarying vec2 Noise_Ripples1477531959288_166_vUv;\nmat2 makem2(in float theta) \n    {\n        float c = cos(theta);\n        float s = sin(theta);\n        return mat2(c, -s, s, c);\n    }\nfloat noise(in vec2 x) \n    {\n        return texture2D(noiseImage, x * .01).x;\n    }\nfloat fbm(in vec2 p) \n    {\n        float z = 2.;\n        float rz = 0.;\n        vec2 bp = p;\n        for (float i = 1.;\n i < 6.0; i++) \n        {\n            rz += abs((noise(p) - 0.5) * 2.0) / z;\n            z = z * 2.;\n            p = p * 2.;\n        }\n        return rz;\n    }\nfloat dualfbm(in vec2 p) \n    {\n        vec2 p2 = p * distortion;\n        vec2 basis = vec2(fbm(p2 - time * Noise_Ripples1477531959288_166_speed * 1.6), fbm(p2 + time * Noise_Ripples1477531959288_166_speed * 1.7));\n        basis = (basis - .5) * .2;\n        p += basis;\n        return fbm(p * makem2(time * Noise_Ripples1477531959288_166_speed * 0.2));\n    }\nvarying vec3 Wiggly_Improved1477532051339_181_vNormal;\nvarying float light;\nvarying vec3 Transparent_Glow1477532059126_201_fPosition;\nvarying vec3 Transparent_Glow1477532059126_201_fNormal;\nvarying vec3 Glow_Effect1477532183055_216_fPosition;\nvarying vec3 Glow_Effect1477532183055_216_fNormal;\nvec4 Tiling_Caustic1477531952046_152_main() \n    {\n        vec4 Tiling_Caustic1477531952046_152_gl_FragColor = vec4(0.0);\n        vec2 uv = Tiling_Caustic1477531952046_152_vUv * Tiling_Caustic1477531952046_152_resolution;\n        vec2 p = mod(uv * TAU, TAU) - 250.0;\n        vec2 i = vec2(p);\n        float c = 1.0;\n        float inten = 0.005;\n        for (int n = 0;\n n < MAX_ITER; n++) \n        {\n            float t = time * Tiling_Caustic1477531952046_152_speed * (1.0 - (3.5 / float(n + 1)));\n            i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));\n            c += 1.0 / length(vec2(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten)));\n        }\n        c /= float(MAX_ITER);\n        c = 1.17 - pow(c, Tiling_Caustic1477531952046_152_brightness);\n        vec3 rgb = vec3(pow(abs(c), 8.0));\n        Tiling_Caustic1477531952046_152_gl_FragColor = vec4(rgb * Tiling_Caustic1477531952046_152_color + backgroundColor, 1.0);\n        return Tiling_Caustic1477531952046_152_gl_FragColor *= 1.0;\n    }\nvec4 Noise_Ripples1477531959288_166_main() \n    {\n        vec4 Noise_Ripples1477531959288_166_gl_FragColor = vec4(0.0);\n        vec2 p = (Noise_Ripples1477531959288_166_vUv.xy - 0.5) * Noise_Ripples1477531959288_166_resolution;\n        float rz = dualfbm(p);\n        vec3 col = (Noise_Ripples1477531959288_166_color / rz) * Noise_Ripples1477531959288_166_brightness;\n        col = ((col - 0.5) * max(contrast, 0.0)) + 0.5;\n        Noise_Ripples1477531959288_166_gl_FragColor = vec4(col, 1.0);\n        return Noise_Ripples1477531959288_166_gl_FragColor *= 1.0;\n    }\nvec4 Wiggly_Improved1477532051339_181_main() \n    {\n        vec4 Wiggly_Improved1477532051339_181_gl_FragColor = vec4(0.0);\n        Wiggly_Improved1477532051339_181_gl_FragColor = vec4(clamp(highlightColor * highlightIntensity * light, 0.0, 1.0), 1.0);\n        return Wiggly_Improved1477532051339_181_gl_FragColor *= 1.0;\n    }\nvec4 Transparent_Glow1477532059126_201_main() \n    {\n        vec4 Transparent_Glow1477532059126_201_gl_FragColor = vec4(0.0);\n        vec3 normal = normalize(Transparent_Glow1477532059126_201_fNormal);\n        vec3 eye = normalize(-Transparent_Glow1477532059126_201_fPosition.xyz);\n        float rim = smoothstep(Transparent_Glow1477532059126_201_start, Transparent_Glow1477532059126_201_end, 1.0 - dot(normal, eye));\n        float value = clamp(rim * Transparent_Glow1477532059126_201_alpha, 0.0, 1.0);\n        Transparent_Glow1477532059126_201_gl_FragColor = vec4(Transparent_Glow1477532059126_201_color * value, value);\n        return Transparent_Glow1477532059126_201_gl_FragColor *= 1.0;\n    }\nvec4 Glow_Effect1477532183055_216_main() \n    {\n        vec4 Glow_Effect1477532183055_216_gl_FragColor = vec4(0.0);\n        vec3 normal = normalize(Glow_Effect1477532183055_216_fNormal);\n        vec3 eye = normalize(-Glow_Effect1477532183055_216_fPosition.xyz);\n        float rim = smoothstep(Glow_Effect1477532183055_216_start, Glow_Effect1477532183055_216_end, 1.0 - dot(normal, eye));\n        Glow_Effect1477532183055_216_gl_FragColor = vec4(clamp(rim, 0.0, 1.0) * Glow_Effect1477532183055_216_alpha * Glow_Effect1477532183055_216_color, 1.0);\n        return Glow_Effect1477532183055_216_gl_FragColor *= 1.0;\n    }\nvoid main() \n    {\n        gl_FragColor = (Glow_Effect1477532183055_216_main() + Noise_Ripples1477531959288_166_main() + Tiling_Caustic1477531952046_152_main() + Wiggly_Improved1477532051339_181_main());    }\n";
  var vertex$4 = "precision highp float;\nprecision highp int;\nuniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 viewMatrix;\nuniform mat3 normalMatrix;\nuniform vec3 cameraPosition;\nuniform float time;\nuniform float Wiggly_Improved1477532051339_181_speed;\nuniform float frequency;\nuniform float amplitude;\nattribute vec3 position;\nattribute vec3 normal;\nattribute vec2 uv;\nattribute vec2 uv2;\nvarying vec3 Tiling_Caustic1477531952046_152_vPosition;\nvarying vec3 Tiling_Caustic1477531952046_152_vNormal;\nvarying vec2 Tiling_Caustic1477531952046_152_vUv;\nvarying vec2 Tiling_Caustic1477531952046_152_vUv2;\nvarying vec3 Noise_Ripples1477531959288_166_vPosition;\nvarying vec3 Noise_Ripples1477531959288_166_vNormal;\nvarying vec2 Noise_Ripples1477531959288_166_vUv;\nvarying vec2 Noise_Ripples1477531959288_166_vUv2;\nvarying vec3 Wiggly_Improved1477532051339_181_vNormal;\nvarying float light;\nvarying vec3 Wiggly_Improved1477532051339_181_vPosition;\nvarying vec3 Transparent_Glow1477532059126_201_fNormal;\nvarying vec3 Transparent_Glow1477532059126_201_fPosition;\nvarying vec3 Glow_Effect1477532183055_216_fNormal;\nvarying vec3 Glow_Effect1477532183055_216_fPosition;\nvec4 Tiling_Caustic1477531952046_152_main() \n    {\n        vec4 Tiling_Caustic1477531952046_152_gl_Position = vec4(0.0);\n        Tiling_Caustic1477531952046_152_vNormal = normal;\n        Tiling_Caustic1477531952046_152_vUv = uv;\n        Tiling_Caustic1477531952046_152_vUv2 = uv2;\n        Tiling_Caustic1477531952046_152_vPosition = position;\n        Tiling_Caustic1477531952046_152_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        return Tiling_Caustic1477531952046_152_gl_Position *= 1.0;\n    }\nvec4 Noise_Ripples1477531959288_166_main() \n    {\n        vec4 Noise_Ripples1477531959288_166_gl_Position = vec4(0.0);\n        Noise_Ripples1477531959288_166_vNormal = normal;\n        Noise_Ripples1477531959288_166_vUv = uv;\n        Noise_Ripples1477531959288_166_vUv2 = uv2;\n        Noise_Ripples1477531959288_166_vPosition = position;\n        Noise_Ripples1477531959288_166_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        return Noise_Ripples1477531959288_166_gl_Position *= 1.0;\n    }\nvec4 Wiggly_Improved1477532051339_181_main() \n    {\n        vec4 Wiggly_Improved1477532051339_181_gl_Position = vec4(0.0);\n        vec3 offset = normalize(vec3(0.0) - position) * (amplitude * sin(Wiggly_Improved1477532051339_181_speed * time + position.y * frequency));\n        vec3 newPosition = position + vec3(offset.x, 0.0, offset.z);\n        light = amplitude * sin(Wiggly_Improved1477532051339_181_speed * time + 1.0 + position.y * frequency);\n        Wiggly_Improved1477532051339_181_vPosition = newPosition;\n        Wiggly_Improved1477532051339_181_gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);\n        return Wiggly_Improved1477532051339_181_gl_Position *= 1.0;\n    }\nvec4 Transparent_Glow1477532059126_201_main() \n    {\n        vec4 Transparent_Glow1477532059126_201_gl_Position = vec4(0.0);\n        Transparent_Glow1477532059126_201_fNormal = normalize(normalMatrix * normal);\n        vec4 pos = modelViewMatrix * vec4(position, 1.0);\n        Transparent_Glow1477532059126_201_fPosition = pos.xyz;\n        Transparent_Glow1477532059126_201_gl_Position = projectionMatrix * pos;\n        return Transparent_Glow1477532059126_201_gl_Position *= 1.0;\n    }\nvec4 Glow_Effect1477532183055_216_main() \n    {\n        vec4 Glow_Effect1477532183055_216_gl_Position = vec4(0.0);\n        Glow_Effect1477532183055_216_fNormal = normalize(normalMatrix * normal);\n        vec4 pos = modelViewMatrix * vec4(position, 1.0);\n        Glow_Effect1477532183055_216_fPosition = pos.xyz;\n        Glow_Effect1477532183055_216_gl_Position = projectionMatrix * pos;\n        return Glow_Effect1477532183055_216_gl_Position *= 1.0;\n    }\nvoid main() \n    {\n        gl_Position = Tiling_Caustic1477531952046_152_main() + Noise_Ripples1477531959288_166_main() + Wiggly_Improved1477532051339_181_main() + Transparent_Glow1477532059126_201_main() + Glow_Effect1477532183055_216_main();    }\n";
  var uniforms$4 = {
  	cameraPosition: {
  		type: "v3",
  		glslType: "vec3"
  	},
  	time: {
  		type: "f",
  		glslType: "float"
  	},
  	backgroundColor: {
  		value: {
  			r: 0.08235294117647059,
  			g: 0.06274509803921569,
  			b: 0.19607843137254902
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Tiling_Caustic1477531952046_152_resolution: {
  		value: {
  			x: 1,
  			y: 1
  		},
  		type: "v2",
  		glslType: "vec2"
  	},
  	Tiling_Caustic1477531952046_152_color: {
  		value: {
  			r: 0.4666666666666667,
  			g: 0.9294117647058824,
  			b: 0.9529411764705882
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Tiling_Caustic1477531952046_152_speed: {
  		value: "0.5",
  		type: "f",
  		glslType: "float"
  	},
  	Tiling_Caustic1477531952046_152_brightness: {
  		value: "1.5",
  		type: "f",
  		glslType: "float"
  	},
  	noiseImage: {
  		value: null,
  		type: "t",
  		glslType: "sampler2D"
  	},
  	distortion: {
  		value: "1",
  		type: "f",
  		glslType: "float"
  	},
  	contrast: {
  		value: "1.4",
  		type: "f",
  		glslType: "float"
  	},
  	Noise_Ripples1477531959288_166_speed: {
  		value: "0.1",
  		type: "f",
  		glslType: "float"
  	},
  	Noise_Ripples1477531959288_166_color: {
  		value: {
  			r: 0.6823529411764706,
  			g: 0.7725490196078432,
  			b: 0.6666666666666666
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Noise_Ripples1477531959288_166_brightness: {
  		value: "0.1",
  		type: "f",
  		glslType: "float"
  	},
  	Noise_Ripples1477531959288_166_resolution: {
  		value: {
  			x: "2",
  			y: "2"
  		},
  		type: "v2",
  		glslType: "vec2"
  	},
  	amplitude: {
  		value: "0.2",
  		type: "f",
  		glslType: "float"
  	},
  	frequency: {
  		value: "2",
  		type: "f",
  		glslType: "float"
  	},
  	highlightIntensity: {
  		value: ".5",
  		type: "f",
  		glslType: "float"
  	},
  	highlightColor: {
  		value: {
  			r: 0.8274509803921568,
  			g: 0.5882352941176471,
  			b: 0.2627450980392157
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Wiggly_Improved1477532051339_181_color: {
  		value: {
  			r: 0,
  			g: 0,
  			b: 0
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Wiggly_Improved1477532051339_181_speed: {
  		value: "1",
  		type: "f",
  		glslType: "float"
  	},
  	Transparent_Glow1477532059126_201_color: {
  		value: {
  			r: 0.9803921568627451,
  			g: 0.9215686274509803,
  			b: 0.596078431372549
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Transparent_Glow1477532059126_201_start: {
  		value: "0.54674743",
  		type: "f",
  		glslType: "float"
  	},
  	Transparent_Glow1477532059126_201_end: {
  		value: "0.44399246",
  		type: "f",
  		glslType: "float"
  	},
  	Transparent_Glow1477532059126_201_alpha: {
  		value: "0.5",
  		type: "f",
  		glslType: "float"
  	},
  	Glow_Effect1477532183055_216_color: {
  		value: {
  			r: 0.9921568627450981,
  			g: 0.7254901960784313,
  			b: 0.3411764705882353
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Glow_Effect1477532183055_216_start: {
  		value: "0",
  		type: "f",
  		glslType: "float"
  	},
  	Glow_Effect1477532183055_216_end: {
  		value: "1.9",
  		type: "f",
  		glslType: "float"
  	},
  	Glow_Effect1477532183055_216_alpha: {
  		value: "2",
  		type: "f",
  		glslType: "float"
  	}
  };
  var url$4 = "http://shaderfrog.com/app/view/2987";
  var user$4 = {
  	username: "SirFizX",
  	url: "http://shaderfrog.com/app/profile/andrewray"
  };
  var Cosmic_Shader = {
  	id: id$4,
  	name: name$5,
  	fragment: fragment$4,
  	vertex: vertex$4,
  	uniforms: uniforms$4,
  	url: url$4,
  	user: user$4
  };

  var id$5 = 138;
  var name$6 = "Cool Tiles Shader";
  var fragment$5 = "precision highp float;\nprecision highp int;\nuniform float time;\nuniform float Flowing_Image_Combination1532324436254_38_speed;\nuniform float resolution;\nuniform sampler2D image1;\nuniform sampler2D image2;\nuniform vec3 Flowing_Image_Combination1532324436254_38_color;\nuniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 viewMatrix;\nuniform mat3 normalMatrix;\nuniform vec3 cameraPosition;\nuniform vec3 lightPosition;\nuniform sampler2D map;\nuniform vec3 diffuseColor;\nuniform vec3 specularColor;\nuniform float shininess;\nuniform vec2 scaleBias;\nuniform float scale;\nuniform float Disco_Ball1532324436329_44_speed;\nuniform vec3 Vignette1532324436351_47_color;\nuniform float intensity;\nuniform float spread;\nuniform float mirrorReflection;\nuniform samplerCube reflectionSampler;\nvarying vec2 Flowing_Image_Combination1532324436254_38_vUv;\nvarying vec3 vPosition;\nvarying vec3 Parallax_Mapping1532324436298_41_vNormal;\nvarying vec2 Parallax_Mapping1532324436298_41_vUv;\nvarying vec2 vUv2;\nvarying vec3 tsPosition;\nvarying vec3 tsCameraPosition;\nvarying vec3 tsLightSource;\nvarying vec3 Disco_Ball1532324436329_44_vNormal;\nvarying vec2 Disco_Ball1532324436329_44_vUv;\nfloat rand(in vec2 p) \n    {\n        return abs(fract(sin(p.x * 95325.328 + p.y * -48674.077) + cos(p.x * -46738.322 + p.y * 76485.077) + time * Disco_Ball1532324436329_44_speed) - .5) + .5;\n    }\nvarying vec2 Vignette1532324436351_47_vUv;\nvarying vec3 vReflect;\nvec4 Flowing_Image_Combination1532324436254_38_main() \n    {\n        vec4 Flowing_Image_Combination1532324436254_38_gl_FragColor = vec4(0.0);\n        vec2 uv = Flowing_Image_Combination1532324436254_38_vUv.xy * resolution;\n        vec4 texCol = vec4(texture2D(image1, uv));\n        mat3 tfm;\n        tfm[0] = vec3(texCol.z, 0.0, 0);\n        tfm[1] = vec3(0.0, texCol.y, 0);\n        tfm[2] = vec3(0, 0, 1.0);\n        vec2 muv = (vec3(uv, 1.0) * tfm).xy + time * Flowing_Image_Combination1532324436254_38_speed;\n        texCol = vec4(vec3(texture2D(image2, muv)) * Flowing_Image_Combination1532324436254_38_color, 1.0);\n        Flowing_Image_Combination1532324436254_38_gl_FragColor = texCol;\n        return Flowing_Image_Combination1532324436254_38_gl_FragColor *= 0.6;\n    }\nvec4 Parallax_Mapping1532324436298_41_main() \n    {\n        vec4 Parallax_Mapping1532324436298_41_gl_FragColor = vec4(0.0);\n        float height = texture2D(map, Parallax_Mapping1532324436298_41_vUv).a;\n        float v = height * scaleBias.r - scaleBias.g;\n        vec3 eye = normalize(tsCameraPosition);\n        vec2 newCoords = Parallax_Mapping1532324436298_41_vUv + (eye.xy * v);\n        vec3 color = vec3(0.0);\n        vec3 normal = texture2D(map, newCoords).rgb * 2.0 - 1.0;\n        vec3 viewVector = normalize(tsCameraPosition - tsPosition);\n        vec3 lightVector = normalize(tsLightSource - tsPosition);\n        float nxDir = max(0.0, dot(normal, lightVector));\n        float specularPower = 0.0;\n        if (nxDir != 0.0) \n        {\n            vec3 halfVector = normalize(lightVector + viewVector);\n            float nxHalf = max(0.0, dot(normal, halfVector));\n            specularPower = pow(nxHalf, shininess);\n        }\n         vec3 specular = specularColor * specularPower;\n        Parallax_Mapping1532324436298_41_gl_FragColor = vec4((diffuseColor * nxDir) + specular, 1.0);\n        return Parallax_Mapping1532324436298_41_gl_FragColor *= 0.9;\n    }\nvec4 Disco_Ball1532324436329_44_main(void) \n    {\n        vec4 Disco_Ball1532324436329_44_gl_FragColor = vec4(0.0);\n        vec2 position = (Disco_Ball1532324436329_44_vUv.xy) * scale;\n        vec3 color = vec3(rand(vec2(floor(position.x), floor(position.y))), rand(vec2(floor(position.x), floor(position.x))), rand(vec2(floor(position.x * .5), floor(position.y * .5))));\n        float scale = 1. - pow(pow((mod(position.x, 1.) - .5), 2.) + pow((mod(position.y, 1.) - .5), 2.), .7);\n        Disco_Ball1532324436329_44_gl_FragColor = vec4(color * scale, 1.);\n        return Disco_Ball1532324436329_44_gl_FragColor *= 0.1;\n    }\nvec4 Vignette1532324436351_47_main() \n    {\n        vec4 Vignette1532324436351_47_gl_FragColor = vec4(0.0);\n        float vignette = Vignette1532324436351_47_vUv.y * Vignette1532324436351_47_vUv.x * (1. - Vignette1532324436351_47_vUv.x) * (1. - Vignette1532324436351_47_vUv.y) * spread;\n        vec3 multiplier = 1.0 - (vignette * Vignette1532324436351_47_color * intensity);\n        Vignette1532324436351_47_gl_FragColor = vec4(clamp(Vignette1532324436351_47_color * multiplier, 0.0, 1.0), multiplier);\n        return Vignette1532324436351_47_gl_FragColor *= 0.2;\n    }\nvec4 Reflection_Cube_Map1532324436362_50_main() \n    {\n        vec4 Reflection_Cube_Map1532324436362_50_gl_FragColor = vec4(0.0);\n        vec4 cubeColor = textureCube(reflectionSampler, vec3(mirrorReflection * vReflect.x, vReflect.yz));\n        cubeColor.w = 1.0;\n        Reflection_Cube_Map1532324436362_50_gl_FragColor = cubeColor;\n        return Reflection_Cube_Map1532324436362_50_gl_FragColor *= 0.3;\n    }\nvoid main() \n    {\n        gl_FragColor = (Flowing_Image_Combination1532324436254_38_main() + Parallax_Mapping1532324436298_41_main() + Disco_Ball1532324436329_44_main() + Vignette1532324436351_47_main() + Reflection_Cube_Map1532324436362_50_main());    }\n";
  var vertex$5 = "precision highp float;\nprecision highp int;\nuniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 viewMatrix;\nuniform mat3 normalMatrix;\nuniform vec3 lightPosition;\nuniform vec3 cameraPosition;\nuniform float time;\nattribute vec3 position;\nattribute vec3 normal;\nattribute vec2 uv;\nattribute vec2 uv2;\nvarying vec2 Flowing_Image_Combination1532324436254_38_vUv;\nattribute vec4 tangent;\nvarying vec3 vPosition;\nvarying vec3 Parallax_Mapping1532324436298_41_vNormal;\nvarying vec2 Parallax_Mapping1532324436298_41_vUv;\nvarying vec2 vUv2;\nvarying vec3 vTangent;\nvarying vec3 vBinormal;\nvarying vec3 tsPosition;\nvarying vec3 tsCameraPosition;\nvarying vec3 tsLightSource;\nvarying vec2 Disco_Ball1532324436329_44_vUv;\nvarying vec3 Disco_Ball1532324436329_44_vNormal;\nvarying vec2 Vignette1532324436351_47_vUv;\nvarying vec3 vReflect;\nvec4 Flowing_Image_Combination1532324436254_38_main() \n    {\n        vec4 Flowing_Image_Combination1532324436254_38_gl_Position = vec4(0.0);\n        Flowing_Image_Combination1532324436254_38_vUv = uv;\n        Flowing_Image_Combination1532324436254_38_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        return Flowing_Image_Combination1532324436254_38_gl_Position *= 0.6;\n    }\nvec4 Parallax_Mapping1532324436298_41_main(void) \n    {\n        vec4 Parallax_Mapping1532324436298_41_gl_Position = vec4(0.0);\n        Parallax_Mapping1532324436298_41_vUv = uv;\n        vPosition = position;\n        Parallax_Mapping1532324436298_41_vNormal = normalize(normal);\n        vTangent = normalize(tangent.xyz);\n        vBinormal = normalize(cross(Parallax_Mapping1532324436298_41_vNormal, vTangent) * tangent.w);\n        mat3 TBNMatrix = mat3(vTangent, vBinormal, Parallax_Mapping1532324436298_41_vNormal);\n        tsPosition = position * TBNMatrix;\n        tsCameraPosition = cameraPosition * TBNMatrix;\n        tsLightSource = lightPosition * TBNMatrix;\n        Parallax_Mapping1532324436298_41_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        return Parallax_Mapping1532324436298_41_gl_Position *= 0.9;\n    }\nvec4 Disco_Ball1532324436329_44_main() \n    {\n        vec4 Disco_Ball1532324436329_44_gl_Position = vec4(0.0);\n        Disco_Ball1532324436329_44_vNormal = normal;\n        Disco_Ball1532324436329_44_vUv = uv;\n        Disco_Ball1532324436329_44_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        return Disco_Ball1532324436329_44_gl_Position *= 0.1;\n    }\nvec4 Vignette1532324436351_47_main() \n    {\n        vec4 Vignette1532324436351_47_gl_Position = vec4(0.0);\n        Vignette1532324436351_47_vUv = uv;\n        Vignette1532324436351_47_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        return Vignette1532324436351_47_gl_Position *= 0.2;\n    }\nvec4 Reflection_Cube_Map1532324436362_50_main() \n    {\n        vec4 Reflection_Cube_Map1532324436362_50_gl_Position = vec4(0.0);\n        vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;\n        vec3 cameraToVertex = normalize(worldPosition - cameraPosition);\n        vec3 worldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);\n        vReflect = reflect(cameraToVertex, worldNormal);\n        Reflection_Cube_Map1532324436362_50_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        return Reflection_Cube_Map1532324436362_50_gl_Position *= 0.3;\n    }\nvoid main() \n    {\n        gl_Position = Flowing_Image_Combination1532324436254_38_main() + Parallax_Mapping1532324436298_41_main() + Disco_Ball1532324436329_44_main() + Vignette1532324436351_47_main() + Reflection_Cube_Map1532324436362_50_main();    }\n";
  var uniforms$5 = {
  	resolution: {
  		value: "1",
  		type: "f",
  		glslType: "float"
  	},
  	image1: {
  		value: null,
  		type: "t",
  		glslType: "sampler2D"
  	},
  	image2: {
  		value: null,
  		type: "t",
  		glslType: "sampler2D"
  	},
  	time: {
  		type: "f",
  		glslType: "float"
  	},
  	Flowing_Image_Combination1532324436254_38_speed: {
  		value: "0.05",
  		type: "f",
  		glslType: "float"
  	},
  	Flowing_Image_Combination1532324436254_38_color: {
  		value: {
  			r: 1,
  			g: "1",
  			b: "1"
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	map: {
  		value: null,
  		type: "t",
  		glslType: "sampler2D"
  	},
  	diffuseColor: {
  		value: {
  			r: 0.2235294117647059,
  			g: 0.2235294117647059,
  			b: 0.2235294117647059
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	specularColor: {
  		value: {
  			r: 1,
  			g: 1,
  			b: 1
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	shininess: {
  		value: "10",
  		type: "f",
  		glslType: "float"
  	},
  	scaleBias: {
  		value: {
  			x: "0.04",
  			y: "0.001",
  			z: 0
  		},
  		type: "v2",
  		glslType: "vec2"
  	},
  	Parallax_Mapping1532324436298_41_lightPosition: {
  		value: {
  			x: -0.04058137118438604,
  			y: 0.3281411389717793,
  			z: 2.4780388506290807
  		},
  		type: "v3",
  		glslType: "vec3"
  	},
  	scale: {
  		value: "4",
  		type: "f",
  		glslType: "float"
  	},
  	Disco_Ball1532324436329_44_speed: {
  		value: "1",
  		type: "f",
  		glslType: "float"
  	},
  	intensity: {
  		value: "0.5",
  		type: "f",
  		glslType: "float"
  	},
  	spread: {
  		value: "100",
  		type: "f",
  		glslType: "float"
  	},
  	Vignette1532324436351_47_color: {
  		value: {
  			r: 0.8980392156862745,
  			g: 0.9607843137254902,
  			b: 0.9921568627450981
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	mirrorReflection: {
  		value: "1",
  		type: "f",
  		glslType: "float"
  	},
  	reflectionSampler: {
  		value: null,
  		type: "t",
  		glslType: "samplerCube"
  	}
  };
  var url$5 = "http://shaderfrog.com/app/view/138";
  var user$5 = {
  	username: "andrewray",
  	url: "http://shaderfrog.com/app/profile/andrewray"
  };
  var Cool_Tiles_Shader = {
  	id: id$5,
  	name: name$6,
  	fragment: fragment$5,
  	vertex: vertex$5,
  	uniforms: uniforms$5,
  	url: url$5,
  	user: user$5
  };

  var id$6 = 3033;
  var name$7 = "Disco Shader";
  var fragment$6 = "precision highp float;\nprecision highp int;\nuniform float time;\nuniform float scale;\nuniform float speed;\nvarying vec3 vNormal;\nvarying vec2 vUv;\nfloat rand(in vec2 p) \n    {\n        return abs(fract(sin(p.x * 95325.328 + p.y * -48674.077) + cos(p.x * -46738.322 + p.y * 76485.077) + time * speed) - .5) + .5;\n    }\nvec4 Disco_Ball1551665981578_213_main(void) \n    {\n        vec4 Disco_Ball1551665981578_213_gl_FragColor = vec4(0.0);\n        vec2 position = (vUv.xy) * scale;\n        vec3 color = vec3(rand(vec2(floor(position.x), floor(position.y))), rand(vec2(floor(position.x), floor(position.x))), rand(vec2(floor(position.x * .5), floor(position.y * .5))));\n        float scale = 1. - pow(pow((mod(position.x, 1.) - .5), 2.) + pow((mod(position.y, 1.) - .5), 2.), .7);\n        Disco_Ball1551665981578_213_gl_FragColor = vec4(color * scale, 1.);\n        return Disco_Ball1551665981578_213_gl_FragColor *= 1.0;\n    }\nvoid main() \n    {\n        gl_FragColor = Disco_Ball1551665981578_213_main();    }\n";
  var vertex$6 = "precision highp float;\nprecision highp int;\nuniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nattribute vec3 position;\nattribute vec3 normal;\nattribute vec2 uv;\nvarying vec2 vUv;\nvarying vec3 vNormal;\nvec4 Disco_Ball1551665981578_213_main() \n    {\n        vec4 Disco_Ball1551665981578_213_gl_Position = vec4(0.0);\n        vNormal = normal;\n        vUv = uv;\n        Disco_Ball1551665981578_213_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        return Disco_Ball1551665981578_213_gl_Position *= 1.0;\n    }\nvoid main() \n    {\n        gl_Position = Disco_Ball1551665981578_213_main();    }\n";
  var uniforms$6 = {
  	time: {
  		type: "f",
  		glslType: "float"
  	},
  	scale: {
  		value: "30",
  		type: "f",
  		glslType: "float"
  	},
  	speed: {
  		value: "1",
  		type: "f",
  		glslType: "float"
  	}
  };
  var url$6 = "http://shaderfrog.com/app/view/3033";
  var user$6 = {
  	username: "SirFizX",
  	url: "http://shaderfrog.com/app/profile/andrewray"
  };
  var Disco_Shader = {
  	id: id$6,
  	name: name$7,
  	fragment: fragment$6,
  	vertex: vertex$6,
  	uniforms: uniforms$6,
  	url: url$6,
  	user: user$6
  };

  var id$7 = 3053;
  var name$8 = "Marching Ants Shader";
  var fragment$7 = "precision highp float;\nprecision highp int;\nuniform float edgeWidth;\nuniform float sharpness;\nuniform float antSize;\nuniform float antSpeed;\nuniform float time;\nuniform vec3 color;\nvarying vec2 vUv;\nvec4 Marching_Ants_UV_Based_Border_Edge_Outline1551694606526_1465_main() \n    {\n        vec4 Marching_Ants_UV_Based_Border_Edge_Outline1551694606526_1465_gl_FragColor = vec4(0.0);\n        vec2 borderUv = abs((vUv - 0.5) * 2.0);\n        float leftRight = clamp((borderUv.x - (1.0 - edgeWidth)) * sharpness, 0.0, 1.0);\n        float upDown = clamp((borderUv.y - (1.0 - edgeWidth)) * sharpness, 0.0, 1.0);\n        vec2 antUv = vUv * antSize;\n        float antOffset = time * antSpeed;\n        if (mod(floor(antUv.x + antOffset), 2.0) != 1.0) \n        {\n            upDown = 0.0;\n        }\n         if (mod(floor(antUv.y + antOffset), 2.0) != 1.0) \n        {\n            leftRight = 0.0;\n        }\n         float alpha = clamp(leftRight + upDown, 0.0, 1.0);\n        Marching_Ants_UV_Based_Border_Edge_Outline1551694606526_1465_gl_FragColor = vec4(color * alpha, alpha);\n        return Marching_Ants_UV_Based_Border_Edge_Outline1551694606526_1465_gl_FragColor *= 1.0;\n    }\nvoid main() \n    {\n        gl_FragColor = Marching_Ants_UV_Based_Border_Edge_Outline1551694606526_1465_main();    }\n";
  var vertex$7 = "precision highp float;\nprecision highp int;\nuniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 viewMatrix;\nuniform mat3 normalMatrix;\nattribute vec3 position;\nattribute vec3 normal;\nattribute vec2 uv;\nattribute vec2 uv2;\nvarying vec2 vUv;\nvec4 Marching_Ants_UV_Based_Border_Edge_Outline1551694606526_1465_main() \n    {\n        vec4 Marching_Ants_UV_Based_Border_Edge_Outline1551694606526_1465_gl_Position = vec4(0.0);\n        vUv = uv;\n        Marching_Ants_UV_Based_Border_Edge_Outline1551694606526_1465_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        return Marching_Ants_UV_Based_Border_Edge_Outline1551694606526_1465_gl_Position *= 1.0;\n    }\nvoid main() \n    {\n        gl_Position = Marching_Ants_UV_Based_Border_Edge_Outline1551694606526_1465_main();    }\n";
  var uniforms$7 = {
  	color: {
  		value: {
  			r: "1",
  			g: "1",
  			b: "1"
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	edgeWidth: {
  		value: "0.1",
  		type: "f",
  		glslType: "float"
  	},
  	sharpness: {
  		value: "100",
  		type: "f",
  		glslType: "float"
  	},
  	antSize: {
  		value: "10",
  		type: "f",
  		glslType: "float"
  	},
  	antSpeed: {
  		value: "1",
  		type: "f",
  		glslType: "float"
  	},
  	time: {
  		type: "f",
  		glslType: "float"
  	}
  };
  var url$7 = "http://shaderfrog.com/app/view/3053";
  var user$7 = {
  	username: "SirFizX",
  	url: "http://shaderfrog.com/app/profile/andrewray"
  };
  var Marching_Ants_Shader = {
  	id: id$7,
  	name: name$8,
  	fragment: fragment$7,
  	vertex: vertex$7,
  	uniforms: uniforms$7,
  	url: url$7,
  	user: user$7
  };

  var id$8 = 3060;
  var name$9 = "Goo Shader";
  var fragment$8 = "precision highp float;\nprecision highp int;\nuniform vec3 color;\nuniform float time;\nuniform float Configurable_Oil_Spill1525321525720_28_speed;\nuniform vec3 color1;\nuniform vec3 color2;\nuniform vec3 color3;\nuniform vec3 color4;\nvarying float vNoise;\nvarying vec2 vUv;\nvarying vec3 vPosition;\nvarying vec3 vNormal;\nfloat rand(vec2 n) \n    {\n        return fract(cos(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);\n    }\nfloat noise(vec2 n) \n    {\n        const vec2 d = vec2(0.0, 1.0);\n        vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));\n        return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);\n    }\nfloat fbm(vec2 n) \n    {\n        float total = 0.0, amplitude = 1.0;\n        for (int i = 0;\n i < 7; i++) \n        {\n            total += noise(n) * amplitude;\n            n += n;\n            amplitude *= 0.5;\n        }\n        return total;\n    }\nvec4 Big_Wiggles1525321525655_25_main() \n    {\n        vec4 Big_Wiggles1525321525655_25_gl_FragColor = vec4(0.0);\n        Big_Wiggles1525321525655_25_gl_FragColor = vec4(color * vNoise, 1.0);\n        return Big_Wiggles1525321525655_25_gl_FragColor *= 1.0;\n    }\nvec4 Configurable_Oil_Spill1525321525720_28_main() \n    {\n        vec4 Configurable_Oil_Spill1525321525720_28_gl_FragColor = vec4(0.0);\n        const vec3 c5 = vec3(0.1);\n        const vec3 c6 = vec3(0.9);\n        vec2 p = vUv.xy * 8.0;\n        float timed = time * Configurable_Oil_Spill1525321525720_28_speed;\n        float q = fbm(p - timed * 0.1);\n        vec2 r = vec2(fbm(p + q + timed * 0.7 - p.x - p.y), fbm(p + q - timed * 0.4));\n        vec3 c = mix(color1, color2, fbm(p + r)) + mix(color3, color4, r.x) - mix(c5, c6, r.y);\n        Configurable_Oil_Spill1525321525720_28_gl_FragColor = vec4(c * cos(1.57 * vUv.y), 1.0);\n        return Configurable_Oil_Spill1525321525720_28_gl_FragColor *= 1.0;\n    }\nvoid main() \n    {\n        gl_FragColor = (Big_Wiggles1525321525655_25_main() + Configurable_Oil_Spill1525321525720_28_main());    }\n";
  var vertex$8 = "precision highp float;\nprecision highp int;\nuniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 viewMatrix;\nuniform mat3 normalMatrix;\nuniform float scale;\nuniform float displacement;\nuniform float time;\nuniform float Big_Wiggles1525321525655_25_speed;\nattribute vec3 position;\nattribute vec3 normal;\nattribute vec2 uv;\nattribute vec2 uv2;\nvarying float vNoise;\nvec3 mod289(vec3 x) \n    {\n        return x - floor(x * (1.0 / 289.0)) * 289.0;\n    }\nvec4 mod289(vec4 x) \n    {\n        return x - floor(x * (1.0 / 289.0)) * 289.0;\n    }\nvec4 permute(vec4 x) \n    {\n        return mod289(((x * 34.0) + 1.0) * x);\n    }\nvec4 taylorInvSqrt(vec4 r) \n    {\n        return 1.79284291400159 - 0.85373472095314 * r;\n    }\nvec3 fade(vec3 t) \n    {\n        return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);\n    }\nfloat cnoise(vec3 P) \n    {\n        vec3 Pi0 = floor(P);\n        vec3 Pi1 = Pi0 + vec3(1.0);\n        Pi0 = mod289(Pi0);\n        Pi1 = mod289(Pi1);\n        vec3 Pf0 = fract(P);\n        vec3 Pf1 = Pf0 - vec3(1.0);\n        vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n        vec4 iy = vec4(Pi0.yy, Pi1.yy);\n        vec4 iz0 = Pi0.zzzz;\n        vec4 iz1 = Pi1.zzzz;\n        vec4 ixy = permute(permute(ix) + iy);\n        vec4 ixy0 = permute(ixy + iz0);\n        vec4 ixy1 = permute(ixy + iz1);\n        vec4 gx0 = ixy0 * (1.0 / 7.0);\n        vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\n        gx0 = fract(gx0);\n        vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\n        vec4 sz0 = step(gz0, vec4(0.0));\n        gx0 -= sz0 * (step(0.0, gx0) - 0.5);\n        gy0 -= sz0 * (step(0.0, gy0) - 0.5);\n        vec4 gx1 = ixy1 * (1.0 / 7.0);\n        vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\n        gx1 = fract(gx1);\n        vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\n        vec4 sz1 = step(gz1, vec4(0.0));\n        gx1 -= sz1 * (step(0.0, gx1) - 0.5);\n        gy1 -= sz1 * (step(0.0, gy1) - 0.5);\n        vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);\n        vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);\n        vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);\n        vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);\n        vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);\n        vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);\n        vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);\n        vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);\n        vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\n        g000 *= norm0.x;\n        g010 *= norm0.y;\n        g100 *= norm0.z;\n        g110 *= norm0.w;\n        vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\n        g001 *= norm1.x;\n        g011 *= norm1.y;\n        g101 *= norm1.z;\n        g111 *= norm1.w;\n        float n000 = dot(g000, Pf0);\n        float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\n        float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\n        float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\n        float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\n        float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\n        float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\n        float n111 = dot(g111, Pf1);\n        vec3 fade_xyz = fade(Pf0);\n        vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\n        vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\n        float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\n        return 2.2 * n_xyz;\n    }\nvarying vec2 vUv;\nvarying vec3 vPosition;\nvarying vec3 vNormal;\nvec4 Big_Wiggles1525321525655_25_main() \n    {\n        vec4 Big_Wiggles1525321525655_25_gl_Position = vec4(0.0);\n        vNoise = cnoise(normalize(position) * scale + (time * Big_Wiggles1525321525655_25_speed));\n        vec3 pos = position + normal * vNoise * vec3(displacement);\n        Big_Wiggles1525321525655_25_gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);\n        return Big_Wiggles1525321525655_25_gl_Position *= 1.0;\n    }\nvec4 Configurable_Oil_Spill1525321525720_28_main() \n    {\n        vec4 Configurable_Oil_Spill1525321525720_28_gl_Position = vec4(0.0);\n        vUv = uv;\n        vPosition = position;\n        vNormal = normal;\n        Configurable_Oil_Spill1525321525720_28_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        return Configurable_Oil_Spill1525321525720_28_gl_Position *= 1.0;\n    }\nvoid main() \n    {\n        gl_Position = Big_Wiggles1525321525655_25_main() + Configurable_Oil_Spill1525321525720_28_main();    }\n";
  var uniforms$8 = {
  	scale: {
  		value: ".8",
  		type: "f",
  		glslType: "float"
  	},
  	displacement: {
  		value: ".5",
  		type: "f",
  		glslType: "float"
  	},
  	time: {
  		type: "f",
  		glslType: "float"
  	},
  	Big_Wiggles1525321525655_25_speed: {
  		value: ".3",
  		type: "f",
  		glslType: "float"
  	},
  	color: {
  		value: {
  			r: ".3",
  			g: 0,
  			b: 0
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	color1: {
  		value: {
  			r: ".4",
  			g: ".1",
  			b: ".2"
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	color2: {
  		value: {
  			r: ".5",
  			g: "1",
  			b: ".5"
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	color3: {
  		value: {
  			r: ".2",
  			g: ".9",
  			b: 0
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	color4: {
  		value: {
  			r: "1.1",
  			g: "1.1",
  			b: "2"
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Configurable_Oil_Spill1525321525720_28_speed: {
  		value: ".4",
  		type: "f",
  		glslType: "float"
  	}
  };
  var url$8 = "http://shaderfrog.com/app/view/3060";
  var user$8 = {
  	username: "SirFizX",
  	url: "http://shaderfrog.com/app/profile/andrewray"
  };
  var Goo_Shader = {
  	id: id$8,
  	name: name$9,
  	fragment: fragment$8,
  	vertex: vertex$8,
  	uniforms: uniforms$8,
  	url: url$8,
  	user: user$8
  };

  var id$9 = 3055;
  var name$a = "Psycho Shader";
  var fragment$9 = "precision highp float;\nprecision highp int;\nuniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 viewMatrix;\nuniform mat3 normalMatrix;\nuniform vec3 cameraPosition;\nuniform float time;\nuniform vec2 Randomise_Fractal;\nuniform float NUM_SIDES;\nvarying vec3 vPosition;\nvarying vec3 vNormal;\nvarying vec2 vUv;\nvarying vec2 vUv2;\nconst float PI = 3.14159265359;\nfloat KA = PI / NUM_SIDES;\nvoid koleidoscope(inout vec2 uv) \n    {\n        float angle = atan(uv.y, uv.x);\n        angle = mod(angle, 2.0 * KA);\n        angle = abs(angle - KA);\n        angle += 0.1 * time;\n        float d = length(uv);\n        uv = d * vec2(cos(angle), sin(angle));\n    }\nvoid smallKoleidoscope(inout vec2 uv) \n    {\n        float angle = abs(mod(atan(uv.y, uv.x), 2.0 * KA) - KA) + 0.1 * time;\n        uv = length(uv) * vec2(cos(angle), sin(angle));\n    }\nvec4 Kaleidoscope_Fractal_Shader1551694817060_1634_main() \n    {\n        vec4 Kaleidoscope_Fractal_Shader1551694817060_1634_gl_FragColor = vec4(0.0);\n        vec2 uv = 12.0 * (2.0 * vUv.xy - 1.0);\n        smallKoleidoscope(uv);\n        vec3 p = vec3(uv, Randomise_Fractal.x);\n        for (int i = 0;\n i < 44; i++) p.xzy = vec3(1.3, 0.999, 0.678) * abs((abs(p) / dot(p, p) - vec3(1.0, 1.02, Randomise_Fractal.y * 0.4)));\n        Kaleidoscope_Fractal_Shader1551694817060_1634_gl_FragColor = vec4(p, 1.0);\n        return Kaleidoscope_Fractal_Shader1551694817060_1634_gl_FragColor *= 1.0;\n    }\nvoid main() \n    {\n        gl_FragColor = Kaleidoscope_Fractal_Shader1551694817060_1634_main();    }\n";
  var vertex$9 = "precision highp float;\nprecision highp int;\nuniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 viewMatrix;\nuniform mat3 normalMatrix;\nuniform vec3 cameraPosition;\nuniform float time;\nattribute vec3 position;\nattribute vec3 normal;\nattribute vec2 uv;\nattribute vec2 uv2;\nvarying vec3 vPosition;\nvarying vec3 vNormal;\nvarying vec2 vUv;\nvarying vec2 vUv2;\nvec4 Kaleidoscope_Fractal_Shader1551694817060_1634_main() \n    {\n        vec4 Kaleidoscope_Fractal_Shader1551694817060_1634_gl_Position = vec4(0.0);\n        vNormal = normal;\n        vUv = uv;\n        vUv2 = uv2;\n        vPosition = position;\n        Kaleidoscope_Fractal_Shader1551694817060_1634_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        return Kaleidoscope_Fractal_Shader1551694817060_1634_gl_Position *= 1.0;\n    }\nvoid main() \n    {\n        gl_Position = Kaleidoscope_Fractal_Shader1551694817060_1634_main();    }\n";
  var uniforms$9 = {
  	cameraPosition: {
  		type: "v3",
  		glslType: "vec3"
  	},
  	time: {
  		type: "f",
  		glslType: "float"
  	},
  	Randomise_Fractal: {
  		value: {
  			x: 0.5076923076923077,
  			y: 0.7076923076923077
  		},
  		type: "v2",
  		glslType: "vec2"
  	},
  	NUM_SIDES: {
  		value: "12",
  		type: "f",
  		glslType: "float"
  	}
  };
  var url$9 = "http://shaderfrog.com/app/view/3055";
  var user$9 = {
  	username: "SirFizX",
  	url: "http://shaderfrog.com/app/profile/andrewray"
  };
  var Psycho_Shader = {
  	id: id$9,
  	name: name$a,
  	fragment: fragment$9,
  	vertex: vertex$9,
  	uniforms: uniforms$9,
  	url: url$9,
  	user: user$9
  };

  var id$a = 3301;
  var name$b = "Ova Shader";
  var fragment$a = "precision highp float;\nprecision highp int;\nuniform float time;\nuniform vec3 color1;\nuniform vec3 color2;\nvarying vec3 vPosition;\nvarying float vJitter;\nvec3 permute(vec3 x) \n    {\n        return mod((34.0 * x + 1.0) * x, 289.0);\n    }\nvec3 dist(vec3 x, vec3 y, vec3 z) \n    {\n        return x * x + y * y + z * z;\n    }\nvec2 worley(vec3 P, float jitter) \n    {\n        float K = 0.142857142857;\n        float Ko = 0.428571428571;\n        float K2 = 0.020408163265306;\n        float Kz = 0.166666666667;\n        float Kzo = 0.416666666667;\n        vec3 Pi = mod(floor(P), 289.0);\n        vec3 Pf = fract(P) - 0.5;\n        vec3 Pfx = Pf.x + vec3(1.0, 0.0, -1.0);\n        vec3 Pfy = Pf.y + vec3(1.0, 0.0, -1.0);\n        vec3 Pfz = Pf.z + vec3(1.0, 0.0, -1.0);\n        vec3 p = permute(Pi.x + vec3(-1.0, 0.0, 1.0));\n        vec3 p1 = permute(p + Pi.y - 1.0);\n        vec3 p2 = permute(p + Pi.y);\n        vec3 p3 = permute(p + Pi.y + 1.0);\n        vec3 p11 = permute(p1 + Pi.z - 1.0);\n        vec3 p12 = permute(p1 + Pi.z);\n        vec3 p13 = permute(p1 + Pi.z + 1.0);\n        vec3 p21 = permute(p2 + Pi.z - 1.0);\n        vec3 p22 = permute(p2 + Pi.z);\n        vec3 p23 = permute(p2 + Pi.z + 1.0);\n        vec3 p31 = permute(p3 + Pi.z - 1.0);\n        vec3 p32 = permute(p3 + Pi.z);\n        vec3 p33 = permute(p3 + Pi.z + 1.0);\n        vec3 ox11 = fract(p11 * K) - Ko;\n        vec3 oy11 = mod(floor(p11 * K), 7.0) * K - Ko;\n        vec3 oz11 = floor(p11 * K2) * Kz - Kzo;\n        vec3 ox12 = fract(p12 * K) - Ko;\n        vec3 oy12 = mod(floor(p12 * K), 7.0) * K - Ko;\n        vec3 oz12 = floor(p12 * K2) * Kz - Kzo;\n        vec3 ox13 = fract(p13 * K) - Ko;\n        vec3 oy13 = mod(floor(p13 * K), 7.0) * K - Ko;\n        vec3 oz13 = floor(p13 * K2) * Kz - Kzo;\n        vec3 ox21 = fract(p21 * K) - Ko;\n        vec3 oy21 = mod(floor(p21 * K), 7.0) * K - Ko;\n        vec3 oz21 = floor(p21 * K2) * Kz - Kzo;\n        vec3 ox22 = fract(p22 * K) - Ko;\n        vec3 oy22 = mod(floor(p22 * K), 7.0) * K - Ko;\n        vec3 oz22 = floor(p22 * K2) * Kz - Kzo;\n        vec3 ox23 = fract(p23 * K) - Ko;\n        vec3 oy23 = mod(floor(p23 * K), 7.0) * K - Ko;\n        vec3 oz23 = floor(p23 * K2) * Kz - Kzo;\n        vec3 ox31 = fract(p31 * K) - Ko;\n        vec3 oy31 = mod(floor(p31 * K), 7.0) * K - Ko;\n        vec3 oz31 = floor(p31 * K2) * Kz - Kzo;\n        vec3 ox32 = fract(p32 * K) - Ko;\n        vec3 oy32 = mod(floor(p32 * K), 7.0) * K - Ko;\n        vec3 oz32 = floor(p32 * K2) * Kz - Kzo;\n        vec3 ox33 = fract(p33 * K) - Ko;\n        vec3 oy33 = mod(floor(p33 * K), 7.0) * K - Ko;\n        vec3 oz33 = floor(p33 * K2) * Kz - Kzo;\n        vec3 dx11 = Pfx + jitter * ox11;\n        vec3 dy11 = Pfy.x + jitter * oy11;\n        vec3 dz11 = Pfz.x + jitter * oz11;\n        vec3 dx12 = Pfx + jitter * ox12;\n        vec3 dy12 = Pfy.x + jitter * oy12;\n        vec3 dz12 = Pfz.y + jitter * oz12;\n        vec3 dx13 = Pfx + jitter * ox13;\n        vec3 dy13 = Pfy.x + jitter * oy13;\n        vec3 dz13 = Pfz.z + jitter * oz13;\n        vec3 dx21 = Pfx + jitter * ox21;\n        vec3 dy21 = Pfy.y + jitter * oy21;\n        vec3 dz21 = Pfz.x + jitter * oz21;\n        vec3 dx22 = Pfx + jitter * ox22;\n        vec3 dy22 = Pfy.y + jitter * oy22;\n        vec3 dz22 = Pfz.y + jitter * oz22;\n        vec3 dx23 = Pfx + jitter * ox23;\n        vec3 dy23 = Pfy.y + jitter * oy23;\n        vec3 dz23 = Pfz.z + jitter * oz23;\n        vec3 dx31 = Pfx + jitter * ox31;\n        vec3 dy31 = Pfy.z + jitter * oy31;\n        vec3 dz31 = Pfz.x + jitter * oz31;\n        vec3 dx32 = Pfx + jitter * ox32;\n        vec3 dy32 = Pfy.z + jitter * oy32;\n        vec3 dz32 = Pfz.y + jitter * oz32;\n        vec3 dx33 = Pfx + jitter * ox33;\n        vec3 dy33 = Pfy.z + jitter * oy33;\n        vec3 dz33 = Pfz.z + jitter * oz33;\n        vec3 d11 = dist(dx11, dy11, dz11);\n        vec3 d12 = dist(dx12, dy12, dz12);\n        vec3 d13 = dist(dx13, dy13, dz13);\n        vec3 d21 = dist(dx21, dy21, dz21);\n        vec3 d22 = dist(dx22, dy22, dz22);\n        vec3 d23 = dist(dx23, dy23, dz23);\n        vec3 d31 = dist(dx31, dy31, dz31);\n        vec3 d32 = dist(dx32, dy32, dz32);\n        vec3 d33 = dist(dx33, dy33, dz33);\n        vec3 d1a = min(d11, d12);\n        d12 = max(d11, d12);\n        d11 = min(d1a, d13);\n        d13 = max(d1a, d13);\n        d12 = min(d12, d13);\n        vec3 d2a = min(d21, d22);\n        d22 = max(d21, d22);\n        d21 = min(d2a, d23);\n        d23 = max(d2a, d23);\n        d22 = min(d22, d23);\n        vec3 d3a = min(d31, d32);\n        d32 = max(d31, d32);\n        d31 = min(d3a, d33);\n        d33 = max(d3a, d33);\n        d32 = min(d32, d33);\n        vec3 da = min(d11, d21);\n        d21 = max(d11, d21);\n        d11 = min(da, d31);\n        d31 = max(da, d31);\n        d11.xy = (d11.x < d11.y) ? d11.xy : d11.yx;\n        d11.xz = (d11.x < d11.z) ? d11.xz : d11.zx;\n        d12 = min(d12, d21);\n        d12 = min(d12, d22);\n        d12 = min(d12, d31);\n        d12 = min(d12, d32);\n        d11.yz = min(d11.yz, d12.xy);\n        d11.y = min(d11.y, d12.z);\n        d11.y = min(d11.y, d11.z);\n        return sqrt(d11.xy);\n    }\nvec4 Ruby_Mine1553790481262_158_main() \n    {\n        vec4 Ruby_Mine1553790481262_158_gl_FragColor = vec4(0.0);\n        vec2 worl = worley(vPosition, vJitter);\n        float world = worl.y - worl.x;\n        vec3 color = mix(color1, color2, clamp(world * 2.0, 0.0, 1.0));\n        Ruby_Mine1553790481262_158_gl_FragColor = vec4((color * 0.1) + (color * world), 1.0);\n        return Ruby_Mine1553790481262_158_gl_FragColor *= 1.0;\n    }\nvoid main() \n    {\n        gl_FragColor = Ruby_Mine1553790481262_158_main();    }\n";
  var vertex$a = "precision highp float;\nprecision highp int;\nuniform float time;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nattribute vec3 position;\nattribute vec3 normal;\nvarying vec3 vPosition;\nvarying float vJitter;\nvec3 permute(vec3 x) \n    {\n        return mod((34.0 * x + 1.0) * x, 289.0);\n    }\nvec3 dist(vec3 x, vec3 y, vec3 z) \n    {\n        return x * x + y * y + z * z;\n    }\nvec2 worley(vec3 P, float jitter) \n    {\n        float K = 0.142857142857;\n        float Ko = 0.428571428571;\n        float K2 = 0.020408163265306;\n        float Kz = 0.166666666667;\n        float Kzo = 0.416666666667;\n        vec3 Pi = mod(floor(P), 289.0);\n        vec3 Pf = fract(P) - 0.5;\n        vec3 Pfx = Pf.x + vec3(1.0, 0.0, -1.0);\n        vec3 Pfy = Pf.y + vec3(1.0, 0.0, -1.0);\n        vec3 Pfz = Pf.z + vec3(1.0, 0.0, -1.0);\n        vec3 p = permute(Pi.x + vec3(-1.0, 0.0, 1.0));\n        vec3 p1 = permute(p + Pi.y - 1.0);\n        vec3 p2 = permute(p + Pi.y);\n        vec3 p3 = permute(p + Pi.y + 1.0);\n        vec3 p11 = permute(p1 + Pi.z - 1.0);\n        vec3 p12 = permute(p1 + Pi.z);\n        vec3 p13 = permute(p1 + Pi.z + 1.0);\n        vec3 p21 = permute(p2 + Pi.z - 1.0);\n        vec3 p22 = permute(p2 + Pi.z);\n        vec3 p23 = permute(p2 + Pi.z + 1.0);\n        vec3 p31 = permute(p3 + Pi.z - 1.0);\n        vec3 p32 = permute(p3 + Pi.z);\n        vec3 p33 = permute(p3 + Pi.z + 1.0);\n        vec3 ox11 = fract(p11 * K) - Ko;\n        vec3 oy11 = mod(floor(p11 * K), 7.0) * K - Ko;\n        vec3 oz11 = floor(p11 * K2) * Kz - Kzo;\n        vec3 ox12 = fract(p12 * K) - Ko;\n        vec3 oy12 = mod(floor(p12 * K), 7.0) * K - Ko;\n        vec3 oz12 = floor(p12 * K2) * Kz - Kzo;\n        vec3 ox13 = fract(p13 * K) - Ko;\n        vec3 oy13 = mod(floor(p13 * K), 7.0) * K - Ko;\n        vec3 oz13 = floor(p13 * K2) * Kz - Kzo;\n        vec3 ox21 = fract(p21 * K) - Ko;\n        vec3 oy21 = mod(floor(p21 * K), 7.0) * K - Ko;\n        vec3 oz21 = floor(p21 * K2) * Kz - Kzo;\n        vec3 ox22 = fract(p22 * K) - Ko;\n        vec3 oy22 = mod(floor(p22 * K), 7.0) * K - Ko;\n        vec3 oz22 = floor(p22 * K2) * Kz - Kzo;\n        vec3 ox23 = fract(p23 * K) - Ko;\n        vec3 oy23 = mod(floor(p23 * K), 7.0) * K - Ko;\n        vec3 oz23 = floor(p23 * K2) * Kz - Kzo;\n        vec3 ox31 = fract(p31 * K) - Ko;\n        vec3 oy31 = mod(floor(p31 * K), 7.0) * K - Ko;\n        vec3 oz31 = floor(p31 * K2) * Kz - Kzo;\n        vec3 ox32 = fract(p32 * K) - Ko;\n        vec3 oy32 = mod(floor(p32 * K), 7.0) * K - Ko;\n        vec3 oz32 = floor(p32 * K2) * Kz - Kzo;\n        vec3 ox33 = fract(p33 * K) - Ko;\n        vec3 oy33 = mod(floor(p33 * K), 7.0) * K - Ko;\n        vec3 oz33 = floor(p33 * K2) * Kz - Kzo;\n        vec3 dx11 = Pfx + jitter * ox11;\n        vec3 dy11 = Pfy.x + jitter * oy11;\n        vec3 dz11 = Pfz.x + jitter * oz11;\n        vec3 dx12 = Pfx + jitter * ox12;\n        vec3 dy12 = Pfy.x + jitter * oy12;\n        vec3 dz12 = Pfz.y + jitter * oz12;\n        vec3 dx13 = Pfx + jitter * ox13;\n        vec3 dy13 = Pfy.x + jitter * oy13;\n        vec3 dz13 = Pfz.z + jitter * oz13;\n        vec3 dx21 = Pfx + jitter * ox21;\n        vec3 dy21 = Pfy.y + jitter * oy21;\n        vec3 dz21 = Pfz.x + jitter * oz21;\n        vec3 dx22 = Pfx + jitter * ox22;\n        vec3 dy22 = Pfy.y + jitter * oy22;\n        vec3 dz22 = Pfz.y + jitter * oz22;\n        vec3 dx23 = Pfx + jitter * ox23;\n        vec3 dy23 = Pfy.y + jitter * oy23;\n        vec3 dz23 = Pfz.z + jitter * oz23;\n        vec3 dx31 = Pfx + jitter * ox31;\n        vec3 dy31 = Pfy.z + jitter * oy31;\n        vec3 dz31 = Pfz.x + jitter * oz31;\n        vec3 dx32 = Pfx + jitter * ox32;\n        vec3 dy32 = Pfy.z + jitter * oy32;\n        vec3 dz32 = Pfz.y + jitter * oz32;\n        vec3 dx33 = Pfx + jitter * ox33;\n        vec3 dy33 = Pfy.z + jitter * oy33;\n        vec3 dz33 = Pfz.z + jitter * oz33;\n        vec3 d11 = dist(dx11, dy11, dz11);\n        vec3 d12 = dist(dx12, dy12, dz12);\n        vec3 d13 = dist(dx13, dy13, dz13);\n        vec3 d21 = dist(dx21, dy21, dz21);\n        vec3 d22 = dist(dx22, dy22, dz22);\n        vec3 d23 = dist(dx23, dy23, dz23);\n        vec3 d31 = dist(dx31, dy31, dz31);\n        vec3 d32 = dist(dx32, dy32, dz32);\n        vec3 d33 = dist(dx33, dy33, dz33);\n        vec3 d1a = min(d11, d12);\n        d12 = max(d11, d12);\n        d11 = min(d1a, d13);\n        d13 = max(d1a, d13);\n        d12 = min(d12, d13);\n        vec3 d2a = min(d21, d22);\n        d22 = max(d21, d22);\n        d21 = min(d2a, d23);\n        d23 = max(d2a, d23);\n        d22 = min(d22, d23);\n        vec3 d3a = min(d31, d32);\n        d32 = max(d31, d32);\n        d31 = min(d3a, d33);\n        d33 = max(d3a, d33);\n        d32 = min(d32, d33);\n        vec3 da = min(d11, d21);\n        d21 = max(d11, d21);\n        d11 = min(da, d31);\n        d31 = max(da, d31);\n        d11.xy = (d11.x < d11.y) ? d11.xy : d11.yx;\n        d11.xz = (d11.x < d11.z) ? d11.xz : d11.zx;\n        d12 = min(d12, d21);\n        d12 = min(d12, d22);\n        d12 = min(d12, d31);\n        d12 = min(d12, d32);\n        d11.yz = min(d11.yz, d12.xy);\n        d11.y = min(d11.y, d12.z);\n        d11.y = min(d11.y, d11.z);\n        return sqrt(d11.xy);\n    }\nvec4 Ruby_Mine1553790481262_158_main() \n    {\n        vec4 Ruby_Mine1553790481262_158_gl_Position = vec4(0.0);\n        vJitter = 1.0;\n        vPosition = (position * 2.0) + vec3(sin(time), cos(time), cos(time + 3.14));\n        vec2 worl = worley(vPosition, vJitter);\n        vec3 pos = position - (length(worl) * normal * 0.2);\n        Ruby_Mine1553790481262_158_gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);\n        return Ruby_Mine1553790481262_158_gl_Position *= 1.0;\n    }\nvoid main() \n    {\n        gl_Position = Ruby_Mine1553790481262_158_main();    }\n";
  var uniforms$a = {
  	time: {
  		type: "f",
  		glslType: "float"
  	},
  	color1: {
  		value: {
  			r: 0.95,
  			g: 0.1,
  			b: 0.8
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	color2: {
  		value: {
  			r: 0.7,
  			g: 0.07,
  			b: 0.6
  		},
  		type: "c",
  		glslType: "vec3"
  	}
  };
  var url$a = "http://shaderfrog.com/app/view/3301";
  var user$a = {
  	username: "SirFizX",
  	url: "http://shaderfrog.com/app/profile/andrewray"
  };
  var Ova_Shader = {
  	id: id$a,
  	name: name$b,
  	fragment: fragment$a,
  	vertex: vertex$a,
  	uniforms: uniforms$a,
  	url: url$a,
  	user: user$a
  };

  var id$b = 3345;
  var name$c = "Thruster Shader";
  var fragment$b = "#define TAU 6.28318530718\n#define MAX_ITER 5\n#define tau 6.2831853\n\n#extension GL_OES_standard_derivatives : enable\n\nprecision highp float;\nprecision highp int;\nuniform vec2 Tiling_Caustic1477531952046_152_resolution;\nuniform vec3 backgroundColor;\nuniform vec3 Tiling_Caustic1477531952046_152_color;\nuniform float Tiling_Caustic1477531952046_152_speed;\nuniform float Tiling_Caustic1477531952046_152_brightness;\nuniform float time;\nuniform float contrast;\nuniform float distortion;\nuniform float Noise_Ripples1477531959288_166_speed;\nuniform vec3 Noise_Ripples1477531959288_166_color;\nuniform float Noise_Ripples1477531959288_166_brightness;\nuniform sampler2D noiseImage;\nuniform vec2 Noise_Ripples1477531959288_166_resolution;\nuniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat3 normalMatrix;\nuniform float highlightIntensity;\nuniform vec3 highlightColor;\nuniform vec3 Wiggly_Improved1477532051339_181_color;\nuniform vec3 Transparent_Glow1477532059126_201_color;\nuniform float Transparent_Glow1477532059126_201_start;\nuniform float Transparent_Glow1477532059126_201_end;\nuniform float Transparent_Glow1477532059126_201_alpha;\nuniform vec3 Glow_Effect1477532183055_216_color;\nuniform float Glow_Effect1477532183055_216_start;\nuniform float Glow_Effect1477532183055_216_end;\nuniform float Glow_Effect1477532183055_216_alpha;\nvarying vec2 Tiling_Caustic1477531952046_152_vUv;\nvarying vec2 Noise_Ripples1477531959288_166_vUv;\nmat2 makem2(in float theta) \n    {\n        float c = cos(theta);\n        float s = sin(theta);\n        return mat2(c, -s, s, c);\n    }\nfloat noise(in vec2 x) \n    {\n        return texture2D(noiseImage, x * .01).x;\n    }\nfloat fbm(in vec2 p) \n    {\n        float z = 2.;\n        float rz = 0.;\n        vec2 bp = p;\n        for (float i = 1.;\n i < 6.0; i++) \n        {\n            rz += abs((noise(p) - 0.5) * 2.0) / z;\n            z = z * 2.;\n            p = p * 2.;\n        }\n        return rz;\n    }\nfloat dualfbm(in vec2 p) \n    {\n        vec2 p2 = p * distortion;\n        vec2 basis = vec2(fbm(p2 - time * Noise_Ripples1477531959288_166_speed * 1.6), fbm(p2 + time * Noise_Ripples1477531959288_166_speed * 1.7));\n        basis = (basis - .5) * .2;\n        p += basis;\n        return fbm(p * makem2(time * Noise_Ripples1477531959288_166_speed * 0.2));\n    }\nvarying vec3 Wiggly_Improved1477532051339_181_vNormal;\nvarying float light;\nvarying vec3 Transparent_Glow1477532059126_201_fPosition;\nvarying vec3 Transparent_Glow1477532059126_201_fNormal;\nvarying vec3 Glow_Effect1477532183055_216_fPosition;\nvarying vec3 Glow_Effect1477532183055_216_fNormal;\nvec4 Tiling_Caustic1477531952046_152_main() \n    {\n        vec4 Tiling_Caustic1477531952046_152_gl_FragColor = vec4(0.0);\n        vec2 uv = Tiling_Caustic1477531952046_152_vUv * Tiling_Caustic1477531952046_152_resolution;\n        vec2 p = mod(uv * TAU, TAU) - 250.0;\n        vec2 i = vec2(p);\n        float c = 1.0;\n        float inten = 0.005;\n        for (int n = 0;\n n < MAX_ITER; n++) \n        {\n            float t = time * Tiling_Caustic1477531952046_152_speed * (1.0 - (3.5 / float(n + 1)));\n            i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));\n            c += 1.0 / length(vec2(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten)));\n        }\n        c /= float(MAX_ITER);\n        c = 1.17 - pow(c, Tiling_Caustic1477531952046_152_brightness);\n        vec3 rgb = vec3(pow(abs(c), 8.0));\n        Tiling_Caustic1477531952046_152_gl_FragColor = vec4(rgb * Tiling_Caustic1477531952046_152_color + backgroundColor, 1.0);\n        return Tiling_Caustic1477531952046_152_gl_FragColor *= 1.0;\n    }\nvec4 Noise_Ripples1477531959288_166_main() \n    {\n        vec4 Noise_Ripples1477531959288_166_gl_FragColor = vec4(0.0);\n        vec2 p = (Noise_Ripples1477531959288_166_vUv.xy - 0.5) * Noise_Ripples1477531959288_166_resolution;\n        float rz = dualfbm(p);\n        vec3 col = (Noise_Ripples1477531959288_166_color / rz) * Noise_Ripples1477531959288_166_brightness;\n        col = ((col - 0.5) * max(contrast, 0.0)) + 0.5;\n        Noise_Ripples1477531959288_166_gl_FragColor = vec4(col, 1.0);\n        return Noise_Ripples1477531959288_166_gl_FragColor *= 1.0;\n    }\nvec4 Wiggly_Improved1477532051339_181_main() \n    {\n        vec4 Wiggly_Improved1477532051339_181_gl_FragColor = vec4(0.0);\n        Wiggly_Improved1477532051339_181_gl_FragColor = vec4(clamp(highlightColor * highlightIntensity * light, 0.0, 1.0), 1.0);\n        return Wiggly_Improved1477532051339_181_gl_FragColor *= 1.0;\n    }\nvec4 Transparent_Glow1477532059126_201_main() \n    {\n        vec4 Transparent_Glow1477532059126_201_gl_FragColor = vec4(0.0);\n        vec3 normal = normalize(Transparent_Glow1477532059126_201_fNormal);\n        vec3 eye = normalize(-Transparent_Glow1477532059126_201_fPosition.xyz);\n        float rim = smoothstep(Transparent_Glow1477532059126_201_start, Transparent_Glow1477532059126_201_end, 1.0 - dot(normal, eye));\n        float value = clamp(rim * Transparent_Glow1477532059126_201_alpha, 0.0, 1.0);\n        Transparent_Glow1477532059126_201_gl_FragColor = vec4(Transparent_Glow1477532059126_201_color * value, value);\n        return Transparent_Glow1477532059126_201_gl_FragColor *= 1.0;\n    }\nvec4 Glow_Effect1477532183055_216_main() \n    {\n        vec4 Glow_Effect1477532183055_216_gl_FragColor = vec4(0.0);\n        vec3 normal = normalize(Glow_Effect1477532183055_216_fNormal);\n        vec3 eye = normalize(-Glow_Effect1477532183055_216_fPosition.xyz);\n        float rim = smoothstep(Glow_Effect1477532183055_216_start, Glow_Effect1477532183055_216_end, 1.0 - dot(normal, eye));\n        Glow_Effect1477532183055_216_gl_FragColor = vec4(clamp(rim, 0.0, 1.0) * Glow_Effect1477532183055_216_alpha * Glow_Effect1477532183055_216_color, 1.0);\n        return Glow_Effect1477532183055_216_gl_FragColor *= 1.0;\n    }\nvoid main() \n    {\n        gl_FragColor = (Tiling_Caustic1477531952046_152_main() + Noise_Ripples1477531959288_166_main() + Wiggly_Improved1477532051339_181_main() + Transparent_Glow1477532059126_201_main() + Glow_Effect1477532183055_216_main());    }\n";
  var vertex$b = "precision highp float;\nprecision highp int;\nuniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 viewMatrix;\nuniform mat3 normalMatrix;\nuniform vec3 cameraPosition;\nuniform float time;\nuniform float Wiggly_Improved1477532051339_181_speed;\nuniform float frequency;\nuniform float amplitude;\nattribute vec3 position;\nattribute vec3 normal;\nattribute vec2 uv;\nattribute vec2 uv2;\nvarying vec3 Tiling_Caustic1477531952046_152_vPosition;\nvarying vec3 Tiling_Caustic1477531952046_152_vNormal;\nvarying vec2 Tiling_Caustic1477531952046_152_vUv;\nvarying vec2 Tiling_Caustic1477531952046_152_vUv2;\nvarying vec3 Noise_Ripples1477531959288_166_vPosition;\nvarying vec3 Noise_Ripples1477531959288_166_vNormal;\nvarying vec2 Noise_Ripples1477531959288_166_vUv;\nvarying vec2 Noise_Ripples1477531959288_166_vUv2;\nvarying vec3 Wiggly_Improved1477532051339_181_vNormal;\nvarying float light;\nvarying vec3 Wiggly_Improved1477532051339_181_vPosition;\nvarying vec3 Transparent_Glow1477532059126_201_fNormal;\nvarying vec3 Transparent_Glow1477532059126_201_fPosition;\nvarying vec3 Glow_Effect1477532183055_216_fNormal;\nvarying vec3 Glow_Effect1477532183055_216_fPosition;\nvec4 Tiling_Caustic1477531952046_152_main() \n    {\n        vec4 Tiling_Caustic1477531952046_152_gl_Position = vec4(0.0);\n        Tiling_Caustic1477531952046_152_vNormal = normal;\n        Tiling_Caustic1477531952046_152_vUv = uv;\n        Tiling_Caustic1477531952046_152_vUv2 = uv2;\n        Tiling_Caustic1477531952046_152_vPosition = position;\n        Tiling_Caustic1477531952046_152_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        return Tiling_Caustic1477531952046_152_gl_Position *= 1.0;\n    }\nvec4 Noise_Ripples1477531959288_166_main() \n    {\n        vec4 Noise_Ripples1477531959288_166_gl_Position = vec4(0.0);\n        Noise_Ripples1477531959288_166_vNormal = normal;\n        Noise_Ripples1477531959288_166_vUv = uv;\n        Noise_Ripples1477531959288_166_vUv2 = uv2;\n        Noise_Ripples1477531959288_166_vPosition = position;\n        Noise_Ripples1477531959288_166_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        return Noise_Ripples1477531959288_166_gl_Position *= 1.0;\n    }\nvec4 Wiggly_Improved1477532051339_181_main() \n    {\n        vec4 Wiggly_Improved1477532051339_181_gl_Position = vec4(0.0);\n        vec3 offset = normalize(vec3(0.0) - position) * (amplitude * sin(Wiggly_Improved1477532051339_181_speed * time + position.y * frequency));\n        vec3 newPosition = position + vec3(offset.x, 0.0, offset.z);\n        light = amplitude * sin(Wiggly_Improved1477532051339_181_speed * time + 1.0 + position.y * frequency);\n        Wiggly_Improved1477532051339_181_vPosition = newPosition;\n        Wiggly_Improved1477532051339_181_gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);\n        return Wiggly_Improved1477532051339_181_gl_Position *= 1.0;\n    }\nvec4 Transparent_Glow1477532059126_201_main() \n    {\n        vec4 Transparent_Glow1477532059126_201_gl_Position = vec4(0.0);\n        Transparent_Glow1477532059126_201_fNormal = normalize(normalMatrix * normal);\n        vec4 pos = modelViewMatrix * vec4(position, 1.0);\n        Transparent_Glow1477532059126_201_fPosition = pos.xyz;\n        Transparent_Glow1477532059126_201_gl_Position = projectionMatrix * pos;\n        return Transparent_Glow1477532059126_201_gl_Position *= 1.0;\n    }\nvec4 Glow_Effect1477532183055_216_main() \n    {\n        vec4 Glow_Effect1477532183055_216_gl_Position = vec4(0.0);\n        Glow_Effect1477532183055_216_fNormal = normalize(normalMatrix * normal);\n        vec4 pos = modelViewMatrix * vec4(position, 1.0);\n        Glow_Effect1477532183055_216_fPosition = pos.xyz;\n        Glow_Effect1477532183055_216_gl_Position = projectionMatrix * pos;\n        return Glow_Effect1477532183055_216_gl_Position *= 1.0;\n    }\nvoid main() \n    {\n        gl_Position = Tiling_Caustic1477531952046_152_main() + Noise_Ripples1477531959288_166_main() + Wiggly_Improved1477532051339_181_main() + Transparent_Glow1477532059126_201_main() + Glow_Effect1477532183055_216_main();    }\n";
  var uniforms$b = {
  	cameraPosition: {
  		type: "v3",
  		glslType: "vec3"
  	},
  	time: {
  		type: "f",
  		glslType: "float"
  	},
  	backgroundColor: {
  		value: {
  			r: "0",
  			g: "0",
  			b: "0"
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Tiling_Caustic1477531952046_152_resolution: {
  		value: {
  			x: 1,
  			y: 1
  		},
  		type: "v2",
  		glslType: "vec2"
  	},
  	Tiling_Caustic1477531952046_152_color: {
  		value: {
  			r: 1,
  			g: 1,
  			b: 1
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Tiling_Caustic1477531952046_152_speed: {
  		value: "0.5",
  		type: "f",
  		glslType: "float"
  	},
  	Tiling_Caustic1477531952046_152_brightness: {
  		value: "1.5",
  		type: "f",
  		glslType: "float"
  	},
  	noiseImage: {
  		value: null,
  		type: "t",
  		glslType: "sampler2D"
  	},
  	distortion: {
  		value: "2",
  		type: "f",
  		glslType: "float"
  	},
  	contrast: {
  		value: "1.5",
  		type: "f",
  		glslType: "float"
  	},
  	Noise_Ripples1477531959288_166_speed: {
  		value: "0.1",
  		type: "f",
  		glslType: "float"
  	},
  	Noise_Ripples1477531959288_166_color: {
  		value: {
  			r: 1,
  			g: 0.2823529411764706,
  			b: 0.4823529411764706
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Noise_Ripples1477531959288_166_brightness: {
  		value: "0.1",
  		type: "f",
  		glslType: "float"
  	},
  	Noise_Ripples1477531959288_166_resolution: {
  		value: {
  			x: "2",
  			y: "2"
  		},
  		type: "v2",
  		glslType: "vec2"
  	},
  	amplitude: {
  		value: "1",
  		type: "f",
  		glslType: "float"
  	},
  	frequency: {
  		value: "20",
  		type: "f",
  		glslType: "float"
  	},
  	highlightIntensity: {
  		value: "0.4",
  		type: "f",
  		glslType: "float"
  	},
  	highlightColor: {
  		value: {
  			r: 1,
  			g: 0.5450980392156862,
  			b: 0.23529411764705882
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Wiggly_Improved1477532051339_181_color: {
  		value: {
  			r: 0,
  			g: 0,
  			b: 0
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Wiggly_Improved1477532051339_181_speed: {
  		value: "12",
  		type: "f",
  		glslType: "float"
  	},
  	Transparent_Glow1477532059126_201_color: {
  		value: {
  			r: 1,
  			g: 0.5294117647058824,
  			b: 0.8156862745098039
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Transparent_Glow1477532059126_201_start: {
  		value: "0.54674743",
  		type: "f",
  		glslType: "float"
  	},
  	Transparent_Glow1477532059126_201_end: {
  		value: "0.44399246",
  		type: "f",
  		glslType: "float"
  	},
  	Transparent_Glow1477532059126_201_alpha: {
  		value: "0.5",
  		type: "f",
  		glslType: "float"
  	},
  	Glow_Effect1477532183055_216_color: {
  		value: {
  			r: "1",
  			g: "1",
  			b: "1"
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	Glow_Effect1477532183055_216_start: {
  		value: "0",
  		type: "f",
  		glslType: "float"
  	},
  	Glow_Effect1477532183055_216_end: {
  		value: "1.9",
  		type: "f",
  		glslType: "float"
  	},
  	Glow_Effect1477532183055_216_alpha: {
  		value: "1",
  		type: "f",
  		glslType: "float"
  	}
  };
  var url$b = "http://shaderfrog.com/app/view/3345";
  var user$b = {
  	username: "SirFizX",
  	url: "http://shaderfrog.com/app/profile/andrewray"
  };
  var Thruster_Shader = {
  	id: id$b,
  	name: name$c,
  	fragment: fragment$b,
  	vertex: vertex$b,
  	uniforms: uniforms$b,
  	url: url$b,
  	user: user$b
  };

  var id$c = 3369;
  var name$d = "Flowing Circles";
  var fragment$c = "precision highp float;\nprecision highp int;\nuniform vec2 resolution;\nuniform float time;\nuniform float speed;\nuniform float baseRadius;\nuniform float colorVariation;\nuniform float brightnessVariation;\nuniform vec3 backgroundColor;\nuniform float variation;\nvarying vec2 vUv;\nvec3 n(vec2 x, float t) \n    {\n        vec3 v = floor(vec3(x, t));\n        vec3 u = vec3(mod(v.xy, variation), v.z);\n        vec3 c = fract(u.xyz * (vec3(0.16462, 0.84787, 0.98273) + u.xyz * vec3(0.24808, 0.75905, 0.13898) + u.yzx * vec3(0.31517, 0.62703, 0.26063) + u.zxy * vec3(0.47127, 0.58568, 0.37244)) + u.yzx * (vec3(0.35425, 0.65187, 0.12423) + u.yzx * vec3(0.95238, 0.93187, 0.95213) + u.zxy * vec3(0.31526, 0.62512, 0.71837)) + u.zxy * (vec3(0.95213, 0.13841, 0.16479) + u.zxy * vec3(0.47626, 0.69257, 0.19738)));\n        return v + c;\n    }\nvec3 col(vec2 x, float t) \n    {\n        return vec3(0.5 + max(brightnessVariation * cos(x.y * x.x), 0.0)) + clamp(colorVariation * cos(fract(vec3(x, t)) * 371.0241), vec3(-0.4), vec3(1.0));\n    }\nvec2 idx(vec2 x) \n    {\n        return floor(fract(x * 29.0) * 3.0) - vec2(1.0);\n    }\nfloat circle(vec2 x, vec2 c, float r) \n    {\n        return max(0.0, 1.0 - dot(x - c, x - c) / (r * r));\n    }\nvec4 Fluid_Circles1551693972791_443_main() \n    {\n        vec4 Fluid_Circles1551693972791_443_gl_FragColor = vec4(0.0);\n        vec2 x = vUv * resolution;\n        float t = time * speed;\n        vec4 c = vec4(vec3(0.0), 0.1);\n        for (int N = 0;\n N < 3; N++) \n        {\n            for (int k = -1;\n k <= 0; k++) \n            {\n                for (int i = -1;\n i <= 1; i++) \n                {\n                    for (int j = -1;\n j <= 1; j++) \n                    {\n                        vec2 X = x + vec2(j, i);\n                        float t = t + float(N) * 38.0;\n                        float T = t + float(k);\n                        vec3 a = n(X, T);\n                        vec2 o = idx(a.xy);\n                        vec3 b = n(X + o, T + 1.0);\n                        vec2 m = mix(a.xy, b.xy, (t - a.z) / (b.z - a.z));\n                        float r = baseRadius * sin(3.1415927 * clamp((t - a.z) / (b.z - a.z), 0.0, 1.0));\n                        if (length(a.xy - b.xy) / (b.z - a.z) > 2.0) \n                        {\n                            r = 0.0;\n                        }\n                         c += vec4(col(a.xy, a.z), 1.0) * circle(x, m, r);\n                    }\n                }\n            }\n        }\n        Fluid_Circles1551693972791_443_gl_FragColor = vec4(c.rgb / max(1e-5, c.w) + backgroundColor, 1.0);\n        return Fluid_Circles1551693972791_443_gl_FragColor *= 1.0;\n    }\nvoid main() \n    {\n        gl_FragColor = Fluid_Circles1551693972791_443_main();    }\n";
  var vertex$c = "precision highp float;\nprecision highp int;\nuniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 viewMatrix;\nuniform mat3 normalMatrix;\nuniform vec3 cameraPosition;\nuniform float time;\nattribute vec3 position;\nattribute vec3 normal;\nattribute vec2 uv;\nattribute vec2 uv2;\nvarying vec3 vPosition;\nvarying vec3 vNormal;\nvarying vec2 vUv;\nvarying vec2 vUv2;\nvec4 Fluid_Circles1551693972791_443_main() \n    {\n        vec4 Fluid_Circles1551693972791_443_gl_Position = vec4(0.0);\n        vNormal = normal;\n        vUv = uv;\n        vUv2 = uv2;\n        vPosition = position;\n        Fluid_Circles1551693972791_443_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        return Fluid_Circles1551693972791_443_gl_Position *= 1.0;\n    }\nvoid main() \n    {\n        gl_Position = Fluid_Circles1551693972791_443_main();    }\n";
  var uniforms$c = {
  	cameraPosition: {
  		type: "v3",
  		glslType: "vec3"
  	},
  	time: {
  		type: "f",
  		glslType: "float"
  	},
  	resolution: {
  		value: {
  			x: "8",
  			y: "9"
  		},
  		type: "v2",
  		glslType: "vec2"
  	},
  	speed: {
  		value: ".2",
  		type: "f",
  		glslType: "float"
  	},
  	baseRadius: {
  		value: ".2",
  		type: "f",
  		glslType: "float"
  	},
  	backgroundColor: {
  		value: {
  			r: 0,
  			g: ".",
  			b: "0.9"
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	brightnessVariation: {
  		value: "0",
  		type: "f",
  		glslType: "float"
  	},
  	colorVariation: {
  		value: "0.99",
  		type: "f",
  		glslType: "float"
  	},
  	variation: {
  		value: "50",
  		type: "f",
  		glslType: "float"
  	}
  };
  var url$c = "http://shaderfrog.com/app/view/3369";
  var user$c = {
  	username: "SirFizX",
  	url: "http://shaderfrog.com/app/profile/andrewray"
  };
  var Flowing_Circles_Shader = {
  	id: id$c,
  	name: name$d,
  	fragment: fragment$c,
  	vertex: vertex$c,
  	uniforms: uniforms$c,
  	url: url$c,
  	user: user$c
  };

  var id$d = 3373;
  var name$e = "Electric Shader";
  var fragment$d = "precision highp float;\nprecision highp int;\nuniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 viewMatrix;\nuniform mat3 normalMatrix;\nuniform vec3 cameraPosition;\nuniform float time;\nuniform float opacity;\nvarying vec3 vPosition;\nvarying vec3 vNormal;\nvarying vec2 vUv;\nvarying vec2 vUv2;\nfloat Hash(vec2 p) \n    {\n        vec3 p2 = vec3(p.xy, 1.0);\n        return fract(sin(dot(p2, vec3(37.1, 61.7, 12.4))) * 3758.5453123);\n    }\nfloat noise(in vec2 p) \n    {\n        vec2 i = floor(p);\n        vec2 f = fract(p);\n        f *= f * (3.0 - 2.0 * f);\n        return mix(mix(Hash(i + vec2(0., 0.)), Hash(i + vec2(1., 0.)), f.x), mix(Hash(i + vec2(0., 1.)), Hash(i + vec2(1., 1.)), f.x), f.y);\n    }\nfloat fbm(vec2 p) \n    {\n        float v = 0.0;\n        v += noise(p * 1.0) * .5;\n        v += noise(p * 2.) * .25;\n        v += noise(p * 4.) * .125;\n        return v * 1.0;\n    }\nconst float PI = acos(0.0) * 2.0;\nvec2 RadialCoords(vec3 a_coords) \n    {\n        vec3 a_coords_n = normalize(a_coords);\n        float lon = atan(a_coords_n.z, a_coords_n.x);\n        float lat = acos(a_coords_n.y);\n        vec2 sphereCoords = vec2(lon, lat) / PI;\n        return vec2(fract(sphereCoords.x * 0.5 + 0.5), 1.0 - sphereCoords.y);\n    }\nvec4 Lightning_main() \n    {\n        vec4 Lightning_gl_FragColor = vec4(0.0);\n        vec2 uv = RadialCoords(vPosition * 1.0) * 2.0 - 1.0;\n        vec3 finalColor = vec3(0.0);\n        const float strength = 0.01;\n        const float dx = 0.1;\n        float t = 0.0;\n        for (int k = -4;\n k < 14; ++k) \n        {\n            vec2 thisUV = uv;\n            thisUV.x -= dx * float(k);\n            thisUV.y -= float(k);\n            t += abs(strength / (thisUV.x + fbm(thisUV + time)));\n        }\n        finalColor += t * vec3(0.1, 0.3, 1.0);\n        Lightning_gl_FragColor = vec4(finalColor, opacity);\n        return Lightning_gl_FragColor;\n    }\nvec4 Electric_Shader1556488915096_215_main() \n    {\n        vec4 Electric_Shader1556488915096_215_gl_FragColor = vec4(0.0);\n        Electric_Shader1556488915096_215_gl_FragColor = Lightning_main();\n        return Electric_Shader1556488915096_215_gl_FragColor *= 1.0;\n    }\nvoid main() \n    {\n        gl_FragColor = Electric_Shader1556488915096_215_main();\n if (gl_FragColor.a < 0.5  && gl_FragColor.g <0.5) discard;   }\n";
  var vertex$d = "precision highp float;\nprecision highp int;\nuniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 viewMatrix;\nuniform mat3 normalMatrix;\nuniform vec3 cameraPosition;\nuniform float time;\nattribute vec3 position;\nattribute vec3 normal;\nattribute vec2 uv;\nattribute vec2 uv2;\nvarying vec3 vPosition;\nvarying vec3 vNormal;\nvarying vec2 vUv;\nvarying vec2 vUv2;\nvec4 Lightning_main() \n    {\n        vec4 Lightning_gl_Position = vec4(0.0);\n        vNormal = normal;\n        vUv = uv;\n        vUv2 = uv2;\n        vPosition = position;\n        Lightning_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        return Lightning_gl_Position *= 0.5;\n    }\nvec4 Electric_Shader1556488915096_215_main() \n    {\n        vec4 Electric_Shader1556488915096_215_gl_Position = vec4(0.0);\n        Electric_Shader1556488915096_215_gl_Position = Lightning_main();\n        return Electric_Shader1556488915096_215_gl_Position *= 1.0;\n    }\nvoid main() \n    {\n        gl_Position = Electric_Shader1556488915096_215_main();    }\n";
  var uniforms$d = {
  	cameraPosition: {
  		type: "v3",
  		glslType: "vec3"
  	},
  	time: {
  		type: "f",
  		glslType: "float"
  	},
  	opacity: {
  		value: "0.4",
  		type: "f",
  		glslType: "float"
  	}
  };
  var side = 2;
  var url$d = "http://shaderfrog.com/app/view/3373";
  var user$d = {
  	username: "SirFizX",
  	url: "http://shaderfrog.com/app/profile/sirfizx"
  };
  var Electric_Shader = {
  	id: id$d,
  	name: name$e,
  	fragment: fragment$d,
  	vertex: vertex$d,
  	uniforms: uniforms$d,
  	side: side,
  	url: url$d,
  	user: user$d
  };

  var id$e = 3386;
  var name$f = "CS1 Shader";
  var fragment$e = "#define DOWN_SCALE 1.0\n#define MAX_INT_DIGITS 4\n#define NORMAL 0\n#define INVERT 1\n#define UNDERLINE 2\n\nprecision highp float;\nprecision highp int;\nuniform float time;\nuniform vec2 resolution;\nuniform vec3 color;\nuniform vec3 background_color;\nvarying vec2 vUv;\nint TEXT_MODE = NORMAL;\nvec4 ch_spc = vec4(0x000000, 0x000000, 0x000000, 0x000000);\nvec4 ch_exc = vec4(0x003078, 0x787830, 0x300030, 0x300000);\nvec4 ch_quo = vec4(0x006666, 0x662400, 0x000000, 0x000000);\nvec4 ch_hsh = vec4(0x006C6C, 0xFE6C6C, 0x6CFE6C, 0x6C0000);\nvec4 ch_dol = vec4(0x30307C, 0xC0C078, 0x0C0CF8, 0x303000);\nvec4 ch_pct = vec4(0x000000, 0xC4CC18, 0x3060CC, 0x8C0000);\nvec4 ch_amp = vec4(0x0070D8, 0xD870FA, 0xDECCDC, 0x760000);\nvec4 ch_apo = vec4(0x003030, 0x306000, 0x000000, 0x000000);\nvec4 ch_lbr = vec4(0x000C18, 0x306060, 0x603018, 0x0C0000);\nvec4 ch_rbr = vec4(0x006030, 0x180C0C, 0x0C1830, 0x600000);\nvec4 ch_ast = vec4(0x000000, 0x663CFF, 0x3C6600, 0x000000);\nvec4 ch_crs = vec4(0x000000, 0x18187E, 0x181800, 0x000000);\nvec4 ch_com = vec4(0x000000, 0x000000, 0x000038, 0x386000);\nvec4 ch_dsh = vec4(0x000000, 0x0000FE, 0x000000, 0x000000);\nvec4 ch_per = vec4(0x000000, 0x000000, 0x000038, 0x380000);\nvec4 ch_lsl = vec4(0x000002, 0x060C18, 0x3060C0, 0x800000);\nvec4 ch_0 = vec4(0x007CC6, 0xD6D6D6, 0xD6D6C6, 0x7C0000);\nvec4 ch_1 = vec4(0x001030, 0xF03030, 0x303030, 0xFC0000);\nvec4 ch_2 = vec4(0x0078CC, 0xCC0C18, 0x3060CC, 0xFC0000);\nvec4 ch_3 = vec4(0x0078CC, 0x0C0C38, 0x0C0CCC, 0x780000);\nvec4 ch_4 = vec4(0x000C1C, 0x3C6CCC, 0xFE0C0C, 0x1E0000);\nvec4 ch_5 = vec4(0x00FCC0, 0xC0C0F8, 0x0C0CCC, 0x780000);\nvec4 ch_6 = vec4(0x003860, 0xC0C0F8, 0xCCCCCC, 0x780000);\nvec4 ch_7 = vec4(0x00FEC6, 0xC6060C, 0x183030, 0x300000);\nvec4 ch_8 = vec4(0x0078CC, 0xCCEC78, 0xDCCCCC, 0x780000);\nvec4 ch_9 = vec4(0x0078CC, 0xCCCC7C, 0x181830, 0x700000);\nvec4 ch_col = vec4(0x000000, 0x383800, 0x003838, 0x000000);\nvec4 ch_scl = vec4(0x000000, 0x383800, 0x003838, 0x183000);\nvec4 ch_les = vec4(0x000C18, 0x3060C0, 0x603018, 0x0C0000);\nvec4 ch_equ = vec4(0x000000, 0x007E00, 0x7E0000, 0x000000);\nvec4 ch_grt = vec4(0x006030, 0x180C06, 0x0C1830, 0x600000);\nvec4 ch_que = vec4(0x0078CC, 0x0C1830, 0x300030, 0x300000);\nvec4 ch_ats = vec4(0x007CC6, 0xC6DEDE, 0xDEC0C0, 0x7C0000);\nvec4 ch_A = vec4(0x003078, 0xCCCCCC, 0xFCCCCC, 0xCC0000);\nvec4 ch_B = vec4(0x00FC66, 0x66667C, 0x666666, 0xFC0000);\nvec4 ch_C = vec4(0x003C66, 0xC6C0C0, 0xC0C666, 0x3C0000);\nvec4 ch_D = vec4(0x00F86C, 0x666666, 0x66666C, 0xF80000);\nvec4 ch_E = vec4(0x00FE62, 0x60647C, 0x646062, 0xFE0000);\nvec4 ch_F = vec4(0x00FE66, 0x62647C, 0x646060, 0xF00000);\nvec4 ch_G = vec4(0x003C66, 0xC6C0C0, 0xCEC666, 0x3E0000);\nvec4 ch_H = vec4(0x00CCCC, 0xCCCCFC, 0xCCCCCC, 0xCC0000);\nvec4 ch_I = vec4(0x007830, 0x303030, 0x303030, 0x780000);\nvec4 ch_J = vec4(0x001E0C, 0x0C0C0C, 0xCCCCCC, 0x780000);\nvec4 ch_K = vec4(0x00E666, 0x6C6C78, 0x6C6C66, 0xE60000);\nvec4 ch_L = vec4(0x00F060, 0x606060, 0x626666, 0xFE0000);\nvec4 ch_M = vec4(0x00C6EE, 0xFEFED6, 0xC6C6C6, 0xC60000);\nvec4 ch_N = vec4(0x00C6C6, 0xE6F6FE, 0xDECEC6, 0xC60000);\nvec4 ch_O = vec4(0x00386C, 0xC6C6C6, 0xC6C66C, 0x380000);\nvec4 ch_P = vec4(0x00FC66, 0x66667C, 0x606060, 0xF00000);\nvec4 ch_Q = vec4(0x00386C, 0xC6C6C6, 0xCEDE7C, 0x0C1E00);\nvec4 ch_R = vec4(0x00FC66, 0x66667C, 0x6C6666, 0xE60000);\nvec4 ch_S = vec4(0x0078CC, 0xCCC070, 0x18CCCC, 0x780000);\nvec4 ch_T = vec4(0x00FCB4, 0x303030, 0x303030, 0x780000);\nvec4 ch_U = vec4(0x00CCCC, 0xCCCCCC, 0xCCCCCC, 0x780000);\nvec4 ch_V = vec4(0x00CCCC, 0xCCCCCC, 0xCCCC78, 0x300000);\nvec4 ch_W = vec4(0x00C6C6, 0xC6C6D6, 0xD66C6C, 0x6C0000);\nvec4 ch_X = vec4(0x00CCCC, 0xCC7830, 0x78CCCC, 0xCC0000);\nvec4 ch_Y = vec4(0x00CCCC, 0xCCCC78, 0x303030, 0x780000);\nvec4 ch_Z = vec4(0x00FECE, 0x981830, 0x6062C6, 0xFE0000);\nvec4 ch_lsb = vec4(0x003C30, 0x303030, 0x303030, 0x3C0000);\nvec4 ch_rsl = vec4(0x000080, 0xC06030, 0x180C06, 0x020000);\nvec4 ch_rsb = vec4(0x003C0C, 0x0C0C0C, 0x0C0C0C, 0x3C0000);\nvec4 ch_pow = vec4(0x10386C, 0xC60000, 0x000000, 0x000000);\nvec4 ch_usc = vec4(0x000000, 0x000000, 0x000000, 0x00FF00);\nvec4 ch_a = vec4(0x000000, 0x00780C, 0x7CCCCC, 0x760000);\nvec4 ch_b = vec4(0x00E060, 0x607C66, 0x666666, 0xDC0000);\nvec4 ch_c = vec4(0x000000, 0x0078CC, 0xC0C0CC, 0x780000);\nvec4 ch_d = vec4(0x001C0C, 0x0C7CCC, 0xCCCCCC, 0x760000);\nvec4 ch_e = vec4(0x000000, 0x0078CC, 0xFCC0CC, 0x780000);\nvec4 ch_f = vec4(0x00386C, 0x6060F8, 0x606060, 0xF00000);\nvec4 ch_g = vec4(0x000000, 0x0076CC, 0xCCCC7C, 0x0CCC78);\nvec4 ch_h = vec4(0x00E060, 0x606C76, 0x666666, 0xE60000);\nvec4 ch_i = vec4(0x001818, 0x007818, 0x181818, 0x7E0000);\nvec4 ch_j = vec4(0x000C0C, 0x003C0C, 0x0C0C0C, 0xCCCC78);\nvec4 ch_k = vec4(0x00E060, 0x60666C, 0x786C66, 0xE60000);\nvec4 ch_l = vec4(0x007818, 0x181818, 0x181818, 0x7E0000);\nvec4 ch_m = vec4(0x000000, 0x00FCD6, 0xD6D6D6, 0xC60000);\nvec4 ch_n = vec4(0x000000, 0x00F8CC, 0xCCCCCC, 0xCC0000);\nvec4 ch_o = vec4(0x000000, 0x0078CC, 0xCCCCCC, 0x780000);\nvec4 ch_p = vec4(0x000000, 0x00DC66, 0x666666, 0x7C60F0);\nvec4 ch_q = vec4(0x000000, 0x0076CC, 0xCCCCCC, 0x7C0C1E);\nvec4 ch_r = vec4(0x000000, 0x00EC6E, 0x766060, 0xF00000);\nvec4 ch_s = vec4(0x000000, 0x0078CC, 0x6018CC, 0x780000);\nvec4 ch_t = vec4(0x000020, 0x60FC60, 0x60606C, 0x380000);\nvec4 ch_u = vec4(0x000000, 0x00CCCC, 0xCCCCCC, 0x760000);\nvec4 ch_v = vec4(0x000000, 0x00CCCC, 0xCCCC78, 0x300000);\nvec4 ch_w = vec4(0x000000, 0x00C6C6, 0xD6D66C, 0x6C0000);\nvec4 ch_x = vec4(0x000000, 0x00C66C, 0x38386C, 0xC60000);\nvec4 ch_y = vec4(0x000000, 0x006666, 0x66663C, 0x0C18F0);\nvec4 ch_z = vec4(0x000000, 0x00FC8C, 0x1860C4, 0xFC0000);\nvec4 ch_lpa = vec4(0x001C30, 0x3060C0, 0x603030, 0x1C0000);\nvec4 ch_bar = vec4(0x001818, 0x181800, 0x181818, 0x180000);\nvec4 ch_rpa = vec4(0x00E030, 0x30180C, 0x183030, 0xE00000);\nvec4 ch_tid = vec4(0x0073DA, 0xCE0000, 0x000000, 0x000000);\nvec4 ch_lar = vec4(0x000000, 0x10386C, 0xC6C6FE, 0x000000);\nvec2 res = vec2(1.0) / 1.0;\nvec2 print_pos = vec2(0.0);\nfloat extract_bit(float n, float b) \n    {\n        b = clamp(b, -1.0, 24.0);\n        return floor(mod(floor(n / pow(2.0, floor(b))), 2.0));\n    }\nfloat sprite(vec4 spr, vec2 size, vec2 uv) \n    {\n        uv = floor(uv);\n        float bit = (size.x - uv.x - 1.0) + uv.y * size.x;\n        bool bounds = all(greaterThanEqual(uv, vec2(0))) && all(lessThan(uv, size));\n        float pixels = 0.0;\n        pixels += extract_bit(spr.x, bit - 72.0);\n        pixels += extract_bit(spr.y, bit - 48.0);\n        pixels += extract_bit(spr.z, bit - 24.0);\n        pixels += extract_bit(spr.w, bit - 00.0);\n        return bounds ? pixels : 0.0;\n    }\nfloat char(vec4 ch, vec2 uv) \n    {\n        if (TEXT_MODE == INVERT) \n        {\n            ch = pow(2.0, 24.0) - 1.0 - ch;\n        }\n         if (TEXT_MODE == UNDERLINE) \n        {\n            ch.w = floor(ch.w / 256.0) * 256.0 + 255.0;\n        }\n         float px = sprite(ch, vec2(8, 12), uv - print_pos);\n        print_pos.x += 8.;\n        return px;\n    }\nvec4 get_digit(float d) \n    {\n        d = floor(d);\n        if (d == 0.0) return ch_0;\n         if (d == 1.0) return ch_1;\n         if (d == 2.0) return ch_2;\n         if (d == 3.0) return ch_3;\n         if (d == 4.0) return ch_4;\n         if (d == 5.0) return ch_5;\n         if (d == 6.0) return ch_6;\n         if (d == 7.0) return ch_7;\n         if (d == 8.0) return ch_8;\n         if (d == 9.0) return ch_9;\n         return vec4(0.0);\n    }\nfloat print_number(float number, vec2 uv) \n    {\n        float result = 0.0;\n        for (int i = 3;\n i >= -1; i--) \n        {\n            float digit = mod(number / pow(10.0, float(i)), 10.0);\n            if (i == -1) \n            {\n                result += char(ch_per, uv);\n            }\n             if (abs(number) > pow(10.0, float(i)) || i == 0) \n            {\n                result += char(get_digit(digit), uv);\n            }\n         }\n        return result;\n    }\nfloat print_integer(float number, int zeros, vec2 uv) \n    {\n        float result = 0.0;\n        for (int i = MAX_INT_DIGITS;\n i >= 0; i--) \n        {\n            float digit = mod(number / pow(10.0, float(i)), 10.0);\n            if (abs(number) > pow(10.0, float(i)) || zeros > i || i == 0) \n            {\n                result += char(get_digit(digit), uv);\n            }\n         }\n        return result;\n    }\nfloat text(vec2 uv) \n    {\n        float col = 0.0;\n        vec2 center = res / 2.0;\n        print_pos = floor(center - vec2((17.0 * 8.), (1.0 * 12.)) / 2.0);\n        col += char(ch_C, uv);\n        col += char(ch_S, uv);\n        col += char(ch_1, uv);\n        TEXT_MODE = INVERT;\n        col += char(ch_G, uv);\n        col += char(ch_a, uv);\n        col += char(ch_m, uv);\n        col += char(ch_e, uv);\n        TEXT_MODE = NORMAL;\n        col += char(ch_E, uv);\n        col += char(ch_n, uv);\n        col += char(ch_g, uv);\n        col += char(ch_i, uv);\n        col += char(ch_n, uv);\n        col += char(ch_e, uv);\n        col += char(ch_exc, uv);\n        return col;\n    }\nvec4 Text_main() \n    {\n        vec4 Text_gl_FragColor = vec4(0.0);\n        vec2 uv = (vUv.xy - 0.5) * resolution;\n        vec2 duv = floor(uv.xy / 1.0);\n        float pixel = text(duv);\n        if (pixel > 0.0) \n        {\n            Text_gl_FragColor = vec4(vec3(pixel) * color, 1.0);\n            return Text_gl_FragColor *= 1.0;\n        }\n else \n        {\n            discard;\n        }\n    }\nvec4 Text_Only_Shader1556670324252_90_main() \n    {\n        vec4 Text_Only_Shader1556670324252_90_gl_FragColor = vec4(0.0);\n        Text_Only_Shader1556670324252_90_gl_FragColor = Text_main();\n        return Text_Only_Shader1556670324252_90_gl_FragColor *= 1.0;\n    }\nvoid main() \n    {\n        gl_FragColor = Text_Only_Shader1556670324252_90_main();    }\n";
  var vertex$e = "precision highp float;\nprecision highp int;\nuniform mat4 modelMatrix;\nuniform mat4 modelViewMatrix;\nuniform mat4 projectionMatrix;\nuniform mat4 viewMatrix;\nuniform mat3 normalMatrix;\nattribute vec3 position;\nattribute vec3 normal;\nattribute vec2 uv;\nattribute vec2 uv2;\nvarying vec2 vUv;\nvec4 Hello_ShaderFrog1551692717683_383_main() \n    {\n        vec4 Hello_ShaderFrog1551692717683_383_gl_Position = vec4(0.0);\n        vUv = uv;\n        Hello_ShaderFrog1551692717683_383_gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n        return Hello_ShaderFrog1551692717683_383_gl_Position *= 1.0;\n    }\nvec4 Text_Only_Shader1556670324252_90_main() \n    {\n        vec4 Text_Only_Shader1556670324252_90_gl_Position = vec4(0.0);\n        Text_Only_Shader1556670324252_90_gl_Position = Hello_ShaderFrog1551692717683_383_main();\n        return Text_Only_Shader1556670324252_90_gl_Position *= 1.0;\n    }\nvoid main() \n    {\n        gl_Position = Text_Only_Shader1556670324252_90_main();    }\n";
  var uniforms$e = {
  	time: {
  		type: "f",
  		glslType: "float"
  	},
  	color: {
  		value: {
  			r: 0.7176470588235294,
  			g: 0,
  			b: 0
  		},
  		type: "c",
  		glslType: "vec3"
  	},
  	resolution: {
  		value: {
  			x: "200",
  			y: "80"
  		},
  		type: "v2",
  		glslType: "vec2"
  	},
  	background_color: {
  		value: {
  			r: 0,
  			g: 0.8156862745098039,
  			b: 1
  		},
  		type: "c",
  		glslType: "vec3"
  	}
  };
  var side$1 = 2;
  var url$e = "http://shaderfrog.com/app/view/3386";
  var user$e = {
  	username: "SirFizX",
  	url: "http://shaderfrog.com/app/profile/andrewray"
  };
  var CS1_Shader = {
  	id: id$e,
  	name: name$f,
  	fragment: fragment$e,
  	vertex: vertex$e,
  	uniforms: uniforms$e,
  	side: side$1,
  	url: url$e,
  	user: user$e
  };

  var shaders = {};
  shaders['Polkadot_Shader']=Polkadot_Shader;
  shaders['Sun_Shader']=Sun_Shader;
  shaders['Jelly_Shader']=Jelly_Shader;
  shaders['Green_Dance_Shader']=Green_Dance_Shader;
  shaders['Cosmic_Shader']=Cosmic_Shader;
  shaders['Cool_Tiles_Shader']=Cool_Tiles_Shader;
  shaders['Disco_Shader']=Disco_Shader;
  shaders['Marching_Ants_Shader']=Marching_Ants_Shader;
  shaders['Goo_Shader']=Goo_Shader;
  shaders['Psycho_Shader']=Psycho_Shader;
  shaders['Ova_Shader']=Ova_Shader;
  shaders['Thruster_Shader']=Thruster_Shader;
  shaders['Flowing_Circles_Shader']=Flowing_Circles_Shader;
  shaders['Electric_Shader']=Electric_Shader;
  shaders['CS1_Shader']=CS1_Shader;

  var shaderfrog = CS1=>{
    
  CS1.shaderfrog = shaders;

  function ShaderRuntime() {}

  ShaderRuntime.prototype = {

      mainCamera: null,
      cubeCameras: {},

      reserved: { time: null, cameraPosition: null },

      umap: {
          float: { type: 'f', value: 0 },
          int: { type: 'i', value: 0 },
          vec2: { type: 'v2', value() { return new THREE.Vector2(); } },
          vec3: { type: 'v3', value() { return new THREE.Vector3(); } },
          vec4: { type: 'v4', value() { return new THREE.Vector4(); } },
          samplerCube: { type: 't' },
          sampler2D: { type: 't' }
      },

      getUmap( type ) {
          let value = this.umap[ type ].value;
          return typeof value === 'function' ? value() : value;
      },

      registerCamera( camera ) {

          if( !( camera instanceof THREE.Camera ) ) {
              throw new Error( 'Cannot register a non-camera as a camera!' );
          }

          this.mainCamera = camera;

      },

      registerCubeCamera( name, camera ) {

          if( !camera.renderTarget ) {
              throw new Error( 'Cannot register a non-camera as a camera!' );
          }

          this.cubeCameras[ name ] = camera;

      },

      unregisterCamera( name ) {

          if( name in this.cubeCameras ) {

              delete this.cubeCameras[ name ];
              
          } else if( name === this.mainCamera ) {

              delete this.mainCamera;

          } else {

              throw new Error( 'You never registered camera ' + name );

          }

      },

      updateSource( identifier, config, findBy ) {

          findBy = findBy || 'name';

          if( !this.shaderTypes[ identifier ] ) {
              throw new Error( 'Runtime Error: Cannot update shader ' + identifier + ' because it has not been added.' );
          }

          let newShaderData = this.add( identifier, config ),
              shader, x;

          for( x = 0; shader = this.runningShaders[ x++ ]; ) {
              if( shader[ findBy ] === identifier ) {
                  extend( shader.material, omit( newShaderData, 'id' ) );
                  shader.material.needsUpdate = true;
              }
          }

      },

      renameShader( oldName, newName ) {

          let x, shader;

          if( !( oldName in this.shaderTypes ) ) {
              throw new Error('Could not rename shader ' + oldName + ' to ' + newName + '. It does not exist.');
          }

          this.shaderTypes[ newName ] = this.shaderTypes[ oldName ];
          delete this.shaderTypes[ oldName ];

          for( x = 0; shader = this.runningShaders[ x++ ]; ) {
              if( shader.name === oldName ) {
                  shader.name = newName;
              }
          }

      },

      get( identifier ) {

          let shaderType = this.shaderTypes[ identifier ];

          if( !shaderType.initted ) {

              this.create( identifier );
          }

          return shaderType.material;

      },

      add( shaderName, config ) {

          let newData = clone( config ),
              uniform;
          newData.fragmentShader = config.fragment;
          newData.vertexShader = config.vertex;
          delete newData.fragment;
          delete newData.vertex;

          for( var uniformName in newData.uniforms ) {
              uniform = newData.uniforms[ uniformName ];
              if( uniform.value === null ) {
                  newData.uniforms[ uniformName ].value = this.getUmap( uniform.glslType );
              }
          }
          
          if( shaderName in this.shaderTypes ) {
              // maybe not needed? too sleepy, need document
              extend( this.shaderTypes[ shaderName ], newData );
          } else {
              this.shaderTypes[ shaderName ] = newData;
          }

          return newData;

      },

      create( identifier ) {

          let shaderType = this.shaderTypes[ identifier ];
        
          delete shaderType.id;

          shaderType.material = new THREE.RawShaderMaterial( shaderType );

          this.runningShaders.push( shaderType );

          shaderType.init && shaderType.init( shaderType.material );
          shaderType.material.needsUpdate = true;

          shaderType.initted = true;

          return shaderType.material;

      },

      updateRuntime( identifier, data, findBy ) {

          findBy = findBy || 'name';

          let shader, x, uniformName, uniform;

          // This loop does not appear to be a slowdown culprit
          for( x = 0; shader = this.runningShaders[ x++ ]; ) {
              if( shader[ findBy ] === identifier ) {
                  for( uniformName in data.uniforms ) {

                      if( uniformName in this.reserved ) {
                          continue;
                      }

                      if( uniformName in shader.material.uniforms ) {

                          uniform = data.uniforms[ uniformName ];

                          // this is nasty, since the shader serializes
                          // CubeCamera model to string. Maybe not update it at
                          // all?
                          if( uniform.type === 't' && typeof uniform.value === 'string' ) {
                              uniform.value = this.cubeCameras[ uniform.value ].renderTarget;
                          }

                          shader.material.uniforms[ uniformName ].value = data.uniforms[ uniformName ].value;
                      }
                  }
              }
          }

      },

      // Update global shader uniform values
      updateShaders( time, obj ) {

          let shader, x;

          obj = obj || {};

          for( x = 0; shader = this.runningShaders[ x++ ]; ) {

              for( let uniform in obj.uniforms ) {
                  if( uniform in shader.material.uniforms ) {
                      shader.material.uniforms[ uniform ].value = obj.uniforms[ uniform ];
                  }
              }

              if( 'cameraPosition' in shader.material.uniforms && this.mainCamera ) {

                  shader.material.uniforms.cameraPosition.value = this.mainCamera.position.clone();

              }

              if( 'viewMatrix' in shader.material.uniforms && this.mainCamera ) {

                  shader.material.uniforms.viewMatrix.value = this.mainCamera.matrixWorldInverse;

              }

              if( 'time' in shader.material.uniforms ) {

                  shader.material.uniforms.time.value = time;

              }

          }

      },

      shaderTypes: shaders,

      runningShaders: []

  };

  // Convenience methods so we don't have to include underscore
  function extend() {
      let length = arguments.length,
          obj = arguments[ 0 ];

      if( length < 2 ) {
          return obj;
      }

      for( let index = 1; index < length; index++ ) {
          let source = arguments[ index ],
              keys = Object.keys( source || {} ),
              l = keys.length;
          for( let i = 0; i < l; i++ ) {
              let key = keys[i];
              obj[ key ] = source[ key ];
          }
      }

      return obj;
  }

  function clone( obj ) {
      return extend( {}, obj );
  }

  function omit( obj, ...keys ) {
      let cloned = clone( obj ), x, key;
      for( x = 0; key = keys[ x++ ]; ) {
          delete cloned[ key ];
      }
      return cloned;
  }
    
  AFRAME.registerSystem('shader-frog', {
    init:function(){
      this.frog_runtime = new ShaderRuntime();
      this.clock = new THREE.Clock();
      var self = this;
          
      var scene = document.querySelector('a-scene');
      if (scene.hasLoaded) {
        registerCamera().bind(this);    } else {
        scene.addEventListener('loaded', registerCamera);
      }
      function registerCamera () {
         var camera = document.querySelector("a-scene").systems["camera"];
         if(camera && camera.sceneEl && camera.sceneEl.camera){
           camera = camera.sceneEl.camera;
           self.frog_runtime.registerCamera(camera);
         }
      }
    },
    tick: function (t) {
      this.frog_runtime.updateShaders( this.clock.getElapsedTime() );
    }
  });
  AFRAME.registerComponent('shader-frog',{
    schema:{
      name:{type:"string"}
    },
    init: function(){
      this.originalMaterial = this.el.getObject3D('mesh').material;
      this.shaderData = shaders[this.data.name];
    },
    update: function(){
      this.system.frog_runtime.add(this.data.name,this.shaderData);
      var material = this.system.frog_runtime.get(this.data.name);
      this.el.getObject3D('mesh').material = material;
    },
    remove: function(){
      this.el.getObject3D('mesh').material = this.originalMaterial;
    }
  });
    
  };

  var proximityGlitch = CS1=>{

   AFRAME.registerComponent('proximity-glitch', {
     schema: {
       threshold: {type: 'number', default: 2},
       affects: {type: 'string', default: ''},
       value:{type:'number',default:-0.1},
       sound: {type: 'string',default:'https://cdn.glitch.com/6b222f93-e194-41e2-aaf6-59e5af64658d%2Fbuzz.mp3?1555284089077'},
     },
     init: function () {
        this.sound = document.createElement('a-sound');
        this.sound.setAttribute('src',`url(${this.data.sound})`);
        this.el.appendChild(this.sound);
        this.soundIsPlaying=false;
        this.sound.addEventListener('sound-ended',e=>{
          this.soundIsPlaying=false;     
        });
        this.scene=document.querySelector('a-scene');
        this.scene.setAttribute('glitch','');
        this.baseEffects=this.scene.getAttribute('effects');
      },
     tick: function (t,dt) {
       if(CS1.game.playerDistanceTo(this.el)<this.data.threshold){  
         this.scene.setAttribute('effects',`glitch,${this.baseEffects}`);
         if(this.data.affects){
           CS1.hud[this.data.affects].setValue(CS1.hud[this.data.affects].value+this.data.value);
           if(!this.soundIsPlaying){
             this.sound.components.sound.playSound();
             this.soundIsPlaying = true;
           }
         }
       }else{
         this.scene.setAttribute('effects',this.baseEffects);
       }
     }
    });

  };

  const defaults={
    labelText: 'Label Text',
    suffix: '',
    labelColor: '#e23fcf',
    gradientColor1: '#78F8EC',
    gradientColor2: '#6E4AE2',
    max: 100
  };

  const RingDial = function(custom) {
      this.opts = Object.assign({}, defaults, custom);
      this.size = 2000/9;
      this.strokeWidth = this.size / 8;
      this.radius = (this.size / 2) - (this.strokeWidth / 2);
      this.value = 0;
      this.cachedValue = this.value;
      this.targetValue = false;
      this.isAnimating = false;
      this.direction = 'up';
      this.svg;
      this.defs;
      this.slice;
      this.overlay;
      this.text;
      this.label;
      this.arrow;
      this.create(this.opts.labelColor,this.opts.gradientColor1,this.opts.gradientColor2);
  };

  RingDial.prototype.create = function(labelColor,gradientColor1,gradientColor2) {
      this.createSvg();
      this.createDefs(gradientColor1,gradientColor2);
      this.createSlice();
      this.createOverlay();
      this.createText(gradientColor2);
      //this.createArrow();
      this.createLabel(labelColor);
      this.opts.container.appendChild(this.svg);
  };

  RingDial.prototype.createSvg = function() {
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute('width', this.size + 'px');
      svg.setAttribute('height', this.size + 'px');
      this.svg = svg;
  };

  RingDial.prototype.createDefs = function(gc1,gc2) {
      var defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      var linearGradient = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
      linearGradient.setAttribute('id', 'gradient'+this.opts.labelText);
      var stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      stop1.setAttribute('stop-color', gc2);
      stop1.setAttribute('offset', '0%');
      linearGradient.appendChild(stop1);
      var stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      stop2.setAttribute('stop-color', gc1);
      stop2.setAttribute('offset', '100%');
      linearGradient.appendChild(stop2);
      var linearGradientBackground = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
      linearGradientBackground.setAttribute('id', 'gradient-background');
      var stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      stop1.setAttribute('stop-color', 'rgba(0, 0, 0, 0.2)');
      stop1.setAttribute('offset', '0%');
      linearGradientBackground.appendChild(stop1);
      var stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
      stop2.setAttribute('stop-color', 'rgba(0, 0, 0, 0.05)');
      stop2.setAttribute('offset', '100%');
      linearGradientBackground.appendChild(stop2);
      defs.appendChild(linearGradient);
      defs.appendChild(linearGradientBackground);
      this.svg.appendChild(defs);
      this.defs = defs;
  };

  RingDial.prototype.createSlice = function() {
      var slice = document.createElementNS("http://www.w3.org/2000/svg", "path");
      slice.setAttribute('fill', 'none');
      slice.setAttribute('stroke', `url(#gradient${this.opts.labelText})`);
      slice.setAttribute('stroke-width', this.strokeWidth);
      slice.setAttribute('transform', 'translate(' + this.strokeWidth / 2 + ',' + this.strokeWidth / 2 + ')');
      slice.setAttribute('class', 'animate-draw');
      this.svg.appendChild(slice);
      this.slice = slice;
  };

  RingDial.prototype.createOverlay = function() {
      var r = this.size - (this.size / 2) - this.strokeWidth / 2;
      var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute('cx', this.size / 2);
      circle.setAttribute('cy', this.size / 2);
      circle.setAttribute('r', r);
      if(navigator.vendor.includes('Apple')){
        circle.setAttribute('fill', 'rgba(0, 0, 0, 0.05)');
      }else
         circle.setAttribute('fill', 'url(#gradient-background)');
      this.svg.appendChild(circle);
      this.overlay = circle;
  };

  RingDial.prototype.createText = function(c) {
      var fontSize = this.size / 3.5;
      var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute('x', (this.size / 2) + fontSize / 7.5);
      text.setAttribute('y', (this.size / 2) + fontSize / 4);
      text.setAttribute('font-size', fontSize);
      text.setAttribute('fill', c);
      text.setAttribute('text-anchor', 'middle');
      var tspanSize = fontSize / 3;
      text.innerHTML = 0 + `<tspan font-size=${tspanSize} dy=${-tspanSize * 1.2}>${this.opts.suffix}</tspan>`;
      this.svg.appendChild(text);
      this.text = text;
  };

  RingDial.prototype.createLabel = function(c) {
      let n=4.5;
      if(this.opts.labelText.length>8)n=7;
      var fontSize = this.size / n;
      var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute('x', this.size / 2);
      text.setAttribute('y', (2*this.size / 3) + fontSize / (n-1));
      text.setAttribute('font-family', 'Century Gothic, Lato');
      text.setAttribute('font-size', fontSize);
      text.setAttribute('fill', c);
      text.setAttribute('text-anchor', 'middle');
      text.innerHTML = this.opts.labelText;
      this.svg.appendChild(text);
      this.label = text;
  };

  RingDial.prototype.createArrow = function() {
      var arrowSize = this.size / 10;
      var arrowYOffset, m;
      if(this.direction === 'up') {
          arrowYOffset = arrowSize / 2;
          m = -1;
      }
      else if(this.direction === 'down') {
          arrowYOffset = 0;
          m = 1;
      }
      var arrowPosX = ((this.size / 2) - arrowSize / 2);
      var arrowPosY = (this.size - this.size / 3) + arrowYOffset;
      var arrowDOffset =  m * (arrowSize / 1.5);
      var arrow = document.createElementNS("http://www.w3.org/2000/svg", "path");
      arrow.setAttribute('d', 'M 0 0 ' + arrowSize + ' 0 ' + arrowSize / 2 + ' ' + arrowDOffset + ' 0 0 Z');
      arrow.setAttribute('fill', '#97F8F0');
      arrow.setAttribute('opacity', '0.6');
      arrow.setAttribute('transform', 'translate(' + arrowPosX + ',' + arrowPosY + ')');
      this.svg.appendChild(arrow);
      this.arrow = arrow;
  };

  RingDial.prototype.animateStart = function() {
      var v = 0;
      var self = this;
      var intervalOne = setInterval(function() {
          var p = +(v / self.value).toFixed(2);
          var a = (p < 0.95) ? 2 - (2 * p) : 0.05;
          v += a;
          // Stop
          if(v >= +self.value) {
              v = self.value;
              clearInterval(intervalOne);
          }
          self.setValue(v);
      }, 10);
  };

  RingDial.prototype.animateTo = function(to,s=3,t=0.1) {
      let m=this.opts.max;
      s*=m/100;
      t*=m/100;
      if(to>m)to=m;
      if(to<0)to=0;
      var v = this.value;
      var self = this;
      this.isAnimating = true;
      var intervalOne = setInterval(function() {
          var p =  (v>to)? +(to /v).toFixed(2)  : +(v / to).toFixed(2);
          var a = (p < 0.95) ? s - (s * p) : t;
          if(to<v){
            v -= a;
              // Stop
              if(v <= -to) {
                  self.value = to;
                  clearInterval(intervalOne);
                  self.cachedValue = self.value;
                  self.isAnimating = false;
              }
          }else {
             v += a;
              // Stop
              if(v >= +to) {
                  self.value = to;
                  if(to>=self.opts.max){
                    self.svg.currentScale=0;
                    setTimeout(e=>{
                      self.setValue(self.opts.max);
                      self.svg.currentScale=1;
                    },100);
                  }
                  clearInterval(intervalOne);
                  self.cachedValue = self.value;
                  self.isAnimating = false;
              }
          }
          self.setValue(v);
      }, 10);
  };

  RingDial.prototype.changeBy = function(amt) {
     this.targetValue = this.targetValue?this.targetValue+amt:this.value+amt;
     this.animateTo(this.targetValue);
  };

  RingDial.prototype.animateReset = function() {
      this.setValue(0);
  };

  RingDial.prototype.polarToCartesian = function(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  RingDial.prototype.describeArc = function(x, y, radius, startAngle, endAngle){
      var start = this.polarToCartesian(x, y, radius, endAngle);
      var end = this.polarToCartesian(x, y, radius, startAngle);
      var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
      var d = [
          "M", start.x, start.y, 
          "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
      ].join(" ");
      return d;       
  };

  RingDial.prototype.setValue = function(value) {	
  		var c = (value / this.opts.max) * 360;
  		if(c === 360)
  			c = 359.99;
  		var xy = this.size / 2 - this.strokeWidth / 2;
  		var d = this.describeArc(xy, xy, xy, 180, 180 + c);
      this.slice.setAttribute('d', d);
      var tspanSize = (this.size / 3.5) / 3;
      this.text.innerHTML = Math.floor(value) + `<tspan font-size=${tspanSize} dy=${-tspanSize * 1.2}>${this.opts.suffix}</tspan>`;
      this.value = value;
  };

  class Meter{

    constructor(container,labelText='label',color='white',value=0,min=0,max=1,low=0.25,high=0.75,optimum=0.8){
      this.widget = document.createElement('div');
      this.widget.style.fontSize = 2000/9/4.5 + 'px';
      this.widget.style.marginTop = 2000/81 + 'px';
      this.widget.style.marginBottom = 2000/81 + 'px';
      this.widget.style.color = color;
      this.value = 0;
      this.min = parseFloat(min);
      this.max = parseFloat(max);
      this.range = max-min;
      this.el = document.createElement('meter');
      this.el.cachedValue = this.value;
      this.el.targetValue = false;
      this.el.isAnimating = false;
      this.el.setAttribute('value',value);
      this.el.setAttribute('min',min);
      this.el.setAttribute('max',max);
      this.el.setAttribute('low',low);
      this.el.setAttribute('high',high);
      this.el.setAttribute('optimum',optimum);
      this.el.style.width = 1250/8 + 'px';
      this.el.style.height = 1250/32 + 'px';
      this.widget.appendChild(this.el);
      this.label = document.createElement('div');
      this.label.style.textAlign = 'center';
      this.label.innerHTML = labelText;
      this.widget.appendChild(this.label);
      container.appendChild(this.widget);
    }
    
    animateTo(to) {
        var v = parseFloat(this.el.getAttribute('value'));
        var self = this.el;
        self.range = this.range;
        self.isAnimating = true;
        var intervalOne = setInterval(function() {
            var p =  (v>to)? +(to /v).toFixed(4)  : +(v / to).toFixed(4);
            var a = (p < 0.95) ? self.range/30 - (self.range/30 * p) : 0.003;
            if(to<v){
              
              v -= a;
                // Stop
                if(v <= -to) {
                    self.value = to;
                    if(to<=0)self.setValue(0);
                    clearInterval(intervalOne);
                    self.cachedValue = self.value;
                    self.isAnimating = false;
                }
            }else {
               v += a;
                // Stop
                if(v >= +to) {
                    self.value = to;
                    if(to>=100)self.setValue(100);
                    clearInterval(intervalOne);
                    self.cachedValue = self.value;
                    self.isAnimating = false;
                }
            }
            self.value = v;
            this.value = v;
        }, 10);
    };
    
    changeBy(amt) {
       this.el.targetValue = this.el.targetValue?this.el.targetValue+amt:this.el.cachedValue+amt;
       this.animateTo(this.el.targetValue);
    }
    


  }

  var stats = CS1=>{

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
     {
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
     return containers;
    }
    
    });
    
  };

  var gameName = "CS1 Community Park";
  var welcomeMsg = "Welcome to CS1 Community Park . . . . . . Please join us at 9pm for some tasty roasted ... marshmallow smores.";
  var playerLeftMsg = "... has packed up and headed for home.";
  var theme = {
  	fontFamily: "Arial",
  	titleFontColor: "#C4A43C",
  	formColor: "#fff",
  	formFontColor: "white",
  	formButtonColor: "#A82F1E",
  	overlayColor: "rgba(0,0,0, 0.9)",
  	fontSize: 2,
  	logo: "https://cdn.glitch.com/a66c3f5c-9aba-45c0-952e-ccc59d8b0df3%2FCS1_logo_64.png?v=1564891473540"
  };
  var avatar = {
  	models: [
  		{
  			type: 1,
  			url: "https://cdn.glitch.com/7001d18b-ab06-4934-84ee-f9bc0645e42c%2Fchip_eyes_pack.glb?1553596528401",
  			thumbnail: "https://cdn.glitch.com/fec96da0-7526-4b9a-aecf-3abbbe7fcdc5%2Fchip.png?v=1567384714024",
  			name: "Chip",
  			scale: 0.75,
  			yOffset: 0.1,
  			animations: {
  				idle: "idle",
  				walk: "walk"
  			},
  			msg: {
  				color: "orange",
  				offset: "0 4 0"
  			}
  		},
  		{
  			type: 1,
  			url: "https://cdn.glitch.com/fec96da0-7526-4b9a-aecf-3abbbe7fcdc5%2Fmel.glb?v=1567388543651",
  			thumbnail: "https://cdn.glitch.com/fec96da0-7526-4b9a-aecf-3abbbe7fcdc5%2Fmel.png?v=1567389128396",
  			name: "Mel",
  			scale: 0.75,
  			yOffset: 0.1,
  			animations: {
  				idle: "idle",
  				walk: "walk"
  			},
  			msg: {
  				color: "orange",
  				offset: "0 4 0"
  			}
  		},
  		{
  			type: 2,
  			url: "https://cdn.glitch.com/984a335f-9425-469e-8978-85c88c06d624%2Fboz_head.glb?v=1566741683664",
  			lefthand: "https://cdn.glitch.com/984a335f-9425-469e-8978-85c88c06d624%2Fboz_lefthand.glb?v=1566749593952",
  			righthand: "https://cdn.glitch.com/984a335f-9425-469e-8978-85c88c06d624%2Fboz_righthand.glb?v=1566749593705",
  			thumbnail: "https://cdn.glitch.com/fec96da0-7526-4b9a-aecf-3abbbe7fcdc5%2Fvr.png?v=1567383953311",
  			name: "VR-1",
  			scale: 1,
  			yOffset: 0,
  			animations: {
  				idle: "idle",
  				walk: "walk"
  			},
  			msg: {
  				color: "orange",
  				offset: "0 1.75 0"
  			}
  		}
  	]
  };
  var sounds = {
  	playerJoined: {
  		url: "https://cdn.glitch.com/c6f972e4-0e71-47c3-85c6-30f0ce9dcba1%2Fthunder.mp3?v=1562601088647"
  	},
  	playerLeft: {
  		url: "https://cdn.glitch.com/c6f972e4-0e71-47c3-85c6-30f0ce9dcba1%2Fthunder.mp3?v=1562601088647"
  	}
  };
  var bgm = {
  	songs: [
  		247087410
  	],
  	volume: 0.2,
  	playAll: true,
  	initialDelay: 5000
  };
  var voice = {
  	name: "Google UK English Female",
  	rate: 1,
  	pitch: 1,
  	volume: 1,
  	welcomeDelay: 4000
  };
  var config = {
  	gameName: gameName,
  	welcomeMsg: welcomeMsg,
  	playerLeftMsg: playerLeftMsg,
  	theme: theme,
  	avatar: avatar,
  	sounds: sounds,
  	bgm: bgm,
  	voice: voice
  };

  var game = CS1 => {
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
          CS1.socket.emit("logall", {
            msg: `${CS1.myPlayer.name} is playing with an Oculus VR device!`,
            channel: "0"
          });
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
              CS1.log("Mobile");
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
            if(vrDevice){
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

  var player = CS1=>{
    
    AFRAME.registerSystem('player', {
    schema: {
      avatars:{default:config.avatar.models}
    },  // System schema. Parses into `this.data`.

    init: function () {
      
      function avatarType2Add(p,c){
        
        p.model.removeAttribute('gltf-model');

        
        if(!p.HEAD){
          
          
          p.HEAD = document.createElement('a-gltf-model');
          p.HAND_L = document.createElement('a-gltf-model');
          p.HAND_R = document.createElement('a-gltf-model');
          
          p.model.appendChild(p.HEAD);
          p.model.appendChild(p.HAND_L);
          p.model.appendChild(p.HAND_R);
          
          p.HEAD.setAttribute('src',c.url);
          p.HAND_L.setAttribute('src',c.lefthand);
          p.HAND_R.setAttribute('src',c.righthand);
          
        }else{
          p.HEAD.setAttribute('visible',true);
          p.HAND_L.setAttribute('visible',true);
          p.HAND_R.setAttribute('visible',true);
        }
        
        
      }
      
      
      CS1.__addOtherPlayer = newPlayerObject=>{
        console.log(`Adding new player with id: ${newPlayerObject.id}`);
        console.log(newPlayerObject);
        console.log(newPlayerObject.data);
        let c = config.avatar.models[newPlayerObject.data.faceIndex];
        let p = document.createElement('a-entity');
        p.model = document.createElement('a-gltf-model');
        p.avatarType = c.type;
        p.faceIndex = newPlayerObject.data.faceIndex;
        p.device = newPlayerObject.data.device;
        p.appendChild(p.model);
        p.setAttribute('player','');
        p.model.setAttribute('shadow','');
        p.model.setAttribute('scale',`${c.scale} ${c.scale} ${c.scale}`);
        p.model.setAttribute('visible','true');
        if(p.avatarType === 1){
          
           
          p.model.setAttribute('src',`${c.url}`);
          p.model.setAttribute('animation-mixer','clip:idle');
          p.model.setAttribute('rotation',`${-newPlayerObject.data.rotation.x} ${newPlayerObject.data.rotation.y+180} ${newPlayerObject.data.rotation.z}`);
          
        } else if(p.avatarType === 2){
           
          avatarType2Add(p,c);
         
         
        }
          
        p.id = newPlayerObject.id;
        p.name = newPlayerObject.name;
        p.setAttribute('position',`${newPlayerObject.data.position.x} ${newPlayerObject.data.position.y} ${newPlayerObject.data.position.z}`);
        //DO SOMETHING MAYBE HERE WITH AVATAR TYPE 2
        p.msg = document.createElement('a-entity');
        let test = `Hello\nI am\n${newPlayerObject.name}!`;
        p.msg.setAttribute('text',`value:${test};
                                     align:center;
                                     width:8;
                                     wrap-count:24; 
                                     color:yellow`);
        p.msg.setAttribute('position',c.msg.offset);
        p.msg.setAttribute('rotation','0 0 0');
        p.model.appendChild(p.msg);
        CS1.scene.appendChild(p);
        CS1.otherPlayers[p.id]=p;
        CS1.sounds.playerJoined.play();
      };
    
      CS1.__updateOtherPlayers = o=>{
        Object.keys(o).forEach(function(key,index) {
          if(key != CS1.socket.id){
            if(CS1.otherPlayers[key]){
              let c = config.avatar.models[o[key].faceIndex];
              let op = CS1.otherPlayers[key];
              
              if(op.faceIndex != o[key].faceIndex){
                
                
                op.faceIndex = o[key].faceIndex;
                (c.type == 1)?op.model.setAttribute('src',c.url):op.model.setAttribute('src','');
                
                if(op.avatarType != c.type){
                  
                  op.avatarType = c.type;
                  
                  if(c.type == 1){
                    //op.model.object3D.rotateY(Math.PI);
                    //op.msg.setAttribute('rotation','0 0 0'); 
                    
                    if(op.HEAD){
                        op.HEAD.setAttribute('visible',false);
                        op.HAND_L.setAttribute('visible',false);
                        op.HAND_R.setAttribute('visible',false);
                      }
                    op.model.setAttribute('animation-mixer','clip:idle');
                    op.model.object3D.position.y = 0;
                    
                    
                  }  
                  else{
                    
                    op.model.setAttribute('rotation','0 0 0');  
                    avatarType2Add(op,c);
                  }
                      
                  
                    
                }
                
                
              }
              op.setAttribute('position',`${o[key].position.x} ${o[key].position.y+c.yOffset} ${o[key].position.z}`);
              op.model.setAttribute('scale',`${c.scale} ${c.scale} ${c.scale}`);
              op.msg.setAttribute('text',`color:${c.msg.color}`);
              if(    op.avatarType===2 &&   op.HEAD  &&  (op.device === 'Oculus Quest')   ){
                
                
                op.model.object3D.rotation.set(0,  THREE.Math.degToRad(o[key].rotation.y+180), 0 );
                if(op.isWalking){ 
                    op.model.object3D.position.y = Math.cos(CS1.myPlayer.timePlayed/100)/10;
                }
                
                op.msg.object3D.position.set(0,3,0);
                op.HEAD.object3D.position.y = 1.4;
                op.HEAD.object3D.rotation.set( THREE.Math.degToRad(-o[key].rotation.x/2), 0, 0 );
                
                op.HAND_L.object3D.position.set(-1.2*o[key].lhp.x , 1.2*o[key].lhp.y+0.1, -3*o[key].lhp.z);
                op.HAND_L.object3D.rotation.set(THREE.Math.degToRad(-o[key].lhr.x+45) , 
                                                THREE.Math.degToRad(o[key].lhr.y-90) , 
                                                THREE.Math.degToRad(o[key].lhr.z)
                                               );
                op.HAND_R.object3D.position.set(-1.2*o[key].rhp.x  , 1.2*o[key].rhp.y+0.1 , -3*o[key].rhp.z); 
                op.HAND_R.object3D.rotation.set(THREE.Math.degToRad(-o[key].rhr.x+45) , 
                                                THREE.Math.degToRad(o[key].rhr.y+90) , 
                                                THREE.Math.degToRad(o[key].rhr.z)
                                               );
                

                
              }
              else if(op.avatarType===2 && op.HEAD){  // TYPE 2 WITHOUT OCULUS
                
                op.msg.setAttribute('position',`${c.msg.offset}`);
                
                op.model.object3D.rotation.set(0,  THREE.Math.degToRad(o[key].rotation.y+180), 0 );
                if(op.isWalking){ 
                    op.model.object3D.position.y = 1.4 + Math.cos(CS1.myPlayer.timePlayed/100)/10;
                }
                else op.model.object3D.position.y = 1.4;
                
                op.HEAD.object3D.rotation.set( THREE.Math.degToRad(-o[key].rotation.x/2), 0, 0 );
                
                op.HAND_L.object3D.position.set(1 , 0 , 0);
                op.HAND_L.object3D.rotation.set(THREE.Math.degToRad(0) , 
                                                THREE.Math.degToRad(0) , 
                                                THREE.Math.degToRad(0)
                                               );
                op.HAND_R.object3D.position.set(-1  , 0 , 0);
                op.HAND_R.object3D.rotation.set(THREE.Math.degToRad(0) , 
                                                THREE.Math.degToRad(0) , 
                                                THREE.Math.degToRad(0)
                                               );
              
            
                
                
              }
              else if(op.avatarType===1){
                op.msg.setAttribute('position',`${c.msg.offset}`);
                op.model.setAttribute('rotation',`${-o[key].rotation.x/8} ${o[key].rotation.y+180} ${o[key].rotation.z}`);  
              }
              
              
              
            }
          }
        });
      };
    
      CS1.__removePlayer = id=>{
        CS1.otherPlayers[id].parentNode.removeChild(CS1.otherPlayers[id]);
        delete CS1.otherPlayers[id]; 
        CS1.sounds.playerLeft.play();
      };
    
      CS1.__setPlayerMessage = data=>{
        if(CS1.otherPlayers[data.id]){
          let c = config.avatar.models[CS1.otherPlayers[data.id].faceIndex];
          CS1.otherPlayers[data.id].msg.setAttribute('text',`value:${data.msg};
        align:center;width:8;wrap-count:24;color:${c.msg.color}`);
        }
      };
      
    },

   
  });
    
    AFRAME.registerComponent('player', {
      schema:{
        me:{type:'boolean',default:false},
        eyelevel:{default:1.6},
        cursorcolor:{default:'crimson'},
        rayobjects:{default:'[grabbable],.screen,.collidable,.jukebox'},
        rayfar:{default:4},
        speed:{default:0.2}
      },
      init: function () {
        const self = this;
        if(this.data.me){
          CS1.myPlayer = this.el;
          this.addCam(self);
          this.addHands(self);
          this.isWalking=false;
          this.addMyListeners();
          this.el.timePlayed = 0;
          this.el.setAttribute('chat','');
          this.el.setAttribute('userdata','');
          CS1.myPlayer.spawnPos = this.el.getAttribute('position');
          CS1.myPlayer.spawnRot = this.el.getAttribute('rotation');
          this.totalSteps = 0;
          this.active = false;
        }
      
      },
      addCam: function(self){
        const ic = document.querySelector('[camera][wasd-controls]');
        ic.removeAttribute('wasd-controls');
        ic.removeAttribute('look-controls');
        ic.setAttribute('camera','active:false');
        //console.log(ic);
        self.cam = document.createElement('a-entity');
        self.cam.id = 'cam';
        CS1.cam = self.cam;
        self.cam.setAttribute('camera','active:true');
        self.cam.setAttribute('position',`0 ${this.data.eyelevel} 0`);
        self.cam.setAttribute('look-controls','pointerLockEnabled:true;reverseTouchDrag:true');
        const cc = document.createElement('a-cursor');
        cc.id = 'cam-cursor';
        cc.setAttribute('material',`color:${this.data.cursorcolor}`);
        cc.setAttribute('raycaster',`objects:${this.data.rayobjects};far:${this.data.rayfar}`);
        self.cam.appendChild(cc);
        self.el.appendChild(self.cam);
        self.cam.addEventListener('loaded',_=>{
          ic.parentNode.removeChild(ic);
        });
      },
      addHands: function(self){
        self.lh = document.createElement('a-entity');
        self.lh.setAttribute('laser-controls','hand:left');
        //self.lh.setAttribute('position','-1 0 0');
        //self.lh.setAttribute('oculus-touch-controls','hand:left');
        self.lh.setAttribute('raycaster',`objects:${this.data.rayobjects};far:${this.data.rayfar};useWorldCoordinates:true`);
        self.rh = document.createElement('a-entity');
        self.rh.setAttribute('laser-controls','hand:right');
        //self.rh.setAttribute('position','1 0 0');
        //self.rh.setAttribute('oculus-touch-controls','hand:right');
        self.rh.setAttribute('raycaster',`objects:${this.data.rayobjects};far:${this.data.rayfar};useWorldCoordinates:true`);
        self.el.appendChild(self.lh);
        self.el.appendChild(self.rh);
      },
      addMyListeners: function(){
        let self = this;
        CS1.myPlayer.setAttribute('movement-controls',`speed:0;camera:#cam`);
        document.addEventListener('gameStart',e=>{
          //console.log('Handling gameStart on my player.');
          self.el.id = CS1.socket.id;
          self.el.classList = 'my-player';
          self.active = true;
          
          
          
          if(CS1.device == 'Oculus Quest'){
            self.setOculusCtls();
            CS1.scene.enterVR();
            this.lh.addEventListener('model-loaded',e=>{
              
              this.lh.loaded = true;
              

              const object = this.lh.getObject3D('mesh');
              
              if (object) {
                object.traverse(function (node) {
                  if (node.isMesh && node.name === 'stick') ;
                 });
              }
              
              
              
              
            });
          }
          if(CS1.device == 'Mobile'){
            this.setTouchCtls();
          }
          if(CS1.device == 'Standard'){
            this.setKeyCtls();
          }
            
            
          
          self.setSpeed(self.data.speed);
          
  //         CS1.sounds.playerJoined.onended = ()=>{
  //           CS1.myPlayer.setAttribute('movement-controls',`speed:${self.data.speed};camera:#cam`);
  //         }

          CS1.sounds.playerJoined.play()
          .catch(err=>{
            //CS1.myPlayer.setAttribute('movement-controls',`speed:${self.data.speed};camera:#cam`);            
          });
          
          
          //let c = config.avatar.models[0];
          let playerData = {};
          let pos = Object.assign({},CS1.myPlayer.getAttribute('position'));
          pos.x = Number(pos.x.toFixed(2));
          pos.y = Number(pos.y.toFixed(2))+0.3;
          pos.z = Number(pos.z.toFixed(2));
          playerData.position = pos;
          let rot = Object.assign({},CS1.cam.getAttribute('rotation'));
          rot.x = Number(Number(rot.x).toFixed(1));
          rot.y = Number(Number(rot.y).toFixed(1));
          rot.z = Number(Number(rot.z).toFixed(1));
          playerData.rotation = rot;
          playerData.faceIndex = 1;
          playerData.device = CS1.device;
          CS1.socket.playerData.faceIndex = playerData.faceIndex;
          CS1.myPlayer._avatarType = config.avatar.models[CS1.socket.playerData.faceIndex].type;
          if(    (CS1.device == 'Oculus Quest') &&  (CS1.myPlayer._avatarType === 2)  ){
            playerData.lhp = {x:0,y:0,z:0};
            playerData.lhr = {x:0,y:0,z:0};
            playerData.rhp = {x:0,y:0,z:0};
            playerData.rhr = {x:0,y:0,z:0};
          }
          CS1.socket.emit('new-player',playerData);
          
          
          
          
          
          
          
          
        });
      },
      setKeyCtls: function(){
        document.body.addEventListener('keydown',e=>{
          // 0=idle, 1=walk
           switch(e.which){
             case 87:
             case 38:
             case 83:
             case 40:
               if(!this.isWalking){
                 CS1.socket.emit('anim',1);
                 this.isWalking=true;    
               }       
           }
        });
        document.body.addEventListener('keyup',e=>{
          // 0=idle, 1=walk
           switch(e.which){
             case 87:
             case 38:
             case 83:
             case 40:
               CS1.socket.emit('anim',0);
               this.isWalking=false;
           }
        });
      },
      setTouchCtls: function(){
        window.addEventListener('touchstart',e=>{
          if(!this.isWalking){
                 CS1.socket.emit('anim',1);
                 this.isWalking=true;    
               }    
        });
        window.addEventListener('touchend',e=>{
           CS1.socket.emit('anim',0);
           this.isWalking=false;
        });
      },
      setOculusCtls: function(){
        
        let lh = this.lh.components["oculus-touch-controls"];
        let rh = this.rh.components["oculus-touch-controls"];
          
        
        setTimeout(()=>{
          
          
          if(AFRAME.utils.device.checkHeadsetConnected()){
            lh.el.addEventListener('thumbsticktouchstart',e=>{
               if(!this.isWalking){
                     CS1.socket.emit('anim',1);
                     this.isWalking=true;    
                   }   
            });
            lh.el.addEventListener('thumbsticktouchend',e=>{
               CS1.socket.emit('anim',0);
               this.isWalking=false; 
            });
            rh.el.addEventListener('thumbsticktouchstart',e=>{
               if(!this.isWalking){
                     CS1.socket.emit('anim',1);
                     this.isWalking=true;    
                   }   
            });
            rh.el.addEventListener('thumbsticktouchend',e=>{
               CS1.socket.emit('anim',0);
               this.isWalking=false; 
            });
          }
          
          
          
        },3000);
        
        
      },
      tick: function(t,dt){
        
      if(!this.data.me && this.active)return;
        
      if(++this.totalSteps%6 == 0) {
        
        
        let playerData = {};
        let pos = Object.assign({},CS1.myPlayer.getAttribute('position'));
        pos.x = Number(pos.x.toFixed(2));
        pos.y = Number(pos.y.toFixed(2));
        pos.z = Number(pos.z.toFixed(2));
        playerData.position = pos;
        let rot = Object.assign({},CS1.cam.getAttribute('rotation'));
        rot.x = Number(Number(rot.x).toFixed(1));
        rot.y = Number(Number(rot.y).toFixed(1));
        rot.z = Number(Number(rot.z).toFixed(1));
        playerData.rotation = rot;
        playerData.faceIndex = (CS1.socket.playerData)?CS1.socket.playerData.faceIndex:0;
        if(   (CS1.device == 'Oculus Quest') &&  (CS1.myPlayer._avatarType === 2)  && this.lh.hasLoaded ){
            
            let lhp = this.lh.getAttribute('position');
              
            playerData.lhp = {};
            playerData.lhp.x = Number(lhp.x.toFixed(2));
            playerData.lhp.y = Number(lhp.y.toFixed(2));
            playerData.lhp.z = Number(lhp.z.toFixed(2));
            let lhr = this.lh.getAttribute('rotation');
            playerData.lhr = {};
            playerData.lhr.x = Number(lhr.x.toFixed(1));
            playerData.lhr.y = Number(lhr.y.toFixed(1));
            playerData.lhr.z = Number(lhr.z.toFixed(1));
            let rhp = this.rh.getAttribute('position');
            playerData.rhp = {};
            playerData.rhp.x = Number(rhp.x.toFixed(2));
            playerData.rhp.y = Number(rhp.y.toFixed(2));
            playerData.rhp.z = Number(rhp.z.toFixed(2));
            let rhr = this.rh.getAttribute('rotation');
            playerData.rhr = {};
            playerData.rhr.x = Number(rhr.x.toFixed(1));
            playerData.rhr.y = Number(rhr.y.toFixed(1));
            playerData.rhr.z = Number(rhr.z.toFixed(1));
          
        }
        CS1.socket.setPlayerData(playerData);
        CS1.socket.sendUpdateToServer();
        if(this.totalSteps%36 == 0 && CS1.hud && CS1.hud.oxygenMeter){
          CS1.hud.oxygenMeter.animateTo(CS1.hud.oxygenMeter.el.value-0.0035);
        }
        
        
      }
        
        
      this.el.timePlayed += dt;
        
        
      },
      setSpeed: function(s){
        if(document.querySelector('#navmesh'))
          this.el.setAttribute('movement-controls',`constrainToNavMesh: true; speed: ${s}`);
        else
          this.el.setAttribute('movement-controls',`speed: ${s}`);  
      }
      
    });
    
    
    
    AFRAME.registerPrimitive('a-player', {
    defaultComponents: {
      player: {me:true},
    },

    // Maps HTML attributes to component properties.
    mappings: {
      eyelevel: 'player.eyelevel',
      cursorcolor: 'player.cursorcolor',
      rayobjects: 'player.rayobjects',
      rayfar: 'player.rayfar',
      speed: 'player.speed'
    }
  });
    
    
    
    
    
    
    
    
    
    
  };



  /*
  <a-entity id="my-player" 
                position="0 0 0"
                movement-controls="constrainToNavMesh: true; speed: 0.2"
                player="me:true"
                chat
                userdata>
        
          <a-entity id="cam"
                  camera
                  position="0 1.6 0"
                  rotation="31.283 -12.834 0"
                  look-controls="pointerLockEnabled:true;reverseTouchDrag:true">
          
            <a-cursor id="cam-cursor" 
                      material="color:crimson"
                      raycaster="objects:[grabbable],[sign-in],[iot-api], .screen, .collidable;far:4"></a-cursor>

          </a-entity>
          
          <a-entity id="left-hand" position="0 1 0" laser-controls="hand: left"  
                  raycaster="objects:[grabbable],[sign-in],[iot-api], .screen, .collidable;far:4;useWorldCoordinates:true" ></a-entity>
          
        
  <a-entity id="right-hand" position="0 1 0" laser-controls="hand: right"  
                  raycaster="objects:[grabbable],[sign-in],[iot-api], .screen, .collidable;far:4;useWorldCoordinates:true" ></a-entity>
          
          
            
  </a-entity>
  */



  /*


  p.model.addEventListener('model-loaded', () => { 
          
            const object = p.model.getObject3D('mesh');


            if (object) {
              object.traverse(function (node) {
                
                switch(node.name){
                  case 'BODY': p.BODY = node;
                    break;
                  case 'HAND_L': p.HAND_L = node;
                    break;
                  case 'HAND_R': p.HAND_R = node;
                    break;
                  case 'HEAD': p.HEAD = node;
                    break;
                }
         
               });
            }
          
          
          
          });


  */

  function bgmlite(CS1){
    let tracks = config.bgm.songs;
    let audio = document.createElement('audio');
    let bgmUrlStart = 'https://api.soundcloud.com/tracks/';
    let bgmUrlEnd = '/stream?client_id=b9d11449cd4c64d461b8b5c30650cd06'; 
    let nextSongBtn = document.createElement('button');
    nextSongBtn.innerHTML = "PLAY NEXT SONG";
    nextSongBtn.zIndex = 100;
    nextSongBtn.style.display = "none";
    nextSongBtn.addEventListener('click',e=>{
      CS1.bgm.playNext();
    });
    let ui = document.createElement('div');
    ui.style.margin = '0 auto';
    ui.style.width = '800px';
    setTimeout(()=>{
     document.body.appendChild(ui);
     ui.appendChild(nextSongBtn);
    },5000);
    
    {
     audio.addEventListener('ended',e=>{
      console.log('bgm song ended');
      CS1.bgm.playNext();
     });
  }
    
  let currentSongIndex = 0;
    
    CS1.bgm = {
      audio:audio,
      tracks: tracks,
      play: ()=>{
        audio.play();
        audio.volume = config.bgm.volume;
      },
      playTrackIndex: n=>{
        currentSongIndex=n;
        audio.src = bgmUrlStart + tracks[currentSongIndex] + bgmUrlEnd;
        audio.crossorigin = 'anonymous';
        audio.load();
        audio.loop = !config.bgm.playAll;
        audio.play();
        audio.volume = config.bgm.volume;
      },
      pause: ()=>{
        audio.pause();
      },
      playNext: ()=>{
        currentSongIndex++;
        if(currentSongIndex == tracks.length) currentSongIndex = 0;
        audio.src = bgmUrlStart + tracks[currentSongIndex] + bgmUrlEnd;
        audio.crossorigin = 'anonymous';
        audio.load();
        audio.loop = !config.bgm.playAll;
        audio.play();
        audio.volume = config.bgm.volume;
      },
      
    };//end of CS1.bgm definition
    
     document.addEventListener('gameStart',e=>{
      if(CS1.bgm.tracks.length) CS1.bgm.playTrackIndex(0);
    });

  }//end of bgmlite

  var socket = CS1=>{
    let socket = CS1.socket = io();
    socket.on('connect',()=>{

      if(socket.authid){
        
        socket.emit('reauth',socket.authid);
        socket.id = socket.authid;
        console.log('Emitting reauth!');
        console.log('socket.id : ',socket.id);
        console.log('socket.playerData : ');
        console.log(socket.playerData);
        console.log('socket.lastPlayerData : ');
        console.log(socket.lastPlayerData);
        socket.isInitialized = true;
        
      }else{
        
        socket.playerData = {position:{},rotation:{},faceIndex:0};
        socket.lastPlayerData = {position:{},rotation:{},faceIndex:0};
        //REVISIT
        CS1.login = (un,pw)=>{
            socket.emit('login',{name:un,pw:pw});
          };  
        
      }
      
      
      
      
    }); 
    
    socket.on('login-results',data=>{
      //console.log(data);
      if(data.success) {
        document.querySelector('#login').style.zIndex = -1;
        document.querySelector('#login').style.display = 'none'; 
        document.querySelector('#login').setAttribute('hidden','');
        CS1.myPlayer.name = data.name;
        CS1.game.start();
        socket.authid=socket.id;
      }
      else document.getElementById('login-msg').innerHTML = data.msg;
    });
    
    socket.on('anim', data=>{
      let clips = ['idle','walk'];
      if(CS1.otherPlayers[data.id]){
        
        CS1.otherPlayers[data.id].isWalking = data.anim;
        if(CS1.otherPlayers[data.id].avatarType===1)
          CS1.otherPlayers[data.id].firstElementChild.setAttribute('animation-mixer',`clip:${clips[data.anim]}`);
        
      }
    });
    
    socket.on('avatar', data=>{
      if(CS1.otherPlayers[data.id])
        CS1.otherPlayers[data.id].components.player.setAvatar(data.avatar);
    });
      
    socket.on('disconnect', ()=>{
      console.log('I have disconnected.');
      //socket.isInitialized = false;
    });
    
    socket.initializePlayerData = playerData=>{
      socket.isInitialized = true;
      socket.playerData = playerData;
      socket.playerData.faceIndex = 0;
      socket.emit('new-player', playerData);
    };
    
    socket.setPlayerData = playerData=>{
      socket.playerData = Object.assign({},playerData);
    };
    
    socket.on('new-player', newPlayerObject=>{
      if(CS1.debug)console.log('New player object received: ', newPlayerObject);
      if(CS1.game.hasBegun && newPlayerObject.id != CS1.socket.id) {
        setTimeout(()=>{CS1.say(`${newPlayerObject.name} has joined the game!`);},1000);
        CS1.__addOtherPlayer(newPlayerObject);
      }
    });
    
    socket.on('initial-bodies-state', data=>{
      if(CS1.debug){
        console.warn('SETTING INITIAL BODIES STATE');
        console.log(data);
      }
      CS1.__updateGrabbables(data);
    });
    
    const isEqual=CS1.utils.isEqual;
    //Object.is(socket.playerData, socket.lastPlayerData)
    socket.sendUpdateToServer = ()=>{
      
      
      if(!AFRAME.utils.deepEqual( socket.lastPlayerData , socket.playerData )){
        
        
        socket.emit('send-update',socket.playerData);
        
        socket.lastPlayerData = Object.assign({},socket.playerData);
        
        let bodiesData = [];
        for(var name in CS1.grabbables){
          let b = CS1.grabbables[name];
          if(b.states.includes("moving") || b.dirty){
            let d = {
              name: name,
              position: b.object3D.position,
              scale: b.object3D.scale,
              rotation: { 
                x: b.object3D.quaternion.x,
                y: b.object3D.quaternion.y,
                z: b.object3D.quaternion.z,
                w: b.object3D.quaternion.w,
              },
              soundState: b.soundState
            };
            b.dirty = false;
            bodiesData.push(d);
          }
        }
        if(bodiesData.length > 0) {
          socket.emit('update-bodies',bodiesData);
          if(CS1.debug){
            console.log(`SENDING ${bodiesData[0].name} DATA TO SERVER`);
            console.log(bodiesData);
          } 
        }
        
        
        
      }
      

      
    };
    
    socket.on('players-already-here', o=>{
      if(CS1.debug){
        console.log('receiving players already here');
        console.log(o);
      }
      Object.keys(o).forEach(function(key,index) {
        CS1.__addOtherPlayer({"id":key,
          "name":o[key].name,
          "data":{"position": o[key].position,
                  "rotation": o[key].rotation,
                  "faceIndex":o[key].faceIndex}
          });
      });
      setTimeout(()=>{CS1.say(CS1.game.announcements.welcome);},CS1.game.welcomeDelay);
    });
    
    socket.on('request-for-bodies', ()=>{
    let ibs = {};
    for(name in CS1.grabbables){
      if (!CS1.grabbables.hasOwnProperty(name)) continue;
      let b = CS1.grabbables[name];
      ibs[name] = {
            name: name,
            position: b.object3D.position,
            scale: b.object3D.scale,
            rotation: { 
              x: b.object3D.quaternion.x,
              y: b.object3D.quaternion.y,
              z: b.object3D.quaternion.z,
              w: b.object3D.quaternion.w,
            },
            soundState: b.soundState
          };
    }
      socket.emit('initial-bodies-state',ibs);
      if(CS1.debug){
        console.warn('SENDING INITIAL BODIES STATE TO SERVER');
        console.log(ibs);
      }
  });
    
    socket.on('update-bodies', grabbablesData=>{
      if(CS1.game.hasBegun)CS1.__updateGrabbables(grabbablesData);
    });
    
    socket.on('update-players', playersObject=>{
      if(CS1.game && CS1.game.hasBegun)CS1.__updateOtherPlayers(playersObject);
    });

    socket.on('remove-player',id=>{
      if(CS1.game.hasBegun && CS1.otherPlayers[id]){
        let name = CS1.otherPlayers[id].name;
        CS1.__removePlayer(id);
        setTimeout(()=>{CS1.say(`${name} ${config.playerLeftMsg}`);},1500);
      }
    });
    
    socket.on('msg',data=>{
      if(CS1.game.hasBegun)CS1.__setPlayerMessage(data);
    });
    
    socket.on('failed-socket',()=>{
      window.location.reload();
    });
    
    socket.on('log',msg=>{console.log(msg);});
    
    socket.on('say',data=>{
      CS1.say(data.msg,data.name);
    });
    


    
  };

  var collectible = CS1=>{
    
    AFRAME.registerSystem('collectible', {
    schema: {},  // System schema. Parses into `this.data`.

    init: function () {
      
      CS1.collectibles=[];
     
      CS1.socket.on('collect',data=>{
        if(!(CS1.game && CS1.game.hasBegun))return;
        let collectedEntity = CS1.collectibles[data.index];
        if(!collectedEntity)return;
        if(collectedEntity.el.components.sound__loop)collectedEntity.el.components.sound__loop.pause();
        collectedEntity.el.setAttribute('visible',false);
        //collectedEntity.el.setAttribute('scale','0 0 0');
        collectedEntity.soundIsPlaying=true;
        collectedEntity.el.components.sound__collect.playSound();
        if(collectedEntity.data.cb && !AFRAME.utils.device.isMobile()){
          CS1.game[collectedEntity.data.cb](collectedEntity.el);
        }
        collectedEntity.el.addEventListener('sound-ended',e=>{
          collectedEntity.soundIsPlaying=false;
          collectedEntity.pause();     
        });
        if(data.collector==CS1.socket.id && collectedEntity.data.affects){  
          if(collectedEntity.data.affects.includes('avatar')){
             let s;
             switch(collectedEntity.el.id){
               case 'avatar-upgrade-1':
                 s=0.35;
                 break;
               case 'avatar-upgrade-2':
                 s=0.5;
             }
             CS1.myPlayer.components.player.setSpeed(s);
             console.log('speed boost');
          }else  
          CS1.stats[collectedEntity.data.affects].changeBy(collectedEntity.data.value);
        }
        if( (data.collector!=CS1.socket.id) && (collectedEntity.data.affects=='avatarUpgrade')){  
           console.log(CS1.otherPlayers[data.collector]);
          let m,t;
           switch(collectedEntity.el.id){
             case 'avatar-upgrade-1':
                m = document.querySelector('#avatar-to-clone-1').cloneNode();
                t = 'Skully';
                break;
             case 'avatar-upgrade-2':
                m = document.querySelector('#avatar-to-clone-2').cloneNode();
                t = 'Speedy';
           }
          
           let op = CS1.otherPlayers[data.collector];
           m.appendChild(op.msg);
           op.msg.setAttribute('text',`value:${t};
                                   align:center;
                                   width:8;
                                   wrap-count:24; 
                                   color:yellow`);
           m.setAttribute('visible',true);
           op.appendChild(m);
           op.removeChild(op.model);
           op.model = m;
           
        }
      });
      
      CS1.socket.on('spawn-collectible',index=>{
        let collectedEntity = CS1.collectibles[index];
        if(collectedEntity.el.components.sound__loop)collectedEntity.el.components.sound__loop.play();
        collectedEntity.el.setAttribute('visible',true);
        //collectedEntity.el.setAttribute('scale','1 1 1');
        collectedEntity.play();
      });

      CS1.socket.on('request-for-collectibles',()=>{
        let d=[];
        CS1.collectibles.forEach(c=>{
          d.push({spawns:c.data.spawns,spawnDelay:c.data.spawnDelay});
        });
        CS1.socket.emit('initial-collectibles-state', d);
      });
      
      
      
      
      
    },

   
  });
    
    
    AFRAME.registerComponent("collectible", {
  	schema: {
      threshold: {type: 'number', default: 2.7},
      soundCollect: {type: 'string',default:'https://cdn.glitch.com/f8abb766-9950-44ff-9adb-2f5f53fdaf1b%2Fpowerup_1.mp3?1552158629039'},
      soundLoop: {},
      cb:{type:'string',default:''},
      affects:{type:'string',default:''},
      value:{type:'number',default:1},
      spawns:{type:'boolean',default:false},
      spawnDelay:{type:'number',default:5}
  	},
  	init: function()
  	{
      
      this.el.setAttribute('sound__collect',`src:url(${this.data.soundCollect})`);
      if(this.data.soundLoop)this.el.setAttribute('sound__loop',`src:url(${this.data.soundLoop});autoplay:true;loop:true`);
      CS1.collectibles.push(this);
      console.log('running collectible init');
      this.soundIsPlaying=false;
      
      
        
    }, 
  	tick: function()
  	{   
       if((this.el.object3D.position.distanceTo(CS1.myPlayer.object3D.position) < this.data.threshold)&&
            this.data.affects!='avatarUpgrade'){ 
         this.collect();
       }
       if(this.data.affects=='avatarUpgrade' &&
          (this.el.parentElement.object3D.position.distanceTo(CS1.myPlayer.object3D.position) < this.data.threshold) ){
         this.collect();
       }
  		
  	},
    
    collect: function(){
      if(this.soundIsPlaying)return;
      if(CS1.socket.disconnected){
        if(this.el.components.sound__loop)this.el.components.sound__loop.pause();
        this.el.setAttribute('visible',false);
        this.el.setAttribute('scale','0 0 0');
        this.soundIsPlaying=true;
        this.el.components.sound__collect.playSound();
        if(this.data.cb)CS1.game[this.data.cb](this.el);
        if(this.data.affects && this.data.affects !== 'avatarUpgrade')
          CS1.stats[this.data.affects].animateTo(CS1.stats[this.data.affects].value+this.data.value);
        this.el.addEventListener('sound-ended',e=>{
          this.soundIsPlaying=false;
          this.pause();   
        }); 
        if(this.data.spawns){
               setTimeout(()=>{
                  if(this.el.components.sound__loop)this.el.components.sound__loop.play();
                  this.el.setAttribute('visible',true);
                  this.el.setAttribute('scale','1 1 1');
                  this.play();
               },this.data.spawnDelay*1000);
             }
      } else{
        CS1.socket.emit('request-collection',{index: CS1.collectibles.indexOf(this)}); 
      
      }
   
    }
    
    
  });
    
  };

  (() => {
    window.onload = e => {
      let loginHTML = `
<div class="modal fade" id="login-modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" style="display: block;background-color:${config.theme.overlayColor}">
    <div class="modal-dialog">
		  <div class="loginmodal-container" style="background-color:${config.theme.formColor}">
          <image id="logo" src=${config.theme.logo} width="64px">
          <h3 id="gamename" style="color:${config.theme.titleFontColor}">${config.gameName}</h3>
			<div>	  
					<input  placeholder="username" class="q1">
          <input  placeholder="password" type="password" class="q2"> 
          <button id="lb" style="background-color:${config.theme.formButtonColor}">Submit</button> 
          <div style="color:${config.theme.formButtonColor}" id="login-msg"></div> 
      </div>				

			</div>
	</div>
</div>
`;
      document.title = config.gameName;
      let loginContainer = document.querySelector("#login");
      loginContainer.innerHTML = loginHTML;
      document.querySelector("a-scene").addEventListener("loaded", function() {
        document.querySelector(".q1").focus();
        if (!navigator.onLine) {
          document.getElementById("login-msg").innerHTML = "OFFLINE MODE";
          document.querySelector("#lb").setAttribute("value", "Play Game Offline");
        }
      });
      document.getElementById("lb").addEventListener("click", login);
      document.querySelector(".q2").addEventListener("keydown", e => {
        if (e.code == "Enter") login(e);
      });

      function login(e) {
        e.preventDefault();
        if (!(CS1 && CS1.socket.connected)) {
          if (CS1 && !CS1.socket.connected) {
            CS1.socket.close();
          }
          loginContainer.style.zIndex = -1;
          loginContainer.setAttribute("hidden", "");
          CS1.myPlayer.components.player.setSpeed(0.2);
          CS1.game.start();
          CS1.sounds.playerJoined.play();
          setTimeout(() => {
            CS1.say(CS1.game.announcements.welcome);
          }, CS1.game.welcomeDelay);
        } else if (
          document.querySelector(".q1").value.length > 0 &&
          document.querySelector(".q2").value.length > 0
        ) {
          if (navigator.vendor.includes("Apple")) {
            CS1.sounds.playerJoined.play().catch(err => {
              console.log(err);
            });
          }
          CS1.login(
            document.querySelector(".q1").value,
            document.querySelector(".q2").value
          );
          document.querySelector(".q1").value = "";
          document.querySelector(".q2").value = "";
        }
      }
    };
  })();

  ((function cloud(){
    
    
  AFRAME.registerComponent('cloud', {
    schema:{
     color: {type:'string',default:'blue'}
    },
    init: function () {
      const el = this.el;
      el.setAttribute('material', 'shader','cloud-shader');
      el.setAttribute('material', 'myColor', this.data.color);
    },
    update: function () {
      this.el.setAttribute('material', 'myColor', this.data.color);
    }
  });

  // from https://github.com/hughsk/glsl-noise/blob/master/periodic/3d.glsl
  const pnoise3 = `

//
// GLSL textureless classic 3D noise "cnoise",
// with an RSL-style periodic variant "pnoise".
// Author:  Stefan Gustavson (stefan.gustavson@liu.se)
// Version: 2011-10-11
//
// Many thanks to Ian McEwan of Ashima Arts for the
// ideas for permutation and gradient selection.
//
// Copyright (c) 2011 Stefan Gustavson. All rights reserved.
// Distributed under the MIT license. See LICENSE file.
// https://github.com/ashima/webgl-noise
//

vec3 mod289(vec3 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x)
{
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x)
{
  return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}

// Classic Perlin noise, periodic variant
float pnoise3(vec3 P, vec3 rep)
{
  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period
  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period
  Pi0 = mod289(Pi0);
  Pi1 = mod289(Pi1);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 * (1.0 / 7.0);
  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 * (1.0 / 7.0);
  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
  return 2.2 * n_xyz;
}

`;

  AFRAME.registerShader('cloud-shader', {
    schema: {
      timeMsec: {type:'time', is:'uniform'},
      myOffset: {type:'vec3', is:'uniform'},
      myColor: {type:'color', is:'uniform', default:'pink'}
    },
    vertexShader: pnoise3 + `

//
// Based on @thespite's article:
// 
// "Vertex displacement with a noise function using GLSL and three.js"
// Source: https://www.clicktorelease.com/blog/vertex-displacement-noise-3d-webgl-glsl-three-js/
//

varying float noise;
uniform float timeMsec; // A-Frame time in milliseconds.
uniform vec3 myOffset;

float turbulence( vec3 p ) {

  float w = 100.0;
  float t = -.5;

  for (float f = 1.0 ; f <= 10.0 ; f++ ){
    float power = pow( 2.0, f );
    t += abs( pnoise3( vec3( power * p ), vec3( 10.0, 10.0, 10.0 ) ) / power );
  }

  return t;

}

void main() {
  float time = timeMsec / 1000.0; // Convert from A-Frame milliseconds to typical time in seconds.
  noise = 10.0 *  -.10 * turbulence( .5 * normal + time / 3.0 );
  float b = 5.0 * pnoise3( 0.05 * position, vec3( 100.0 ) );
  float displacement = (- 10. * noise + b) / 50.0;

  vec3 newPosition = position + normal * displacement + myOffset;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
}

`,
    fragmentShader: `

varying float noise;
uniform vec3 myColor;

void main() {

  vec3 color = myColor  - vec3(2. * noise);
  gl_FragColor = vec4( color.rgb , 1.0 );

}

`
  });

    
    
    
    
    
    
    
    
  })());

  var npc = CS1=>{
    
    AFRAME.registerComponent('npc', {
      schema:{
        waypoints:{type:'array'},
        name:{type:'string'},
        roam:{type:'boolean',default:false}
      },
      init: function () {
        this.waypoints=this.data.waypoints;
        this.waypointsIndex=0;
        this.moves=0;
        if(this.data.name){
          this.name = this.data.name;
        }else{
          this.name = (CS1.npc)? `npc${CS1.npc.length}`:'npc0';
        }
        if(CS1.npc){
          CS1.npc[this.name]=this;
        }else{
          CS1.npc={};
          CS1.npc[this.name]=this;
        }
        this.addListeners();
        CS1.socket.emit('register-npc',{name:this.name,waypoints:this.waypoints});
        if(this.data.roam)this.requestMove();
      },
      addListeners: function(){
        let self = this;
        this.el.addEventListener('navigation-end',this.onNavigationEnd.bind(self));
        if(!CS1.socket._callbacks["$npc-move"])
        CS1.socket.on('npc-move',data=>{
          if(data.dest===self.dest)return;
          CS1.npc[data.name].dest = data.dest;
          CS1.npc[data.name].setPosition(data.pos);
          CS1.npc[data.name].move(data.dest);
        });
      },
      setWaypoints: function(waypointsArray){
        this.waypoints = waypointsArray;
        CS1.socket.emit('set-npc-waypoints',{name:this.name,waypoints:waypointsArray});
      },
      addWaypoint: function(waypoint){
        this.waypoints.push(waypoint);
        CS1.socket.emit('add-npc-waypoint',{name:this.name,waypoint:waypoint});
      },
      move: function (destination=false) {
        this.moves++;
        let s;
        let dest={};
        if(destination){
          s = destination;
        }else{
          s=this.waypoints[this.waypointsIndex];
        }
        if(!s){
            console.error('You must define some waypoints for your npc to roam! < npc component >');
            return;
        }else{
            let a = s.split(' ');
            dest.x=a[0];
            dest.y=a[1];
            dest.z=a[2];
            if (dest) this.el.setAttribute('nav-agent', {
              active: true,
              destination: dest,
              speed: 2
            });
        
        }
      },
      setPosition: function (position) {
        this.el.setAttribute('position',position);
      },
      tick: function(t,dt){
      
       
      },
      requestMove: function (dest=''){
        CS1.socket.emit('npc-move',{
            name:this.name,
            pos:this.el.getAttribute('position'),
            dest:dest 
        });
      },
      onNavigationEnd: function(e){
        //this.dest=false;
        //console.log(`NPC Navigation has ended for ${this.name}.`)
        //console.log(e);
        this.waypointsIndex++;
        if( this.waypointsIndex==this.waypoints.length)this.waypointsIndex=0;
        let d = this.waypoints[this.waypointsIndex];
        if(this.data.roam)this.requestMove(d);
      }
    });
    
  };

  ((function dotrow(){
     
  AFRAME.registerComponent('dotrow', {
    schema:{
     change: {type:'string',default:'x'},
     to: {type:'number',default:10}
    },
    init: function () {
      
      let changeDimension = this.data.change;
      let to = this.data.to;
      let elPosition = this.el.getAttribute('position');
      let from = elPosition[changeDimension];
      let delta = (to>from)?2:-2;
      let cdIsX = (changeDimension=='x');
      
      //console.log(`preparing to add dots from ${from} to ${to} in the ${changeDimension} dimension with a delta of ${delta}.`);
      
      this.dots = [];

      let scn = document.querySelector('a-scene');
      
      for(let i = from;i*(delta/2) < to*(delta/2); i += delta){
        //console.log('adding dot...');
        let c = document.createElement('a-sphere');
        c.setAttribute('position',(cdIsX)?`${i} 1 ${elPosition.z}`:`${elPosition.x} 1 ${i}`);
        c.setAttribute('shader-frog', 'name:Ova_Shader');
        c.setAttribute('radius', '0.5');
        c.setAttribute('collectible','affects:pointsDial;value:10;threshold:1.6');  
        scn.appendChild(c);
        this.dots.push(c);
        
      }
      
      this.firstInitTime = Date.now();
      
    },
    update: function(){

       if((Date.now()-this.firstInitTime)<5000)return;
       console.log('updating dotrow...');
       
       this.dots.forEach(
         d=>{
           d.parentNode.removeChild(d);
         }
       );
       this.init();
    
    }
    
  });

  })());

  var userdata = CS1=>{
     
  AFRAME.registerComponent('userdata', {
    init: function () {
      //{avatar:'Mary'}
      CS1.db = {};
      CS1.db.set = (keyValueObject,cb)=>{
        CS1.socket.emit('db-set', keyValueObject, cb);
      };
      //'avatar'
      CS1.db.get = (key,cb)=>{
        CS1.socket.emit('db-get', key, cb);
      };
    }
    
  });

  };

  var iotAPI = CS1=>{
    
    AFRAME.registerComponent('iot-api', {
      schema:{
        LED:{type:'string',default:'on'}
      },
      init: function () {   
        const self = this;
        this.el.addEventListener('click',e=>{
          console.log('Click detected on LED.');
          self.toggleLED();
        }); 
        CS1.iot = {};
        CS1.iot.set = (keyValueObject,cb)=>{
         CS1.socket.emit('iot-set', keyValueObject, cb);
        };
        CS1.iot.get = (key,cb)=>{
          CS1.socket.emit('iot-get', key, cb);
        };
        CS1.socket.on('iot-update', data=>{
          
          console.log('LED update');
          if(data.LED == 'on'){
            this.onLED();
          }else{   
            this.offLED();
          }
        
        });
        CS1.iot.get('LED',v=>{
          
          console.log('LED INITIALIZE');
          if(v == 'on'){
            this.onLED();
          }else{   
            this.offLED();
          }
        
        });
      },
      setLED: function (state) {
        
      },
      offLED: function(){
        let mat = 'color:#551818;emissiveIntensity:0';
        this.data.LED = 'off';
        this.el.setAttribute('material',mat);
      },
      onLED: function(){
        let mat = 'color:red;emissiveIntensity:4'; 
        this.data.LED = 'on';
        this.el.setAttribute('material',mat);
      },
      toggleLED: function () {
        if(this.data.LED == 'on'){
          this.offLED();
          CS1.iot.set({LED:'off'},()=>{});
        }else{   
          this.onLED();
          CS1.iot.set({LED:'on'},()=>{});
        }
         
      },
      tick: function(t,dt){
      
       
      }
    });
    
  };

  (()=>{

  AFRAME.registerSystem('log', {
  	  schema: {
  	    console: {default: true}
  	  },

  	  init: function () {
  	    var data = this.data;
  	    var logs = this.logs = [];
  	    var loggers = this.loggers = [];

  	    // Register global function for logging.
  	    window.CS1.log = function (message, channel) {
  	      logs.push([message, channel]);
  	      loggers.forEach(function (loggerComponent) {
  	        loggerComponent.receiveLog(message, channel);
  	      });

  	      if (data.console) {
  	        console.log('[log:' + (channel || '') + '] ' + message);
  	      }
  	    };
        
        window.CS1.socket.on('vr-log',data=>{
          window.CS1.log(data.msg,data.channel);
        });
        
        window.CS1.logall = function (message, channel){
          window.CS1.socket.emit('logall',{msg:message,channel:channel});    
        };
        
        
  	  },

  	  registerLogger: function (component) {
  	    this.loggers.push(component);
  	    this.logs.forEach(function (log) {
  	      component.receiveLog.apply(component, log);
  	    });
  	  },

  	  unregisterLogger: function (component) {
  	    this.loggers.splice(this.loggers.indexOf(component), 1);
  	  }
  	});

  	/**
  	 * In-VR logging using text component.
  	 */
  	AFRAME.registerComponent('log', {
  	  schema: {
  	    channel: {type: 'string'},
  	    filter: {type: 'string'},
  	    max: {default: 100},
  	    showErrors: {default: true}
  	  },

  	  init: function () {
  	    this.logs = [];
  	    this.system.registerLogger(this);
  	  },

  	  play: function () {
  	    var self = this;

  	    // Listen for `<a-scene>.emit('log')`.
  	    this.el.sceneEl.addEventListener('log', function (evt) {
  	      if (!evt.detail) { return; }
  	      self.receiveLog(evt.detail.message, evt.detail.channel);
  	    });

  	    window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
  	      self.receiveLog('Error: ' + errorMsg);
  	    };
  	  },

  	  receiveLog: function (message, channel) {
  	    var data = this.data;

  	    // Coerce to string.
  	    if (typeof message !== 'string') {
  	      message = JSON.stringify(message);
  	    }

  	    // Match with ID if defined in data or event detail.
  	    if (data.channel && channel && data.channel !== channel) { return; }

  	    // Apply filter if `filter` defined.
  	    if (data.filter && message.indexOf(data.filter) === -1) { return; }

  	    // Add log.
  	    this.logs.push(message);

  	    // Truncate logs if `max` defined.
  	    if (data.max && this.logs.length > data.max) { this.logs.shift(); }

  	    // Update text. Each log gets its own line.
  	    this.el.setAttribute('text', {value: this.logs.join('\n')});
        
  	  },

  	  remove: function () {
  	    this.el.removeAttribute('text');
  	    this.system.unregisterLogger(this);
  	  }
  	});
    
  })();

  (()=>{
    
    AFRAME.registerSystem('launchable', {
    schema: {},  // System schema. Parses into `this.data`.

    init: function () {

      CS1.socket.on('launch-sound',name=>{
        if(CS1.grabbables[name] && CS1.grabbables[name].components.sound__launch)
          CS1.grabbables[name].components.sound__launch.playSound();
      });
      
      CS1.socket.on('launch-complete',name=>{
        CS1.grabbables[name].components.grabbable.isDragging = false;
      });
      
    },

    
  });
    
    AFRAME.registerComponent('launchable', {
      schema:{
        burst:{type:'boolean',default:true},
        launchSound:{type:'string',default:'https://cdn.glitch.com/83b7f985-f6ce-40dd-ac98-772aff98ebbf%2Fwoosh.mp3'}
      },
      // will listen for the grabbable release event 
      dependencies: ['grabbable'],
      
      init: function () {
        
        this.name = this.el.components.grabbable.name;
        console.log(`Launchable added with name: ${this.name}.`);
        
        let self = this;
        
        this.grabbable = self.el.components.grabbable;
        
        self.el.setAttribute('sound__launch',`src:url(${this.data.launchSound})`);
        
        self.el.addEventListener('grabEnd',e=>{
          self.launch();
        });
        
        
        
        
           
      },
      
      getDir: function(){
       if(CS1.device == 'Oculus Quest'){
         let d = this.grabbable.cursor.components.raycaster.raycaster.ray.direction;
         d.x *= -1;
         d.y *= -1;
         d.z *= -1;
         return d;
       }else{
         return this.grabbable.cursor.object3D.getWorldDirection(); 
       }
       
      },
      
      launch: function(dir){
        CS1.socket.emit('logall',{msg:`${CS1.myPlayer.name} launched grabbable ${this.el.components.grabbable.name}!`,channel:'0'});
        this.el.components.grabbable.isDragging = true; // can't grab while it is in launch
        const launchData = {name:this.name,dir:(dir)?dir:this.getDir()};
        CS1.socket.emit('launch',launchData);
      }
      
      
    });

  })();

  ((function launchrow(){
     
  AFRAME.registerComponent('launchrow', {
    schema:{
     change: {type:'string',default:'x'},
     to: {type:'number',default:10}
    },
    init: function () {
      
      let changeDimension = this.data.change;
      let to = this.data.to;
      let elPosition = this.el.getAttribute('position');
      let from = elPosition[changeDimension];
      let delta = (to>from)?4:-4;
      let cdIsX = (changeDimension=='x');
      
      //console.log(`preparing to add dots from ${from} to ${to} in the ${changeDimension} dimension with a delta of ${delta}.`);
      
      this.dots = [];

      let scn = document.querySelector('a-scene');
      
      for(let i = from;i*(delta/2) < to*(delta/2); i += delta){
        //console.log('adding dot...');
        let c = document.createElement('a-sphere');
        c.setAttribute('position',(cdIsX)?`${i} 1.4 ${elPosition.z}`:`${elPosition.x} 1.4 ${i}`);
        c.setAttribute('shader-frog', 'name:Disco_Shader');
        c.setAttribute('radius', '1');
        c.setAttribute('collectible','affects:energyDial;value:-10;threshold:1.6');
        c.setAttribute('grabbable','');
        c.setAttribute('launchable','');  
        scn.appendChild(c);
        this.dots.push(c);
        
      }
      
      this.firstInitTime = Date.now();
      
    },
    update: function(){

       if((Date.now()-this.firstInitTime)<5000)return;
       console.log('updating dotrow...');
       
       this.dots.forEach(
         d=>{
           d.parentNode.removeChild(d);
         }
       );
       this.init();
    
    }
    
  });

  })());

  var styles = "<link href=\"https://fonts.googleapis.com/css?family=Roboto&display=swap\" rel=\"stylesheet\">\n <style>\n body{\n   font-family: 'Roboto', sans-serif;\n   \n   font-size: 32px;\n }\n h1{\n   font-size: 52px;\n }\n .dark{\n   background-color: rgba(0,0,0,0.2);\n   border-radius:50px;  \n   background-repeat: no-repeat;\n   background-position: bottom right;\n   padding: 40px;\n   color: #fff;\n }\n .main{\n   width: 1024px;\n   height: 900px;\n   overflow: hidden;\n }\n.main ul{\n   font-size: 26px;\n   margin: 0;\n   padding: 0;\n }\n .menu{\n   width: 256px;\n   height: 900px;\n   text-align: center;\n }\n .menu ul{\n   list-style-type: none;\n   margin: 0;\n   padding: 0;\n }\n .menu button,.main button{\n   display: inline-block;\n   width: 100%;\n   height: 100px;\n   border-radius: 20px;\n   background-color: #000;\n   color: #fff;\n   text-decoration: none;\n   text-align: center;\n   font-size: 32px;\n   padding: 10px 0;\n   margin-bottom: 20px;\n }\n .menu button:hover,.main button:hover{\n   background-color: #fff;\n   color: #888;\n }\n .menu button:active,.main button:active{\n   background-color: #fff;\n   color: #888;\n   box-shadow: 0px 0px 50px #00d2ff;\n }\n .imgLink{\n   width: 100%;\n   border-radius: 20px;\n   color: #fff!important;\n   text-decoration: none!important;\n   text-align: center;\n   padding: 10px 0;\n   margin-bottom: 20px;\n   background-color: #444;\n   border: 3px solid #444;\n   text-shadow: none;\n   display: block;\n }\n .imgLink:hover{\n   border: 3px solid #000;\n   background-color: #fff;\n   color:#000!important;\n }\n.imgLink:active{\n   background-color: #fff;\n   box-shadow: 0px 0px 50px #00d2ff;\n   color:#000!important;\n }\n.imgLink img , .imgLink div{\n  pointer-events: none;\n}\n .code{\n   white-space: pre;\n   font-size: 0.7em;\n   background-color: #000;\n   margin-bottom: 30px;\n }\n </style>\n";

  var panels = "<a-entity id=\"menu1\" class=\"screen menu dark\"  position=\"-2.712 1.5 -1.476\" rotation=\"0 45 0\">\n  <h2>Menu</h2>\n  <ul>\n    <li><button id=\"menu1-b1\" >Stats</button></li>\n    <li><button id=\"menu1-b2\" >Mission</button></li>\n    <li><button id=\"menu1-b3\" >Control Panel</button></li>\n    <li><button id=\"menu1-b4\" >Limitations</button></li>\n  </ul>\n</a-entity>\n<a-entity id=\"main\" class=\"screen dark main\" position=\"0 1.5 -2\"></a-entity>\n<a-entity id=\"menu2\" class=\"screen menu dark\" position=\"2.712 1.5 -1.476\" rotation=\"0 -45 0\">\n  <h2>Avatars</h2>\n  <a id=\"menu2-b1\" class=\"imgLink\" href=\"#\">\n    <img id=\"m2-b1-img\" crossorigin=\"anonymous\"   src=\"./\" width=\"80\" height=\"80\">\n    <div id=\"m2-b1-name\"></div>\n  </a>\n  <a id=\"menu2-b2\" class=\"imgLink\" href=\"#\">\n    <img id=\"m2-b2-img\" crossorigin=\"anonymous\"  src=\"./\" width=\"80\" height=\"80\">\n    <div id=\"m2-b2-name\"></div>\n  </a>\n  <a id=\"menu2-b3\" class=\"imgLink\" href=\"#\">\n    <img id=\"m2-b3-img\" crossorigin=\"anonymous\" src=\"./\" width=\"80\" height=\"80\">\n    <div id=\"m2-b3-name\"></div>\n  </a>\n</a-entity>\n";

  var page2 = "<h1>Mission</h1>\n<p>Roam the virtual world looking for mission clues. Be nice and helpful to everyone you meet.</p>\n<p>Once you have gathered enough clues and your mission is clear, gather the neccessary resources and fulfill your calling. 🦄</p>\n           \n  ";

  var page3 = "<h1>Control Panel</h1>\n\n<button onclick='CS1.ui.controls.showBox()'>👩‍Show/Hide Current Avatar Box👩‍</button> \n\n<button onclick='CS1.ui.controls.addBlasterBall()'>💥Blaster Ball💥</button> \n\n<button onclick='CS1.ui.controls.addMagicPellet()'>🔮Magic Pellet🔮</button>\n";

  var page4 = "  <h1>Limitations</h1>\n  <ul>\n      <li>All styles and images must be in the same origin or allow access via CORS; this allows the component to embed all of the assets required to render the html properly to the canvas via the foreignObject element. </li>\n      <li>transform-style css is limited to flat. This is mainly due to it not being rendered properly to canvas so element bounding for preserve-3d has not yet been implemented. If the rendering is fixed as some point I may go back and get it working as well.</li>\n      <li>\"a-\" tags do not render correctly as XHTML embeded into SVG, so any parent \"a-\" elements of the embed html will be converted to div tags for rendering. This may mean your css will require modification.</li>\n      <li>Elements that require rendering outside of the DOM such as the iframe and canvas element will not work.</li>\n      <li>:before and :after pseudo elements can't be accessed via the DOM so they can't be used in the element to determine the object bounds. As such, use them with caution. </li>\n      <li>Form elements are not consistently rendered to the canvas element so some basic default styles are included for consistency.</li>\n      <li>Currently there is no support for css transitions.</li>\n</ul>\n";

  const controls = {
    init: function() {
      const m1 = document.querySelector("#menu1");
      const m = document.querySelector("#main");
      const m2 = document.querySelector("#menu2");
      const avatar1 = config.avatar.models[0];
      const avatar2 = config.avatar.models[1];
      const avatar3 = config.avatar.models[2];
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

  (()=>{

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
      };
      
      
     document.querySelector('#main').appendChild(w);  
        
      let scn = document.querySelector('a-scene');
      let ctr = document.querySelector('#embed-container');
      ctr.setAttribute('visible',false);
      ctr.setAttribute('position','0 0.3 0');
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
                 e.classList.remove('screen');
                });  
        
      
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
                 e.classList.remove('screen');
                });
              }else{
                document.querySelectorAll('.dark').forEach(e=>{
                 e.classList.add('screen');
                });
              }
            });
            rh.el.addEventListener('abuttondown',e=>{
              CS1.stats.container.object3D.rotation.y = CS1.cam.object3D.rotation.y;
              let v = CS1.stats.container.getAttribute('visible');
              CS1.stats.container.setAttribute('visible',!v); 
              if(v){
                document.querySelectorAll('.dark').forEach(e=>{
                 e.classList.remove('screen');
                });
              }else{
                document.querySelectorAll('.dark').forEach(e=>{
                 e.classList.add('screen');
                });
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
                 e.classList.remove('screen');
                });
              }else{
                document.querySelectorAll('.dark').forEach(e=>{
                 e.classList.add('screen');
                });
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
                 e.classList.remove('screen');
                });
              }else{
                document.querySelectorAll('.dark').forEach(e=>{
                 e.classList.add('screen');
                });
              }
          
        });
        
        
      }  
        
        
        
      });
      
         
      
    },

    
    
    
  });
    
  })();

  (()=>{

  AFRAME.registerComponent('chat', {
    schema: {
  	  inputColor: {default: '#fff'},
      keyboardColor: {default: '#fff'},
      highlightColor: {default: '#1a79dc'}
    },
    
    dependencies: ['aframe-keyboard'],
    
    init: function(){
      
      
      
      this.container = document.createElement('a-entity');
      this.container.setAttribute('visible',false);
      
      this.input = document.createElement('a-text');
      this.input.setAttribute('font','dejavu');
      this.input.setAttribute('color',this.data.inputColor);
      this.input.setAttribute('value','Enter message ...');
      this.input.setAttribute('scale','0.7 0.7 0.7');
      this.input.setAttribute('rotation','-20 0 0');
      this.input.setAttribute('position','-0.5 1.9 -1.5');
      
      this.keyboard = document.createElement('a-entity');
      this.keyboard.setAttribute('a-keyboard','dismissable:false');
      this.keyboard.setAttribute('position','-1 1.6 -1.5');
      this.keyboard.setAttribute('rotation','-20 0 0');
      this.keyboard.setAttribute('scale','4 4 4');
      
     
      this.container.appendChild(this.input);
      this.container.appendChild(this.keyboard);
      this.el.appendChild(this.container);
      
      
      
      const self = this;
      
      document.addEventListener('gameStart',e=>{
        
        self.normalKeys = document.querySelectorAll('.collidable');
            
        document.querySelectorAll('.collidable').forEach(e=>{
                   e.classList.remove('collidable');
                  });
              
          
        const dummy = document.querySelector('#standard-chat-dummy');
        
        self.value = '';
        
        function submit(){
          self.input.setAttribute('value', self.value);
              self.container.setAttribute('visible',false);
              document.querySelectorAll('.collidable').forEach(e=>{
                   e.classList.remove('collidable');
                  }); 
              self.keyboard.components['a-keyboard'].pause();
              document.removeEventListener('a-keyboard-update', updateInput);
              CS1.socket.emit('msg',{msg:self.value});
              dummy.blur(); 
        }
        
        function updateInput(e){
          let code = parseInt(e.detail.code);
          switch(code) {
            case 8:
              self.value = self.value.slice(0, -1);
              break
            case 999:
              submit();
              return
            case 13:
              submit();
              return 
            default:
              if(!e.detail.value)return;
              if(e.detail.code==40)e.detail.value='\n';
              self.value = self.value + e.detail.value;
              break
            }
            self.input.setAttribute('value', self.value + '_');
        }
        
        
        function submitQuest(){
          self.input.setAttribute('value', self.value);
              self.container.setAttribute('visible',false);
              document.querySelectorAll('.collidable').forEach(e=>{
                   e.classList.remove('collidable');
                  });
              self.keyboard.components['a-keyboard'].pause();
              document.removeEventListener('a-keyboard-update', updateInputQuest);
              CS1.socket.emit('msg',{msg:self.value});
        }
        
        
        function updateInputQuest(e){
          let code = parseInt(e.detail.code);
          switch(code) {
            case 8:
              self.value = self.value.slice(0, -1);
              break
            case 999:
              submitQuest();
              return
            default:
              if(!e.detail.value)return;
              if(e.detail.code==40)e.detail.value='\n';
              self.value = self.value + e.detail.value;
              break
            }
            self.input.setAttribute('value', self.value + '_');
        }
        
        let lh = CS1.myPlayer.components.player.lh.components["oculus-touch-controls"];
        let rh = CS1.myPlayer.components.player.rh.components["oculus-touch-controls"];
        
        switch(CS1.device){
            
          case "Oculus Quest":
            
            let cursor = document.querySelector('a-cursor');
            cursor.pause();
            if(CS1.cam.components.raycaster)CS1.cam.components.raycaster.pause();
            lh.el.addEventListener('bbuttondown',e=>{
              self.value = '';
              self.input.setAttribute('value', self.value);
              document.addEventListener('a-keyboard-update', updateInputQuest);
              self.container.object3D.rotation.y = CS1.cam.object3D.rotation.y;
              let v = self.container.getAttribute('visible');
              self.container.setAttribute('visible',!v);
              self.keyboard.components['a-keyboard'].play();
              if(v){
                 document.querySelectorAll('.collidable').forEach(e=>{
                   e.classList.remove('collidable');
                  });
              }else{
                self.keys.forEach(e=>{
                   e.classList.add('collidable');
                  }); 
              }
            });
            rh.el.addEventListener('bbuttondown',e=>{
              self.value = '';
              self.input.setAttribute('value', self.value);
              document.addEventListener('a-keyboard-update', updateInputQuest);
              self.container.object3D.rotation.y = CS1.cam.object3D.rotation.y;
              let v = self.container.getAttribute('visible');
              self.container.setAttribute('visible',!v);
              self.keyboard.components['a-keyboard'].play();
              if(v){
                 document.querySelectorAll('.collidable').forEach(e=>{
                   e.classList.remove('collidable');
                  });
              }else{
                AFK.template.toggleActiveMode('normal');
              }
            });  
            
            
            
            break;
          case "Mobile":
            CS1.chatInput = document.querySelector('#mobile-chat-input');
            CS1.chatInput.style.position = 'absolute';
            CS1.chatInput.style.top = '10px';
            CS1.chatInput.style.margin = '0 auto';
            
            CS1.chatInput.addEventListener('keydown',e=>{
              switch(e.keyCode){
                case 13:
                  CS1.socket.emit('msg',{msg:CS1.chatInput.value});
                  CS1.chatInput.style.zIndex = -1000;
                  CS1.chatInput.style.top = '-100px';
                  CS1.chatInput.blur();
                  break;
              }
            });
            document.addEventListener('doubleTapChat',e=>{
              
              if(CS1.chatInput.style.zIndex == -1000){
                CS1.chatInput.style.zIndex = 200;
                CS1.chatInput.style.top = '10px';
              }else{
                CS1.chatInput.style.zIndex = -1000;
                CS1.chatInput.style.top = '-100px';
              }

              

            });
            
            break;
          case "Standard":
            document.querySelector('#mobile-chat-input').setAttribute('style','position:absolute;top:-1000px');
            const dummy = document.querySelector('#standard-chat-dummy');
            document.addEventListener('keypress',e=>{
              if(e.keyCode==61){
                self.value = '';
                self.input.setAttribute('value', self.value);
                document.addEventListener('a-keyboard-update', updateInput);
                self.container.object3D.rotation.y = CS1.cam.object3D.rotation.y;
                let v = self.container.getAttribute('visible');
                self.container.setAttribute('visible',!v); 
                self.keyboard.components['a-keyboard'].play();
                if(v){
                 document.querySelectorAll('.collidable').forEach(e=>{
                   dummy.blur();
                   e.classList.remove('collidable');
                  });  
              }else{
                AFK.template.toggleActiveMode('normal');
                self.normalKeys.forEach(e=>{
                   dummy.focus();
                   e.classList.add('collidable');
                  });  
              }
              }
            });     
            break;
            
        }
        
        
      });
      
      
      
    },
    
   
    
    
  });
    
  })();

  (()=>{

  AFRAME.registerComponent('cs1-jukebox', {
    schema: {
  	
    },
    
    init: function(){
      CS1.jukebox.audio.addEventListener('jukeboxplay',e=>{
        CS1.socket.emit('jukebox',{action:'play',index:e.detail.index,player:CS1.myPlayer.name});
        CS1.log(`${CS1.myPlayer.name} is playing ${CS1.jukebox.songNames[e.detail.index]}.`);
      });
      CS1.jukebox.audio.addEventListener('jukeboxpause',e=>{
        CS1.socket.emit('jukebox',{action:'pause',player:CS1.myPlayer.name});
        CS1.log(`${CS1.myPlayer.name} has paused the jukebox.`);
      }); 
      CS1.socket.on('jukebox',data=>{
        if(data.player==CS1.myPlayer.name)return;
        switch(data.action){
          case 'play':
            CS1.jukebox.play(data.index);
            CS1.log(`${data.player} is playing ${CS1.jukebox.songNames[data.index]}!`);
            break;
          case 'pause':
            CS1.jukebox.pause(false);
            CS1.log(`${data.player} has paused the jukebox!`);
            break;
        }
      });
    }
  });
    
  })();

  (()=>{
    
  document.addEventListener('gameStart',e=>{
      

       
  });  

  AFRAME.registerComponent('mycomponent', {
    schema: {
  	myproperty: {default: true}
    },
    
    init: function(){
      
    }
  });
    
  })();

  let CS1$1 = window.CS1 = {};
  utils(CS1$1);
  shaderfrog(CS1$1);
  proximityGlitch(CS1$1);
  stats(CS1$1);
  game(CS1$1);
  player(CS1$1);
  bgmlite(CS1$1);
  socket(CS1$1);
  collectible(CS1$1);
  npc(CS1$1);
  userdata(CS1$1);
  iotAPI(CS1$1);

  //supress console.warn
  window.console.warn = function(){};

}());
//# sourceMappingURL=bundle.js.map
