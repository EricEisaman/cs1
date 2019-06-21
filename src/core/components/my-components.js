export default (()=>{
  
  document.addEventListener('gameStart',e=>{
  
     let myNumber = 4;
     CS1.log(`I am logging ${myNumber}!`);
  
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