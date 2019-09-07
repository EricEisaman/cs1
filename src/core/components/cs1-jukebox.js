export default(()=>{

AFRAME.registerComponent('cs1-jukebox', {
  schema: {
	
  },
  
  init: function(){
    CS1.jukebox.audio.addEventListener('jukeboxplay',e=>{
      CS1.socket.emit('jukebox',{action:'play',index:e.detail.index,player:CS1.myPlayer.name});
      CS1.log(`${CS1.myPlayer.name} is playing ${CS1.jukebox.songNames[e.detail.index]}.`);
    });
    CS1.jukebox.audio.addEventListener('jukeboxpause',e=>{
      CS1.socket.emit('jukebox',{action:'pause',player:CS1.myPlayer.name});
      CS1.log(`${CS1.myPlayer.name} has paused the jukebox.`);
    }); 
    CS1.socket.on('jukebox',data=>{
      if(data.player==CS1.myPlayer.name)return;
      switch(data.action){
        case 'play':
          CS1.jukebox.play(data.index);
          CS1.log(`${data.player} is playing ${CS1.jukebox.songNames[data.index]}!`);
          break;
        case 'pause':
          CS1.jukebox.pause(false);
          CS1.log(`${data.player} has paused the jukebox!`);
          break;
      }
    });
  }
});
  
})()