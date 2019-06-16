export default CS1=>{
  
  AFRAME.registerComponent('npc', {
    schema:{
      waypoints:{type:'array'},
      name:{type:'string'},
      roam:{type:'boolean',default:false}
    },
    init: function () {
      this.waypoints=this.data.waypoints;
      this.waypointsIndex=0;
      this.moves=0;
      if(this.data.name){
        this.name = this.data.name;
      }else{
        this.name = (CS1.npc)? `npc${CS1.npc.length}`:'npc0';
      }
      if(CS1.npc){
        CS1.npc[this.name]=this;
      }else{
        CS1.npc={};
        CS1.npc[this.name]=this;
      }
      this.addListeners();
      CS1.socket.emit('register-npc',{name:this.name,waypoints:this.waypoints});
      if(this.data.roam)this.requestMove();
    },
    addListeners: function(){
      let self = this;
      this.el.addEventListener('navigation-end',this.onNavigationEnd.bind(self));
      if(!CS1.socket._callbacks["$npc-move"])
      CS1.socket.on('npc-move',data=>{
        if(data.dest===self.dest)return;
        CS1.npc[data.name].dest = data.dest;
        CS1.npc[data.name].setPosition(data.pos);
        CS1.npc[data.name].move(data.dest);
      });
    },
    setWaypoints: function(waypointsArray){
      this.waypoints = waypointsArray;
      CS1.socket.emit('set-npc-waypoints',{name:this.name,waypoints:waypointsArray});
    },
    addWaypoint: function(waypoint){
      this.waypoints.push(waypoint);
      CS1.socket.emit('add-npc-waypoint',{name:this.name,waypoint:waypoint});
    },
    move: function (destination=false) {
      this.moves++;
      let s;
      let dest={};
      if(destination){
        s = destination;
      }else{
        s=this.waypoints[this.waypointsIndex];
      }
      if(!s){
          console.error('You must define some waypoints for your npc to roam! < npc component >');
          return;
      }else{
          let a = s.split(' ');
          dest.x=a[0];
          dest.y=a[1];
          dest.z=a[2];
          if (dest) this.el.setAttribute('nav-agent', {
            active: true,
            destination: dest,
            speed: 2
          });
      
      }
    },
    setPosition: function (position) {
      this.el.setAttribute('position',position);
    },
    tick: function(t,dt){
    
     
    },
    requestMove: function (dest=''){
      CS1.socket.emit('npc-move',{
          name:this.name,
          pos:this.el.getAttribute('position'),
          dest:dest 
      });
    },
    onNavigationEnd: function(e){
      //this.dest=false;
      //console.log(`NPC Navigation has ended for ${this.name}.`)
      //console.log(e);
      this.waypointsIndex++;
      if( this.waypointsIndex==this.waypoints.length)this.waypointsIndex=0;
      let d = this.waypoints[this.waypointsIndex];
      if(this.data.roam)this.requestMove(d);
    }
  });
  
}