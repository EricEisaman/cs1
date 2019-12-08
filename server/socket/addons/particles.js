const particles = {
  name: 'particles',
  init: (socket,state) => {
  
   this.socket = socket;
   this.state = state;
   const self = this;
    
   socket.on('particles-fire', d=>{
     socket.broadcast.emit('particles-fire',d);    
   });

        
  }
  
}
module.exports = particles; 