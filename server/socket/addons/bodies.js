const bodies = {
  name: "bodies",
  init: (socket, state) => {
    this.socket = socket;
    this.state = state;
    const self = this;

    if (Object.keys(state.players).length == 0) {
      if(!state.bodies)state.bodies = {};
      if(!state.changedBodies)state.changedBodies = [];
      if(!state.collectibles)state.collectibles = [];
      if(!state.lastSocketSentBodies)state.lastSocketSentBodies = { broadcast: { emit: () => {} } };
      if(!state.lateBodies)state.lateBodies = [];
      console.warn("Initializing required state from bodies socket addon.");
    }
    // PLACE TO SAVE GAME STATE TO DB IF NEEDED
    socket.addonChannel.on("remove-player", function() {
      if (Object.keys(state.players).length === 0) {
        state.bodies = {};
        state.changedBodies = [];
        state.lateBodies = [];
        state.collectibles = [];
        state.lastSocketSentBodies = { broadcast: { emit: () => {} } };
        console.warn(
          "Clearing state from bodies socket addon in remove player handler."
        );
      }
    });
   
    socket.on("new-player", function(){
      let ibs = [];
      let lateBodies = [];
      for (name in state.bodies) {
        //console.warn('state.bodies item:');
        //console.warn(state.bodies[name]);
        if(state.bodies[name].origin){
          lateBodies.push(state.bodies[name]);
        }else{
          ibs.push(state.bodies[name]);
        }   
      }
      if (lateBodies.length > 0) {
        lateBodies.forEach(b=>{
          socket.emit("add-grabbable-primitive", b);
        });
        console.warn(`sending initial state for ${lateBodies.length} late bodies`);
      }
      if (ibs.length > 0) {
        socket.emit("initial-bodies-state", ibs);
        console.warn(`sending initial state for ${ibs.length} bodies`);
      }
      if (Object.keys(state.players).length === 1) {
        socket.emit("request-for-bodies");
        socket.emit("request-for-collectibles");
        console.log("requesting bodies and collectibles");
      } else {
        state.collectibles.forEach((c, index) => {
          if (c.collector) {
            socket.emit("collect", { index: index, collector: c.collector });
            console.log("Sending collectible update to new player:");
          }
        });
      }
    });

    socket.on("request-collection", function(data) {
      if (!socket.auth || !state.collectibles[data.index]) {
        console.log("bad request collection data", data);
        return;
      }
      if (!state.collectibles[data.index].collector) {
        state.collectibles[data.index].collector = socket.id;
        socket.emit("collect", { index: data.index, collector: socket.id });
        socket.broadcast.emit("collect", {
          index: data.index,
          collector: socket.id
        });
        console.log("collection made");
        if (state.collectibles[data.index].spawns) {
          setTimeout(() => {
            socket.emit("spawn-collectible", data.index);
            socket.broadcast.emit("spawn-collectible", data.index);
            state.collectibles[data.index].collector = false;
            console.log("calling to spawn collectible");
          }, state.collectibles[data.index].spawnDelay * 1000);
        }
      }
    });
    
    socket.on("initial-collectibles-state", function(d) {
      console.log("Collectibles initializing.");
      for (let i = 0; i < d.length; i++) {
        let c = {};
        c.spawns = d[i].spawns;
        c.spawnDelay = Number(d[i].spawnDelay);
        c.collector = false;
        state.collectibles[i] = c;
      }
    });

    socket.on("update-bodies", function(data) {
      state.changedBodies = data;
      state.changedBodies.forEach(bd => {
        Object.assign(state.bodies[bd.name] ,bd );
      });
      if (Object.keys(state.players).length > 1)
        socket.broadcast.emit("update-bodies", state.changedBodies);
    });

    socket.on("initial-bodies-state", obj => {
      console.log("Initial bodies state received.");
      state.bodies = obj;
    });

    socket.on("add-grabbable-primitive", d => {
      console.log("Adding late grabbable");
      //state.lateBodies.push(d);
      state.bodies[Object.keys(state.bodies).length] = d;
      if (d.custom.collectible) {
        let c = {};
        c.spawns = d.custom.collectible.spawns;
        c.spawnDelay = d.custom.collectible.spawnDelay;
        c.collector = false;
        state.collectibles[Object.keys(state.collectibles).length] = c;
        console.log("Adding late collectible");
        //console.log(state.collectibles);
      }
      socket.broadcast.emit("add-grabbable-primitive", d);
    });
 
    socket.on("post-release", grabbableName => {
      socket.broadcast.emit("post-release", grabbableName);
    });
  }
};
module.exports = bodies;

