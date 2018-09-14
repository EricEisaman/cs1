window.sounds = {
  playerJoined : ()=>{
   let audio = new Audio(window.config.sounds.playerJoined);
   audio.volume = 1.0;
   audio.play();
  },
  playerLeft : ()=>{
   let audio = new Audio(window.config.sounds.playerLeft);
   audio.volume = 1.0;
   audio.play();
  } 
}