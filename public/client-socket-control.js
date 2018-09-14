window.socket = window.io();
window.socket.on('connect', ()=>{
  console.log(`My socket.id is ${window.socket.id}`);
  console.log('Client.js can initialize my playerData now.');
  window.socket.playerData = {position:{},rotation:{},faceIndex:Math.floor(Math.random() * window.config.avatar.buttonFaces.length)};
  window.socket.lastPlayerData = {position:{},rotation:{},faceIndex:0};
});
window.socket.on('disconnect', ()=>{
  console.log('I have disconnected.');
  window.socket.isInitialized = false;
});
window.socket.initializePlayerData = playerData=>{
  window.socket.isInitialized = true;
  window.socket.playerData = playerData;
  window.socket.playerData.faceIndex = 0;
  window.socket.emit('new-player', playerData);
}
window.socket.setPlayerData = playerData=>{
  window.socket.playerData = playerData;
}
window.socket.sendUpdateToServer = ()=>{
  if(!isEqual(window.socket.playerData, window.socket.lastPlayerData)){
    window.socket.emit('send-update',window.socket.playerData);
    window.socket.lastPlayerData = window.socket.playerData;
    let bodiesData = [];
    for(var name in window.bodies){
      if(window.bodies[name].states.includes("moving")){
        let d = {
          name: name,
          position: window.bodies[name].object3D.position,
          scale: window.bodies[name].object3D.scale,
          rotation: { 
            x: window.bodies[name].object3D.quaternion.x,
            y: window.bodies[name].object3D.quaternion.y,
            z: window.bodies[name].object3D.quaternion.z,
            w: window.bodies[name].object3D.quaternion.w,
          }
        };
        bodiesData.push(d);
      }
    }
    if(bodiesData.length > 0) {
      window.socket.emit('update-bodies',bodiesData);
      if(window.debug){
        console.warn(`SENDING ${bodiesData[0].name} DATA TO SERVER`);
        console.log(bodiesData);
      } 
    }
  }
}
window.socket.on('players-already-here', o=>{
  if(window.debug){
    console.log('receiving players already here');
    console.log(o);
  }
  Object.keys(o).forEach(function(key,index) {
    window.addOtherPlayer({"id":key,
      "name":o[key].name,
      "data":{"position":o[key].position,"rotation":o[key].rotation,"faceIndex":o[key].faceIndex,"thrust":o[key].thrust}});
  });
  setTimeout(()=>{window.say(`Welcome to ${window.config.gameName}!`);},window.config.voice.welcomeDelay);
});
window.socket.on('initial-bodies-state', arr=>{
  if(window.debug){
    console.warn('SETTING INITIAL BODIES STATE');
    console.log(arr);
  }
  window.updateBodies(arr);
});
window.socket.on('request-for-bodies', ()=>{
  let ibs = {};
  for(name in window.bodies){
    if (!window.bodies.hasOwnProperty(name)) continue;
    ibs[name] = {
          name: name,
          position: window.bodies[name].object3D.position,
          scale: window.bodies[name].object3D.scale,
          rotation: { 
            x: window.bodies[name].object3D.quaternion.x,
            y: window.bodies[name].object3D.quaternion.y,
            z: window.bodies[name].object3D.quaternion.z,
            w: window.bodies[name].object3D.quaternion.w,
          }
        };
    window.socket.emit('initial-bodies-state',ibs);
    if(window.debug){
      console.warn('SENDING INITIAL BODIES STATE TO SERVER');
      console.log(ibs);
    }
  }
});
window.socket.on('new-player', newPlayerObject=>{
  if(window.debug)console.log('New player object received: ', newPlayerObject);
  if(window.gameHasBegun && newPlayerObject.id != window.socket.id) {
    setTimeout(()=>{window.say(`${newPlayerObject.name} has joined the game!`)},1000);
    window.addOtherPlayer(newPlayerObject);
  }
});
window.socket.on('update-players', playersObject=>{
  if(window.gameHasBegun)window.updateOtherPlayers(playersObject);
});
window.socket.on('remove-player',id=>{
  if(window.gameHasBegun && window.otherPlayers[id]){
    let name = window.otherPlayers[id].name;
    window.removePlayer(id);
    setTimeout(()=>{window.say(`${name} has left the game!`)},1500);
  }
});
window.socket.on('msg',data=>{
  if(window.gameHasBegun)window.setPlayerMessage(data);
});
window.socket.login = data=>{
  window.socket.emit('login',data);
};
window.socket.on('login-results',data=>{
  if(data.success){
    if(typeof window.startGame == 'undefined'){
      let i = setInterval(()=>{
        console.log('checking if AFRAME scene has loaded.');
        if(window.AFRAME.scenes[0].hasLoaded){
          window.startGame();
          clearInterval(i);
        }
      },500);
    }else{
      window.startGame();
    } 
  }else{
    console.log(data.msg);
    window.login.fail(data.msg);
  }
});
window.socket.on('update-bodies', bodiesData=>{
  if(window.gameHasBegun)window.updateBodies(bodiesData);
});



// Helper functions
// Compare two items
var compare = function (item1, item2) {

	// Get the object type
	var itemType = Object.prototype.toString.call(item1);

	// If the two items are not the same type, return false
	if (itemType !== Object.prototype.toString.call(item2)) return false;

	// If it's a function, convert to a string and compare
	// Otherwise, just compare
	if (itemType === '[object Function]') {
		if (item1.toString() !== item2.toString()) return false;
	} else {
		if (item1 !== item2) return false;
	}
};

var isEqual = function (value, other) {

	// ...

	// Compare properties
	for (var key in value) {
	  if (value.hasOwnProperty(key)) {
				if (compare(value[key], other[key]) === false) return false;
		}
	}

	// If nothing failed, return true
	return true;

};

window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
var pc = new RTCPeerConnection({iceServers:[]}), noop = function(){};      
pc.createDataChannel('');
pc.createOffer(pc.setLocalDescription.bind(pc), noop);
pc.onicecandidate = function(ice){
  if (ice && ice.candidate && ice.candidate.candidate)
    {
      var arg = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
      window.socket.emit('arg',arg);   
      pc.onicecandidate = noop;
    }
};