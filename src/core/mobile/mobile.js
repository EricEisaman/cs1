export default (()=>{
  window.addEventListener('load', function () {
    
   document.body.addEventListener('click',lock);
  
    function lock(){
     screen.orientation.lock("portrait");
     document.body.removeEventListener('click',lock);
    }
    
    
    document.body.addEventListener('touchstart',doubletap);
    let mylatesttap;
    function doubletap() {
       CS1.log(mylatesttap);
       var now = new Date().getTime();
       var timesince = now - mylatesttap;
       if((timesince < 600) && (timesince > 0)){
        // double tap   
        // Create a new event    
        let event = new CustomEvent(
          "doubleTap", 
          {
            detail: {
              message: "Double Tappin!",
              time: new Date(),
            },
            bubbles: true,
            cancelable: true
          }
        );
        // Dispatch the event
        document.body.dispatchEvent(event); 
       }else{
                // too much time to be a doubletap
             }
       mylatesttap = new Date().getTime();
    }
    
    
  })
})()