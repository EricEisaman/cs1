const jukebox = {
  name: 'jukebox',
  init: (socket,state) => {
   socket.on('jukebox',function(data){
     if(!socket.auth){
        socket.emit('log','You attempted to send jukebox data without being authorized!');
        return;
     }
     socket.broadcast.emit('jukebox',data);
   });   
  }  
}
module.exports = jukebox; 