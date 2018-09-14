  var songs = window.config.bgm.songs;
  var currentSongIndex = 0;
  
  var bgm = document.createElement('audio');
  var bgmUrlStart = 'https://api.soundcloud.com/tracks/';
  var bgmUrlEnd = '/stream?client_id=b9d11449cd4c64d461b8b5c30650cd06';
  bgm.src = bgmUrlStart +songs[0]+ bgmUrlEnd;
  bgm.crossorigin = 'anonymous';
  bgm.autoplay = 'autoplay';
  if(!window.config.bgm.playAll) bgm.loop = true;
  bgm.volume = 0.00;
  bgm.setAttribute('controls','');
  document.querySelector('#bgm').appendChild(bgm);

  var nextSongBtn = document.createElement('button');
  nextSongBtn.innerHTML = "PLAY NEXT SONG";
  nextSongBtn.zIndex = 100;
  nextSongBtn.style.display = "none";
  nextSongBtn.addEventListener('click',e=>{
    playNextSong();
  });
  let ui = document.createElement('div');
  ui.style.margin = '0 auto';
  ui.style.width = '800px';
  setTimeout(()=>{
   document.body.appendChild(ui);
   ui.appendChild(nextSongBtn);
  },5000);

  
  function playNextSong(){
    currentSongIndex++;
    if(currentSongIndex == songs.length) currentSongIndex = 0;
    bgm.src = bgmUrlStart + songs[currentSongIndex] + bgmUrlEnd;
    bgm.crossorigin = 'anonymous';
    bgm.autoplay = 'autoplay';
    bgm.load();
    if(!window.config.bgm.playAll) bgm.loop = true;
  }

if(window.config.bgm.playAll){
   bgm.addEventListener('ended',e=>{
    console.log('bgm song ended');
    playNextSong();
   });
}

document.body.addEventListener('keyup',e=>{
   if(window.dialog.isShowing || !window.gameHasBegun)return;
   switch(e.code){
     case window.config.keys.nextSong: playNextSong();
       break;
     case window.config.keys.toggleMute: 
       if(bgm.volume > 0){
          bgm.volume = 0.00;
       }else{
          bgm.volume = window.config.bgm.volume;
       }
   }
});

let count = 0;
let i = setInterval(()=>{
 if(window.gameHasBegun){
   if(++count > 1){
    console.log('playing background music');
     bgm.volume = window.config.bgm.volume;
     bgm.play();
     clearInterval(i);
   } 
 }
},window.config.bgm.initialDelay);




