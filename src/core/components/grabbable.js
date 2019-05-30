function findComponent(componentName)
{
	return document.querySelector(`[${componentName}]`).components[componentName];
}
//Moves the subject to a new parent while preserving its transform in the world
function reparentObject3D(subject, newParent)
{
	subject.updateMatrixWorld();
	subject.matrix.copy(subject.matrixWorld);
	subject.applyMatrix(new THREE.Matrix4().getInverse(newParent.matrixWorld));
	newParent.add(subject);
}
// Copys the world transforms between objects even if the have different parents
var copyTransform = (function()
{
	var scratchMat = new THREE.Matrix4();
	return function(source, destination)
	{
		destination.matrix.copy(source.matrixWorld);
		destination.applyMatrix(scratchMat.getInverse(destination.parent.matrixWorld));
	}
})();
function toVector(o)
{
	return new THREE.Vector3(o.x, o.y, o.z);
}
function toList(collection)
{
	var list = [];
	for(var i=0;i<collection.length;i++)
	{
		list.push(collection[i]);
	}
	return list;
}
function addDot(el, position, radius, color)
{
	color = color || "red";
	var dot = document.createElement("a-sphere");
	dot.setAttribute("radius", radius);
	dot.setAttribute("position", position);
	dot.setAttribute("color", color);
	el.appendChild(dot);
}
function directionLocalToWorld(object, localDirection)
{
	return localDirection.transformDirection(object.matrixWorld);
}

export default (function grabbable(){AFRAME.registerComponent("grabbable", {
	schema: {
		origin: { type: "selector" }
	},

	init: function()
	{
		var self = this;
		var isDragging = false;
		self.originEl = this.data.origin || this.el;
		self.proxyObject = null;

		self.el.classList.add("interactive");
    
    
    //use object to allow for further development
    if(!CS1.grabbables)CS1.grabbables={}; 
    self.name=Object.keys(CS1.grabbables).length;
    CS1.grabbables[self.name]=self.el;
    
    if(self.el.components.log){
      //this.el.components.log.data.channel = this.name;
      self.el.setAttribute('log',`channel:${String(self.name)}`)
      if(!CS1.socket._callbacks["$vr-log"])
      CS1.socket.on('vr-log',data=>{
        CS1.log(data.msg ,String(data.channel));
      });
    }

    //AFRAME.utils.device.checkHeadsetConnected ()
		//document.querySelector('#left-hand').components["oculus-touch-controls"].controllerPresent
  
    //setTimeout(()=>{
      
    self.el.addEventListener("mousedown", grab);
    self.el.addEventListener("mouseup", release);
      
    navigator.getVRDisplays().then(function(displays) {
      if(displays && displays[0] && (displays[0].displayName == "Oculus Quest")){
        document.querySelector('#cam-cursor').setAttribute('visible',false);
        document.querySelector('#cam-cursor').setAttribute('fuse',false);
        document.querySelector('#cam-cursor').pause();
        CS1.device = "Oculus Quest";
      }else{
        
        if(AFRAME.utils.device.isMobile()){
          CS1.device = "Mobile";
          self.el.addEventListener("click", function(e){
             grab(e);
             setTimeout(function(e){
               document.querySelector('#cam-cursor').setAttribute('material','color: purple');
               release(e);
               setTimeout(function(e){
                 document.querySelector('#cam-cursor').setAttribute('material','color: crimson');
               },500);
             },5000);
          });
      
          } else{ //No headset and not mobile
            CS1.device = "Standard";
            const el = self.el;

            el.addEventListener('mouseenter',e=>{
              document.querySelector('#cam-cursor').setAttribute('material', {color: 'green'});
            });
            el.addEventListener('mouseleave',e=>{
              document.querySelector('#cam-cursor').setAttribute('material', {color: 'crimson'})
            });



          } 
        
        
      }
    });
        
   // },3000);
    
    
    
    function grab(e){
      //console.log("GRABBING");
      CS1.socket.emit('vr-log',{msg:`${CS1.myPlayer.name} grabbing!` ,channel:self.name});
			e.cancelBubble = true;
			if(isDragging) return;
      
			isDragging = true;

			var cursor = e.detail.cursorEl;
			if(cursor == self.el.sceneEl) cursor = document.querySelector("[camera]"); //This handles the scenario where the user isn't using motion controllers
      // avoid seeing flickering at origin during reparenting
      self.el.setAttribute('visible', false);
      setTimeout(function(){
        self.el.setAttribute('visible', true);
      },20);

			createProxyObject(cursor.object3D);
			
			self.originEl.emit("grabStart", e);
			self.originEl.addState("moving");
		}

		if(AFRAME.utils.device.checkHeadsetConnected () ){ 
      self.el.addEventListener("mouseup", release);
    }
    else self.el.addEventListener("mouseup", release);
    
    function release(e)
		{
			if(isDragging)
			{ CS1.socket.emit('vr-log',{msg:`${CS1.myPlayer.name} releasing!` ,channel:self.name});
				isDragging = false;

				if(self.proxyObject)
				{
					self.proxyObject.parent.remove(self.proxyObject);
					self.proxyObject = null;
				}

				self.originEl.setAttribute("position", self.originEl.getAttribute("position")); //seems pointless, but will force the event system to notify subscribers
				self.originEl.setAttribute("rotation", self.originEl.getAttribute("rotation")); //seems pointless, but will force the event system to notify subscribers

				self.originEl.emit("grabEnd", e);
				self.originEl.removeState("moving");
			}
		}

		function createProxyObject(cursorObject)
		{
			self.proxyObject = new THREE.Object3D();
      self.originEl.visible = false;
      //handle object momentary flicker at world origin
      setTimeout(function(){
        self.originEl.visible = true;
      },1000);
			cursorObject.add(self.proxyObject);
			copyTransform(self.originEl.object3D, self.proxyObject);				
		}
    
    if(!CS1.updateGrabbables)
    CS1.updateGrabbables = (grabbablesData)=>{
        //console.log('Update Grabbables');
        //console.log(grabbablesData);
        if(Object.keys(CS1.grabbables).length === 0 || !CS1.grabbables[grabbablesData[0].name] || !CS1.game.hasBegun) return;
        grabbablesData.forEach( (d,index)=>{
          let b = CS1.grabbables[d.name];
          if(CS1.debug){
            console.log('Individual body data from server:');
            console.log(d);
          } 
          if(d.position) b.object3D.position.copy(d.position);
          if(d.scale) b.object3D.scale.copy(d.scale);
          if(d.rotation) b.object3D.quaternion.copy(d.rotation);
      
        });
      }
    
    
    
	},

	tick: function()
	{
		var self = this;
		if(self.proxyObject)
		{
			copyTransform(self.proxyObject, self.originEl.object3D);
			self.originEl.setAttribute("position", self.originEl.getAttribute("position")); //seems pointless, but will force the event system to notify subscribers
				self.originEl.setAttribute("rotation", self.originEl.getAttribute("rotation")); //seems pointless, but will force the event system to notify subscribers
		}
     
	}
})
  
})()