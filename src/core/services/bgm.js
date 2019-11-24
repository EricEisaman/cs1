import config from '../../../.data/client-config.json';
export function bgmlite(CS1){
  let tracks = config.bgm.songs;
  let audio = document.createElement('audio');
  let bgmUrlStart = 'https://api.soundcloud.com/tracks/';
  let bgmUrlEnd = '/stream?client_id=b9d11449cd4c64d461b8b5c30650cd06'; 
  let nextSongBtn = document.createElement('button');
  nextSongBtn.innerHTML = "PLAY NEXT SONG";
  nextSongBtn.zIndex = 100;
  nextSongBtn.style.display = "none";
  nextSongBtn.addEventListener('click',e=>{
    CS1.bgm.playNext();
  });
  let ui = document.createElement('div');
  ui.style.margin = '0 auto';
  ui.style.width = '800px';
  setTimeout(()=>{
   document.body.appendChild(ui);
   ui.appendChild(nextSongBtn);
  },5000);
  
  if(config.bgm.playAll){
   audio.addEventListener('ended',e=>{
    console.log('bgm song ended');
    CS1.bgm.playNext();
   });
}
  
let currentSongIndex = 0;
  
  CS1.bgm = {
    audio:audio,
    tracks: tracks,
    play: ()=>{
      audio.play();
      audio.volume = config.bgm.volume;
    },
    playTrackIndex: n=>{
      currentSongIndex=n;
      audio.src = bgmUrlStart + tracks[currentSongIndex] + bgmUrlEnd;
      audio.crossorigin = 'anonymous';
      audio.load();
      audio.loop = !config.bgm.playAll;
      audio.play();
      audio.volume = config.bgm.volume;
    },
    pause: ()=>{
      audio.pause();
    },
    playNext: ()=>{
      currentSongIndex++;
      if(currentSongIndex == tracks.length) currentSongIndex = 0;
      audio.src = bgmUrlStart + tracks[currentSongIndex] + bgmUrlEnd;
      audio.crossorigin = 'anonymous';
      audio.load();
      audio.loop = !config.bgm.playAll;
      audio.play();
      audio.volume = config.bgm.volume;
    },
    
  }//end of CS1.bgm definition
  
   document.addEventListener('gameStart',e=>{
    if(CS1.bgm.tracks.length) CS1.bgm.playTrackIndex(0);
  })

}//end of bgmlite


