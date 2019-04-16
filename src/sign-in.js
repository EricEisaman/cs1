export default CS1=>{
  
  AFRAME.registerComponent('sign-in', {
    schema:{
      required:{type:'boolean',default:true}
    },
    init: function () {
      this.addSignatureLayer();
      this.addListeners();
      CS1.welcomeDeskSignIn = this;
    },
    addSignatureLayer: function () {
      this.textSettings = 'zOffset:0.03;xOffset:0.123;color:black;wrapCount:18;baseline:top;height:4';      
      this.el.setAttribute('text',this.textSettings);
    },
    addListeners: function () {
      const el = this.el;
      el.addEventListener('click',e=>{
        console.log('Click detected on sign-in.');
        CS1.socket.emit('sign-in');
      }); 
      CS1.socket.on('sign-in',name=>{
        this.addName(name);
      });
      CS1.socket.on('players-already-signed-in',ps=>{
        console.log('Adding players already signed in.');
        console.log(ps);
        ps.forEach(p=>{
          console.log('Adding '+p);
          this.addName(p);
        });
      });
    },
    addName: function (name) {
      this.el.setAttribute('text',`value:${this.el.components.text.data.value}\n${name}`);
    },
    tick: function(t,dt){
    
     
    }  
  });
  
}