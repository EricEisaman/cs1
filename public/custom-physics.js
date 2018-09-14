// <a-animation
//             attribute="rotation"
//             from="0 0 0"
//             to="0 360 0"
//             direction="forward"
//             dur="4000"
//             repeat="indefinite"
//             easing="linear">
//         </a-animation>


window.bodies = {};
window.setCustomPhysics = ()=>{
  let scene = document.querySelector('a-scene');
  scene.setAttribute('physics',`gravity:${window.config.physics.gravity}`);
  document.querySelector('[cursor]').setAttribute('raycaster',`far: ${window.config.physics.maxGrabDistance};`);
  window.config.physics.objects.forEach(o=>{
    let e = document.createElement('a-entity');
    switch(o.model){
      case "heart-light":
        e.setAttribute('geometry','primative:box;');
        e.setAttribute('shadow','cast: false');
        e.setAttribute('material','opacity:0');
        let m = document.createElement('a-entity');
        m.id = 'm'+Math.random().toFixed(4).toString().replace('.','');
        m.setAttribute('gltf-model',"url(https://cdn.glitch.com/dd72d0a0-2747-40ff-8463-f7755366f80f%2Fheart.glb?1534273139848)");
        let l = document.createElement('a-light');
        l.setAttribute('type','spot');
        l.setAttribute('angle','20');
        l.setAttribute('color','#fff');
        l.setAttribute('intensity','2');
        l.setAttribute('position','0 2 0');
        l.setAttribute('target',`#${m.id}`);
        m.appendChild(l);
        let a = document.createElement('a-animation');
        a.setAttribute('attribute','rotation');
        a.setAttribute('from','0 0 0');
        a.setAttribute('to','0 360 0');
        a.setAttribute('direction','forward');
        a.setAttribute('dur','4000');
        a.setAttribute('repeat','indefinite');
        a.setAttribute('easing','linear');
        m.appendChild(a);
        e.appendChild(m);
        break;
      case "heart":
        e.setAttribute('geometry','primative:box;');
        e.setAttribute('shadow','cast: false');
        e.setAttribute('material','opacity:0');
        let p = document.createElement('a-entity');
        p.id = 'm'+Math.random().toFixed(4).toString().replace('.','');
        p.setAttribute('gltf-model',"url(https://cdn.glitch.com/dd72d0a0-2747-40ff-8463-f7755366f80f%2Fheart.glb?1534273139848)");
        let q = document.createElement('a-animation');
        q.setAttribute('attribute','rotation');
        q.setAttribute('from','0 0 0');
        q.setAttribute('to','0 360 0');
        q.setAttribute('direction','forward');
        q.setAttribute('dur','4000');
        q.setAttribute('repeat','indefinite');
        q.setAttribute('easing','linear');
        p.appendChild(q);
        e.appendChild(p);
        break;
      default:
        e.setAttribute('geometry', o.geometry);
    }
    e.setAttribute('grabbable','');
    e.setAttribute('line','start:0 0 0;end:0 0 0;color:green');
    switch(o.material){
      case "shiny-crinkle": 
        e.setAttribute('material', `color:${o.color}; sphericalEnvMap: #sky; metalness: 1; roughness: 0.2; shader: standard; normalMap: #plaster`);
        break
      default:
        e.setAttribute('material', `color:${o.color}`);   
    }
    //e.setAttribute(o.type,(o.type == 'dynamic-body')?`mass:${o.mass}`:'' );
    e.setAttribute('static-body','');
    window.bodies[o.name]= e;
    e.setAttribute('position', o.position);
    scene.appendChild(e);
  });
}

window.updateBodies = (bodiesData)=>{
  if(Object.keys(window.bodies).length === 0 || !window.bodies[bodiesData[0].name] || !window.gameHasBegun) return;
  bodiesData.forEach( (d,index)=>{
    if(window.debug){
      console.warn('Individual body data from server:');
      console.log(d);
    } 
    if(d.position) window.bodies[d.name].object3D.position.copy(d.position);
		if(d.scale) window.bodies[d.name].object3D.scale.copy(d.scale);
		if(d.rotation) window.bodies[d.name].object3D.quaternion.copy(d.rotation);
  });
}