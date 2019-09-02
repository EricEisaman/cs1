export default (()=>{
  
  document.addEventListener('gameStart',e=>{
    
  
  
  });
  

  
  AFRAME.registerComponent('my-component', {
    schema:{
      color:{type:'color',default:'#fff'}
    },
    
    init: function () {
      
 
         
    }
    
  });
  
  
  AFRAME.registerComponent('bot', {
    schema:{
      color:{type:'color',default:'#fff'}
    },
    
    init: function () {
      
      
     const self = this;
          
     this.el.addEventListener('model-loaded', () => { });
    
     const object = this.el.getObject3D('mesh');

        
      if (object) {
        object.traverse(function (node) {
          if (node.isGroup) {
            CS1.log(node.name); 
            console.log(node);
            window[node.name] = node;
      
           }
         });
      }
      
 
         
    },
    
    tick: function (t,dt){
      
        if(!HEAD)return;      
      
        const p = Object.keys(CS1.otherPlayers)[0];
        if(!p)return;
           
        const h = 2.5+Math.sin(t/500)/2;
          
        this.el.object3D.position.set(p.object3D.position.x,p.object3D.position.y,p.object3D.position.z);
        this.el.setAttribute('rotation','0 180 0');
        const camR = CS1.cam.object3D.rotation;
        HEAD.rotation.set(-camR.x,camR.y,camR.z);
        if(CS1.myPlayer.components.player.isWalking){
          BODY.rotation.y = CS1.cam.object3D.rotation.y;
          BODY.position.y = 1 + Math.cos(CS1.myPlayer.timePlayed/150)/6;
        }
        
        let lhp,lhr,rhp,rhr;
        if(CS1.device == 'Oculus Quest'){
          lhp = CS1.myPlayer.components.player.lh.object3D.position;
          rhp = CS1.myPlayer.components.player.rh.object3D.position;
          lhr = CS1.myPlayer.components.player.lh.getAttribute('rotation');
          rhr = CS1.myPlayer.components.player.rh.getAttribute('rotation');
          HAND_L.position.set(3*lhp.x + 0.25, 3*lhp.y , 3*lhp.z);
          HAND_R.position.set(3*rhp.x - 0.25, 3*rhp.y , 3*rhp.z);

          HAND_L.rotation.set(
            THREE.Math.degToRad(lhr.x),
            THREE.Math.degToRad(lhr.y+90),
            THREE.Math.degToRad(lhr.z)
          );
          HAND_R.rotation.set(
            THREE.Math.degToRad(rhr.x),
            THREE.Math.degToRad(rhr.y-90),
            THREE.Math.degToRad(rhr.z)
          );
        }else{
          
          HAND_L.position.set(3, 1 , h+3);
          HAND_R.position.set(-3, 1 ,h+3);

          HAND_L.rotation.set(
            THREE.Math.degToRad(0),
            Math.atan2(h,3),
            THREE.Math.degToRad(0)
          );
          HAND_R.rotation.set(
            THREE.Math.degToRad(0),
            Math.atan2(h,3),
            THREE.Math.degToRad(0)
          );      
                  
        }
      
      
      
      
      
    }
    
    
    
  });
  
  
  
  
  
  
  
  
  

})()