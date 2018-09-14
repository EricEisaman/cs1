document.addEventListener('keydown',e=>{
  if(e.code == window.config.keys.toggleCursor && window.gameHasBegun){
    let c = document.querySelector('#cam-cursor');
    if(c.getAttribute('visible')){
      c.setAttribute('visible',false);
    }else{
      c.setAttribute('visible',true);
    }
  } 
});

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

/*function pointLocalToWorld(object, localPoint)
{
	return object.localToWorld(localPoint);
}

function pointWorldToLocal(object, worldPoint)
{
	return object.worldToLocal(worldPoint);
}

function directionLocalToWorld(object, localDirection)
{
	//localDirection -> object.localToWorld -> result - object.worldPosition -> normalize
}

function directionWorldToLocal(object, worldDirection)
{
	//worldDirection + object.worldPosition -> pointWorldToLocal -> normalize
}

function rotationLocalToWorld(object, localQuaternion)
{

}

function rotationWorldToLocal(object, worldQuaternion)
{

}

function scaleLocalToWorld(object, localScale)
{

}

function scaleWorldToLocal(object, worldScale)
{

}*/

AFRAME.registerComponent("grabbable", {
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

		self.el.addEventListener("mousedown", grab);
    if(AFRAME.utils.device.isMobile())self.el.addEventListener("click", function(e){
       grab(e);
       setTimeout(e=>{release(e)},5000);
    });
    
    function grab(e){
			e.cancelBubble = true;
			if(isDragging) return;
      
			isDragging = true;

			var cursor = e.detail.cursorEl;
			if(cursor == self.el.sceneEl) cursor = document.querySelector("[camera]"); //This handles the scenario where the user isn't using motion controllers
      // avoid seeing flickering at origin during reparenting
      self.el.setAttribute('visible', false);
      setTimeout(()=>{
        self.el.setAttribute('visible', true);
      },20);

			createProxyObject(cursor.object3D);
			
			self.originEl.emit("grabStart", e);
			self.originEl.addState("moving");
		}

		self.el.addEventListener("mouseup", release);
    
    function release(e)
		{
			if(isDragging)
			{
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
      setTimeout(()=>{
        self.originEl.visible = true;
      },1000);
			cursorObject.add(self.proxyObject);
			copyTransform(self.originEl.object3D, self.proxyObject);				
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