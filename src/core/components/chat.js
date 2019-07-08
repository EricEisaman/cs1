export default(()=>{

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
    this.keyboard.setAttribute('a-keyboard','');
    this.keyboard.setAttribute('position','-1 1.6 -1.5');
    this.keyboard.setAttribute('rotation','-20 0 0');
    this.keyboard.setAttribute('scale','4 4 4');
    
   
    this.container.appendChild(this.input);
    this.container.appendChild(this.keyboard);
    this.el.appendChild(this.container);
    
    
    
    const self = this;
    
    document.addEventListener('gameStart',e=>{
      
      self.keys = document.querySelectorAll('.collidable');
    
      self.keys.forEach(e=>{
                 e.classList.remove('collidable')
                })  
      
      self.value = '';
      
      function updateInput(e){
        let code = parseInt(e.detail.code)
        switch(code) {
          case 8:
            self.value = self.value.slice(0, -1)
            break
          case 999:
            self.input.setAttribute('value', self.value);
            self.container.setAttribute('visible',false);
            self.keys.forEach(e=>{
                 e.classList.remove('collidable')
                }) 
            self.keyboard.components['a-keyboard'].pause();
            document.removeEventListener('a-keyboard-update', updateInput)
            CS1.socket.emit('msg',{msg:self.value});
            return
          default:
            if(!e.detail.value)return;
            self.value = self.value + e.detail.value
            break
          }
          self.input.setAttribute('value', self.value + '_')
      }
      
      let lh = document.querySelector('#left-hand').components["oculus-touch-controls"];
      let rh = document.querySelector('#right-hand').components["oculus-touch-controls"];
      
      switch(CS1.device){
          
        case "Oculus Quest":
          
          let cursor = document.querySelector('a-cursor');
          cursor.pause();
          if(CS1.cam.components.raycaster)CS1.cam.components.raycaster.pause();
          lh.el.addEventListener('bbuttondown',e=>{
            self.value = '';
            self.input.setAttribute('value', self.value);
            document.addEventListener('a-keyboard-update', updateInput)
            self.container.object3D.rotation.y = CS1.cam.object3D.rotation.y;
            let v = self.container.getAttribute('visible');
            self.container.setAttribute('visible',!v);
            self.keyboard.components['a-keyboard'].play();
            if(v){
               self.keys.forEach(e=>{
                 e.classList.remove('collidable')
                })  
            }else{
              self.keys.forEach(e=>{
                 e.classList.add('collidable')
                })  
            }
          });
          rh.el.addEventListener('bbuttondown',e=>{
            self.value = '';
            self.input.setAttribute('value', self.value);
            document.addEventListener('a-keyboard-update', updateInput)
            self.container.object3D.rotation.y = CS1.cam.object3D.rotation.y;
            let v = self.container.getAttribute('visible');
            self.container.setAttribute('visible',!v);
            self.keyboard.components['a-keyboard'].play();
            if(v){
               self.keys.forEach(e=>{
                 e.classList.remove('collidable')
                })  
            }else{
              self.keys.forEach(e=>{
                 e.classList.add('collidable')
                })  
            }
          });  
          
          
          
          break;
        case "Mobile":
          CS1.chatInput = document.querySelector('#mobile-chat-input');
          CS1.chatInput.addEventListener('keydown',e=>{
            switch(e.keyCode){
              case 13:
                CS1.socket.emit('msg',{msg:CS1.chatInput.value});
                CS1.chatInput.style.zIndex = -1000;
                CS1.chatInput.blur();
                break;
            }
          });
          document.addEventListener('doubleTapChat',e=>{
            
            if(CS1.chatInput.style.zIndex == -1000){
              CS1.chatInput.style.zIndex = 200;
            }else{
              CS1.chatInput.style.zIndex = -1000;
            }

            

          });
          
          break;
        case "Standard":
          document.addEventListener('keypress',e=>{
            if(e.keyCode==99){
              self.value = '';
              self.input.setAttribute('value', self.value);
              document.addEventListener('a-keyboard-update', updateInput)
              self.container.object3D.rotation.y = CS1.cam.object3D.rotation.y;
              let v = self.container.getAttribute('visible');
              self.container.setAttribute('visible',!v); 
              self.keyboard.components['a-keyboard'].play();
              if(v){
               self.keys.forEach(e=>{
                 e.classList.remove('collidable')
                })  
            }else{
              self.keys.forEach(e=>{
                 e.classList.add('collidable')
                })  
            }
            }
          });     
          break;
          
      }
      
      
    });
    
    
    
  },
  
 
  
  
});
  
})()