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
    },
    setLED: function (state) {
      
    },
    toggleLED: function () {
      let mat;
      if(this.data.LED == 'on'){
        mat = 'color:#680c1a;emissiveIntensity:0';
        this.data.LED = 'off';
        CS1.db.set({LED:'off'},()=>{});
      }else{   
        mat = 'color:red;emissiveIntensity:4'; 
        this.data.LED = 'on';
        CS1.db.set({LED:'on'},()=>{});
      }
      this.el.setAttribute('material',mat);
       
    },
    tick: function(t,dt){
    
     
    }
  });
  
}