export function bgmlite(CS1,opts){
  opts = opts || {};
  let tracks = [347139395,257421013];
  let audio = document.createElement('audio');
  let bgmUrlStart = 'https://api.soundcloud.com/tracks/';
  let bgmUrlEnd = '/stream?client_id=b9d11449cd4c64d461b8b5c30650cd06';
  audio.src = bgmUrlStart +tracks[0]+ bgmUrlEnd;
  audio.crossorigin = 'anonymous';
  audio.autoplay = 'autoplay';
  if(!opts.playAll) audio.loop = true;
  audio.volume = 0.00;
  
  let nextSongBtn = document.createElement('button');
  nextSongBtn.innerHTML = "PLAY NEXT SONG";
  nextSongBtn.zIndex = 100;
  nextSongBtn.style.display = "none";
  nextSongBtn.addEventListener('click',e=>{
    CS1.bgm.playNextSong();
  });
  let ui = document.createElement('div');
  ui.style.margin = '0 auto';
  ui.style.width = '800px';
  setTimeout(()=>{
   document.body.appendChild(ui);
   ui.appendChild(nextSongBtn);
  },5000);
  
  if(opts.playAll){
   audio.addEventListener('ended',e=>{
    console.log('bgm song ended');
    CS1.bgm.playNextSong();
   });
}
  
  
  CS1.bgm = {
    tracks: tracks,
    currentSongIndex: 0,
    play: ()=>{
      audio.volume = 1;
      audio.play();
    },
    pause: ()=>{
      audio.pause();
    },
    playNext: ()=>{
    
          this.currentSongIndex++;
          if(this.currentSongIndex == this.tracks.length) this.currentSongIndex = 0;
          this.src = bgmUrlStart + this.tracks[this.currentSongIndex] + bgmUrlEnd;
          audio.crossorigin = 'anonymous';
          audio.autoplay = 'autoplay';
          audio.load();
          if(!opts.playAll) audio.loop = true;
      },
    
  }//end of CS1.bgm definition
  
   document.addEventListener('gameStart',e=>{
    CS1.bgm.play();
  })

}//end of bgmlite


