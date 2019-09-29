const bodies = {
  name: 'bodies',
  init: (socket,state) => {
  
   this.socket = socket;
   this.state = state;
   const self = this;
    
   state.bodies = {};
   state.changedBodies = [];
   state.collectibles = [];
   state.lastSocketSentBodies={broadcast:{emit:()=>{}}};
   state.lateBodies = [];
    
   socket.addonChannel.on('remove-player',function(){
     if(Object.keys(state.players).length===0){
        state.bodies = {};
        state.changedBodies = [];
        state.lateBodies = [];       
     }
   }); 
    
   socket.on('new-player',function(){
     console.log('changedBodies length:',state.changedBodies.length);
     if((Object.keys(state.players).length > 0) ) {
     let ibs = [];
     for(name in state.bodies){
      ibs.push(state.bodies[name]);
     }
     if(state.lateBodies.length>0){
       state.lateBodies.forEach(d=>{
         socket.broadcast.emit('add-grabbable-primitive',d); 
       });
     }
     if(ibs.length>0)socket.emit('initial-bodies-state',ibs);
     console.log('sending initial bodies state');
     }
     if(Object.keys(state.players).length === 0){
      socket.emit('request-for-bodies');
      socket.emit('request-for-collectibles');
     }else{
     state.collectibles.forEach((c,index)=>{
       if(c.collector){
        socket.emit('collect',{index:index,collector:c.collector});
        console.log('Sending collectible update to new player:');
       }
     });
    }   
   });
    
    
   socket.on('request-collection',function(data){
    if(!socket.auth)return;
      console.log(state.collectibles[data.index].collector);
      if(!state.collectibles[data.index].collector){
        state.collectibles[data.index].collector = socket.id;
        socket.emit('collect',{index:data.index,collector:socket.id});
        socket.broadcast.emit('collect',{index:data.index,collector:socket.id});
        console.log('collection made');
        if(state.collectibles[data.index].spawns){
          setTimeout(()=>{
               socket.emit('spawn-collectible',data.index);
               socket.broadcast.emit('spawn-collectible',data.index);
               state.collectibles[data.index].collector = false;
               console.log('calling to spawn collectible');
             },state.collectibles[data.index].spawnDelay*1000);
           }
         }
    });
    
    socket.on('initial-collectibles-state',function(d){
      console.log('Collectibles initializing.');
      for(let i=0; i<d.length; i++){
        let c = {};
        c.spawns = d[i].spawns;
        c.spawnDelay = Number(d[i].spawnDelay);
        c.collector = false;
        state.collectibles[i] = c;
      }   
    });
    
    socket.on('update-bodies',function(data){
      state.changedBodies = data;
      state.changedBodies.forEach(bd=>{
        state.bodies[bd.name]=bd;
      });
      if(Object.keys(state.players).length > 1 ) socket.broadcast.emit('update-bodies',state.changedBodies);
    });
    
  socket.on('initial-bodies-state',obj=>{
    console.log('Initial bodies state received.');
    state.bodies = obj;
  });
    
    
    socket.on('add-grabbable-primitive',d=>{
      state.lateBodies.push(d);
      state.bodies[Object.keys(state.bodies).length]=d.data;
      socket.broadcast.emit('add-grabbable-primitive',d);    
    });
    
   
    
  }
  
}
module.exports = bodies; 