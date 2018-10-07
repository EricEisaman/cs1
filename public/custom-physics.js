// <a-animation
//    attribute="rotation"
//    from="0 0 0"
//    to="0 360 0"
//    direction="forward"
//    dur="4000"
//    repeat="indefinite"
//    easing="linear">
// </a-animation>


window.bodies = {};
window.setCustomPhysics = ()=>{
  let scene = document.querySelector('a-scene');
  scene.setAttribute('physics',`gravity:${window.config.physics.gravity}`);
  document.querySelector('[cursor]').setAttribute('raycaster',`far: ${window.config.physics.maxGrabDistance};`);
  window.config.physics.objects.forEach(o=>{
    let e = document.createElement('a-entity');
    e.setAttribute('position', o.position);
    switch(o.model){
      case "heart-light":
        e.setAttribute('geometry','primitive:box;');
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
        e.setAttribute('geometry','primitive:box;');
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
      case "custom":
        e = document.createElement('a-box');
        e.setAttribute('position', o.position);
        setTimeout(()=>{e.object3D.position.y += 0.5;},2000);
        e.className = 'toggle-opacity';
        e.setAttribute('geometry','width:1;depth:1;height:1');
        e.setAttribute('scale',o.physics_scale || '1 1 1');
        e.setAttribute('shadow','cast: false');
        e.setAttribute('opacity',0);
        let t = document.createElement('a-entity');
        setTimeout(()=>{t.object3D.position.y -= 0.5;},2000);
        t.object3D.position.y -= 0.5;
        t.id = 'm'+Math.random().toFixed(4).toString().replace('.','');
        t.setAttribute('gltf-model',`url(${o.url})`);
        t.setAttribute('scale',o.scale);
        e.appendChild(t);
        break;
      default:
        e.setAttribute('geometry', o.geometry);
    }
    e.setAttribute('grabbable','');
    switch(o.material){
      case "shiny-crinkle": 
        e.setAttribute('material', `color:${o.color}; sphericalEnvMap: #sky; metalness: 1; roughness: 0.2; shader: standard; normalMap: #plaster`);
        break
      default:
        e.setAttribute('material', `color:${o.color}`);   
    }
    if(typeof o.sound != 'undefined'){
      let s = document.createElement('a-sound');
      s.setAttribute('src',`src:url(${o.sound.url})`);
      s.setAttribute('autoplay', o.sound.autoplay || true);
      if(typeof o.sound.autoplay == 'undefined') e.soundState = 0;
      else e.soundState = 1;
      s.setAttribute('loop', o.sound.loop || true);
      s.setAttribute('volume', o.sound.volume || 1);
      e.appendChild(s);
    }
    e.setAttribute('static-body','');
    e.setAttribute('rotation', o.rotation || '0 0 0');
    window.bodies[o.name]= e;
    scene.appendChild(e);
  });
}

window.updateBodies = (bodiesData)=>{
  if(Object.keys(window.bodies).length === 0 || !window.bodies[bodiesData[0].name] || !window.gameHasBegun) return;
  bodiesData.forEach( (d,index)=>{
    let b = window.bodies[d.name];
    if(window.debug){
      console.log('Individual body data from server:');
      console.log(d);
    } 
    if(d.position) b.object3D.position.copy(d.position);
		if(d.scale) b.object3D.scale.copy(d.scale);
		if(d.rotation) b.object3D.quaternion.copy(d.rotation);
    if(typeof d.soundState != 'undefined'){
      if(d.soundState) playBodySound(d.name);
      else stopBodySound(d.name);
    }
  });
}