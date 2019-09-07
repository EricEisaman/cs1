export default CS1=>{
  
  AFRAME.registerComponent('sign-in', {
    schema:{
      required:{type:'boolean',default:true},
      timeOut:{type:'number',default:60}
    },
    init: function () {
      this.addSignatureLayer();
      this.addListeners();
      CS1.welcomeDeskSignIn = this;
    },
    addSignatureLayer: function () {
      this.textSettings = 'zOffset:0.01;xOffset:0;color:black;wrapCount:12;baseline:top;height:4';      
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
        CS1.myPlayer.signedIn = true;
      });
      CS1.socket.on('players-already-signed-in',ps=>{
        console.log('Adding players already signed in.');
        console.log(ps);
        ps.forEach(p=>{
          if(p==CS1.myPlayer.name)CS1.myPlayer.signedIn = true;
          console.log('Adding '+p);
          this.addName(p);
        });
      });
      let self = this;
      document.addEventListener('gameStart',e=>{
        //console.log('Handling gameStart on sign-in component.');
        setTimeout(e=>{
          if(!CS1.myPlayer.signedIn){
            let event = new CustomEvent(
              "signInFail", 
              {
                detail: {
                  message: "Sign in fail!",
                  time: new Date(),
                },
                bubbles: true,
                cancelable: true
              }
            );

            // Dispatch the event
            document.body.dispatchEvent(event);
          }
        },this.data.timeOut*1000);
      })
    
    },
    addName: function (name) {
      this.el.setAttribute('text',`value:${this.el.components.text.data.value}\n${name}`);
    },
    tick: function(t,dt){
    
     
    }  
  });
  
}