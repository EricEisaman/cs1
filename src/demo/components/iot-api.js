export default CS1=>{
  
  AFRAME.registerComponent('iot-api', {
    schema:{
      led:{type:'string',default:'on'}
    },
    init: function () {   
      const self = this;
      this.el.addEventListener('click',e=>{
        console.log('Click detected on led.');
        self.toggleLED();
      });       
    },
    setLED: function (state) {
      
    },
    toggleLED: function () {
      let mat;
      if(this.data.led == 'on'){
        mat = 'color:#680c1a;emissiveIntensity:0';
        this.data.led = 'off';
        CS1.db.set({led:'off'},()=>{});
      }else{   
        mat = 'color:red;emissiveIntensity:4'; 
        this.data.led = 'on';
        CS1.db.set({led:'on'},()=>{});
      }
      this.el.setAttribute('material',mat);
       
    },
    tick: function(t,dt){
    
     
    }
  });
  
}