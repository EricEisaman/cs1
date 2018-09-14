let player = window.player;
player.closeTo = function(name,distance){
  return player.object3D.position.distanceTo(window.bodies[name].object3D.position) <= distance;
}
player.distanceTo = function(name){
  return player.object3D.position.distanceTo(window.bodies[name].object3D.position);
}
player.awayFrom = function(name,distance){
  return player.object3D.position.distanceTo(window.bodies[name].object3D.position) > distance;
}