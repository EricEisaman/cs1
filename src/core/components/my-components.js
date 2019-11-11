export default (()=>{
  
  document.addEventListener('gameStart',e=>{
    
    CS1.log('Hi!');
  
  });
  
  
  AFRAME.registerComponent('mycomponent', {
    
    
    schema: {
      color: {default: 'red'}
    },

    init: function(){

    }
    
    
  });
  


  
})()