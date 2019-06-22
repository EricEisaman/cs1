export default (()=>{
  
  document.addEventListener('gameStart',e=>{
  
     let myNumber = 4;
     CS1.log(`${CS1.myPlayer.name} has logged ${myNumber}!`);
  
  });
  

  
  AFRAME.registerComponent('my-first-component', {
    schema:{
      color:{type:'color',default:'#fff'}
    },
    
    init: function () {
      
      let self = this;
         
    }
    
    
  });

})()