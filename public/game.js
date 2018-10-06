let player = window.player;
player.within = function(distance,name){
  return player.object3D.position.distanceTo(window.bodies[name].object3D.position) <= distance;
}
player.distanceTo = function(name){
  return player.object3D.position.distanceTo(window.bodies[name].object3D.position);
}
player.awayFrom = function(name,distance){
  return player.object3D.position.distanceTo(window.bodies[name].object3D.position) > distance;
}


let within = function(distance,names){
  let result = true;
  names.forEach(name=>{
    names.forEach(n=>{
      if(window.bodies[name].object3D.position.distanceTo(window.bodies[n].object3D.position) > distance)
      {
        result = false;
        return;
      }
    });
  });
  return result;
 }

let stopBodySound = function(name){
  window.bodies[name].querySelector('a-sound').components.sound.stopSound();
}

let playBodySound = function(name){
  window.bodies[name].querySelector('a-sound').components.sound.playSound();
}

let bodySoundIsPlaying = function(name){
  return window.bodies[name].querySelector('a-sound').components.sound.isPlaying;
}



setInterval(()=>{
  if(within(1,['Bull Pug','Bird','Boom Box'])){
   window.sounds.yay.play();
   stopBodySound('Bull Pug');
   stopBodySound('Boom Box');
   stopBodySound('Bird');
  }else if(player.within(2,'Bull Pug')){
   stopBodySound('Bull Pug');
  }else{
   if(!bodySoundIsPlaying('Bull Pug')) playBodySound('Bull Pug');
   if(!bodySoundIsPlaying('Boom Box')) playBodySound('Boom Box'); 
   if(!bodySoundIsPlaying('Bird')) playBodySound('Bird'); 
  }
},800);



