const npc = {
  name: 'npc',
  init: (socket,state) => {
  
   this.socket = socket;
   this.state = state;
   const self = this;
    
   socket.on('register-npc',data=>{
          if(!state.npc[data.name]){
            state.npc[data.name]={};
            state.npc[data.name].waypoints=data.waypoints;
            console.log('Registering NPC.');
          }
        });
    
  socket.on('set-npc-waypoints',data=>{
    if(state.npc[data.name]){
      state.npc[data.name].waypoints=data.waypoints;
      console.log('Setting NPC waypoints.');
    }
  });
    
  socket.on('add-npc-waypoint',data=>{
    if(state.npc[data.name]){
      state.npc[data.name].waypoints.push(data.waypoint);
      console.log('Adding NPC waypoint.');
      console.log(state.npc[data.name]);
    }
  });
    
  socket.on('npc-move',data=>{
    socket.emit('npc-move',data);
    socket.broadcast.emit('npc-move',data);
  });
      
      
   
    
  }
  
}
module.exports = npc; 