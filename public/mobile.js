

class JoystickElement {
    constructor(selector){
        this.element = document.querySelector(selector);
        this.rect = this.calculateRect();        
        this.current = this.original;
        
        // Recalculate the rect on resizing
        window.onresize = () => {
            this.rect = this.calculateRect();
        }
    }
    
    get original(){
        return {
            vector: {
                x: 0,
                y: 0
            },
            angle: 0,
            percentage: 0
        };
    }
    
    calculateRect(){
        let rect = this.element.getBoundingClientRect();
        
        return Object.assign(
            rect,
            {
                center: {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                },
                radius: rect.width / 2 // Improve this
            }
        );
    }
}

class JoystickInner extends JoystickElement {   
    clamp(x, y, boundary){
        // Trigonometry time!
        // - Who says what you learn in school won't become useful :D
        let diff = {
            x: x - this.rect.center.x,
            y: y - this.rect.center.y,
        };
        
        // Get the distance between the cursor and the center
        let distance = Math.sqrt(
            Math.pow(diff.x, 2) + Math.pow(diff.y, 2)
        );
        
        // Get the angle of the line
        let angle = Math.atan2(diff.x, diff.y);
        // Convert into degrees!
        this.current.angle = 180 - (angle * 180 / Math.PI);
        
        // If the cursor is distance from the center is
        // less than the boundary, then return the diff
        //
        // Note: Boundary = radius
        if(distance < boundary){
            this.current.percentage = (distance / boundary) * 100;
            return this.current.vector = diff;
        }
        
        // If it's a longer distance, clamp it!
        this.current.percentage = 100;

        return this.current.vector = {
            x: Math.sin(angle) * boundary,
            y: Math.cos(angle) * boundary
        };
    }
    
    move(from, to, duration, callback){
        // quick approximation
       this.element.style.left = (to.x-from.x) + 28  + "px";
       this.element.style.top = (to.y-from.y) + 28 + "px";
       callback();
    }
}

class Joystick {
    constructor(outer, inner){
        this.state = 'inactive';
        this.outer = new JoystickElement(outer);
        this.outer.element.style.borderColor = window.config.mobile.joystick_outer_color;
        this.inner = new JoystickInner(inner);
        this.inner.element.style.backgroundColor = window.config.mobile.joystick_inner_color;
        this.boundary = 32;
        
        this.onactivate = function(){};
        this.ondeactivate = function(){};
        this.ondrag = function(){};
        
        this.activate = this.activate.bind(this);
        this.deactivate = this.deactivate.bind(this);
        this.drag = this.drag.bind(this);
    }
    
    static get ANIMATION_TIME(){
        return 100;
    }
    
    attachEvents(){
        this.outer.element.addEventListener('pointerdown', this.activate, false);
        document.addEventListener('pointerup', this.deactivate, false);
        //document.addEventListener('pointermove', this.drag, false);
        this.outer.element.addEventListener('pointermove', this.drag, false);
        return this;
    }
    
    detachEvents(){
        this.outer.element.removeEventListener('pointerdown', this.activate, false);
        document.removeEventListener('pointerup', this.deactivate, false);
        //document.removeEventListener('pointermove', this.drag, false);
        this.outer.element.removeEventListener('pointermove', this.drag, false);
        this.deactivate();
        
        return this;
    }
    
    activate(){
        this.state = 'active';
        //this.outer.element.classList.add('active');
        this.outer.element.style.borderColor = window.config.mobile.joystick_outer_color;
        if(typeof this.onactivate === 'function'){
            this.onactivate();
        }
        
        return this;
    }
    
    deactivate(){
        this.state = 'inactive';
        //this.outer.element.classList.remove('active');
        
        this.inner.move(
            this.inner.current.vector,
            this.inner.original.vector,
            this.constructor.ANIMATION_TIME,
            () => {
                this.inner.element.removeAttribute('style');
                this.inner.current = this.inner.original;
                this.inner.element.style.backgroundColor = window.config.mobile.joystick_inner_color;
        
                if(typeof this.ondeactivate === 'function'){
                    this.ondeactivate();
                }
            }
        );
      
        return this;
    }
  
