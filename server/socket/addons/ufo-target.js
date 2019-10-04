const addon = {
  name: 'addon',
  init: (socket,state) => {
  
    this.socket = socket;
    this.state = state;
    const self = this;
    
    state.ufoTarget=false;

    socket.addonChannel.on('remove-player',d=>{
      if(socket.id == state.ufoTarget){
        state.ufoTarget=false;
        socket.emit('set-ufo-target',false);
        socket.broadcast.emit('set-ufo-target',false); 
      }
    });
    
    socket.on('new-player',d=>{
      if(state.ufoTarget)socket.emit('set-ufo-target',state.ufoTarget);
    });
    
    socket.on('set-ufo-target',function(id){
      socket.emit('set-ufo-target', id);
      socket.broadcast.emit('set-ufo-target', id);
      state.ufoTarget = id;
    });
   
    
  }
  
}
module.exports = addon; 