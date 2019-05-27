export default CS1=>{
  
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
      }
      CS1.iot.get = (key,cb)=>{
        CS1.socket.emit('iot-get', key, cb);
      }
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
      let mat;
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
  
}