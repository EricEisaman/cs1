export default (function navpointer(){

  AFRAME.registerComponent('nav-pointer', {
  init: function () {
    const el = this.el;
// On click, send the NPC to the target location.
    el.addEventListener('click',e=>{
      const ctrlEl = el.sceneEl.querySelector('[nav-agent]');
      if(ctrlEl) ctrlEl.setAttribute('nav-agent', {
        active: true,
        destination: e.detail.intersection.point
      });
    });
    el.addEventListener('mouseenter',e=>{
      el.setAttribute('material', {color: 'green'});
    });
    el.addEventListener('mouseleave',e=>{
      el.setAttribute('material', {color: 'crimson'})
    });
    
    el.addEventListener('mousedown',e=>{
      //console.log(e);
    });
 
    // Refresh the raycaster after models load.
    el.sceneEl.addEventListener('object3dset',e=>{
      this.el.components.raycaster.refreshObjects();
    });
  }
});
  
})()