export default (()=>{
  window.addEventListener('load', function () {
    
   document.body.addEventListener('click',lock);
  
    function lock(){
     screen.orientation.lock("portrait");
     document.body.removeEventListener('click',lock);
    }
    
    
  })
})()