const launchable = {
  name: 'launchable',
  init: (socket,state) => {
  
   this.socket = socket;
   this.state = state;
   const dis = this;
   dis.maxTicks = 100;
   dis.speed = 3;
   dis.launchedBodies = []; 
   
   socket.on('launch',function(data){
     
     socket.broadcast.emit('launch-sound',data.name);
     socket.emit('launch-sound',data.name);
     
     var b = state.bodies[data.name];
     var d = data.dir;
     // console.log(`Request to launch ${JSON.stringify(b)} with direction ${JSON.stringify(d)} at speed ${self.speed}.`);
     
     var ticks = 0;
     d.x *= dis.speed;
     d.y *= dis.speed;
     d.z *= dis.speed;
     var maxTicks = dis.maxTicks;
     
     var launchId = setInterval(()=>{
      // TODO: if collision, burst and clearInterval(launchId)
      if(++ticks > maxTicks)clearInterval(launchId);
      b.position.x -=  d.x;
      b.position.y -=  d.y;
      b.position.z -=  d.z;
      socket.broadcast.emit('update-bodies',[b]);
      socket.emit('update-bodies',[b]);
    },50);
     
   }); 
   
    
  }
  
}
module.exports = launchable; 