    drag(e){
        
        // if(this.state !== 'active'){
        //     return this;
        // }
        this.ondrag();
        this.inner.move(
            this.inner.original.vector,
            this.inner.clamp(e.clientX, e.clientY, this.boundary),
            0,
            () => {
                if(typeof this.ondrag === 'function'){
                    this.ondrag();
                }
            }
        );
        
        return this;
    }
}

window.addEventListener('touchstart', function onFirstTouch() {
  
  let jso = document.createElement('div');
  jso.className = "joystick-outer";
  jso.setAttribute("touch-action","none");
  let c = document.querySelector('#joystick-container');
  c.style.width = "50%";
  c.appendChild(jso);
  let jsi = document.createElement('div');
  jsi.className = "joystick-inner";
  //jsi.setAttribute("touch-action","none");
  jso.appendChild(jsi);
  
  window.player.setAttribute('universal-controls',null);
 
  window.TOUCH = true;
  window.joystick = new Joystick('.joystick-outer', '.joystick-inner');
  
  window.joystick.attachEvents();

  window.joystick.ondrag = function(){
    let jx = window.joystick.inner.current.vector.x;
    let jy = window.joystick.inner.current.vector.y;
    let speed = (jy === 0 ) ? 0 : -Math.abs(jy)/jy/10;
    var angle = window.player.getAttribute("rotation");
    angle.y -= jx/10;
    window.player.setAttribute('rotation',`${angle.x} ${angle.y} 0`);
    var x = speed * Math.cos(angle.y * Math.PI / 180);
    var y = speed * Math.sin(angle.y * Math.PI / 180);
    var pos = window.player.getAttribute("position");
    pos.x -= y;
    pos.z -= x;
    window.player.setAttribute("position", pos);
  }
  
  window.removeEventListener('touchstart', onFirstTouch, false);
}, false);


let pitchControl = document.querySelector('#pitch-controller');
pitchControl.style.position = 'fixed';
pitchControl.style.bottom = 0;
pitchControl.style.right = 0;
var lastTouchY = 0;
pitchControl.addEventListener('touchmove', e=>{
  e.preventDefault();
  let newY = e.changedTouches[0].screenY;
  if(lastTouchY === 0){
    lastTouchY = newY;
    return;
  }else {
    let delta = newY - lastTouchY;
    if (Math.abs(delta) > 5) delta = 0;
    lastTouchY = newY;
    var angle = window.player.getAttribute("rotation");
    angle.x -= delta;
    window.player.setAttribute('rotation',`${angle.x} ${angle.y} 0`);
  }
}, false);



if(AFRAME.utils.device.isMobile()){
  let thrustBtn = new Image();
  thrustBtn.style.zIndex = 10;
  thrustBtn.crossOrigin = "anonymous";
  //thrustBtn.style.backgroundImage = `url(${window.config.mobile.thruster_icon})`;
  thrustBtn.setAttribute('src',window.config.mobile.thruster_icon);
  thrustBtn.style.position = 'fixed';
  thrustBtn.style.bottom = 50;
  thrustBtn.style.right = 20;
  //thrustBtn.style.pointerEvents = "none";
  let c = document.querySelector('#thruster-btn');
  c.appendChild(thrustBtn);
  window.player.addEventListener('collide', e=>{
   window.player.setAttribute('velocity', {x: 0, y: 0, z: 0});
  });
  c.addEventListener('touchstart',function(e){
    e.preventDefault();
    var angle = window.player.getAttribute("rotation");
    var vz = -10 * Math.cos(angle.y * Math.PI / 180);
    var vx = -10 * Math.sin(angle.y * Math.PI / 180);
    //let v = window.player.getAttribute('velocity');
    window.player.setAttribute('velocity', {x: vx, y: 25, z: vz});
    window.player.isThrusting = true;
    setTimeout(()=>{
      window.player.isThrusting = false;
    },1000);
  }); 
}


document.body.addEventListener("touchstart",function fullScreen(){
  //window.toggleFullScreen();
 document.body.removeEventListener('touchstart', fullScreen, false);
},false);

window.toggleFullScreen = function() {
  var doc = window.document;
  var docEl = doc.documentElement;

  var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
  var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

  if(!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl);
  }
  else {
    cancelFullScreen.call(doc);
  }
}

