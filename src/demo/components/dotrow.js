export default (function dotrow(){
   
AFRAME.registerComponent('dotrow', {
  schema:{
   change: {type:'string',default:'x'},
   to: {type:'number',default:10}
  },
  init: function () {
    
    let changeDimension = this.data.change;
    let to = this.data.to;
    let elPosition = this.el.getAttribute('position');
    let from = elPosition[changeDimension];
    let yPosition = 1;
    let delta = (to>from)?2:-2;
    let cdIsX = (changeDimension=='x');
    
    //console.log(`preparing to add dots from ${from} to ${to} in the ${changeDimension} dimension with a delta of ${delta}.`);
    
    this.dots = [];

    let scn = document.querySelector('a-scene');
    
    for(let i = from;i*(delta/2) < to*(delta/2); i += delta){
      //console.log('adding dot...');
      let c = document.createElement('a-sphere');
      c.setAttribute('position',(cdIsX)?`${i} 1 ${elPosition.z}`:`${elPosition.x} 1 ${i}`);
      c.setAttribute('shader-frog', 'name:Ova_Shader');
      c.setAttribute('radius', '0.5');
      c.setAttribute('collectible','affects:pointsDial;value:10;threshold:1.6')  
      scn.appendChild(c);
      this.dots.push(c);
      
    }
    
    this.firstInitTime = Date.now();
    
  },
  update: function(){

     if((Date.now()-this.firstInitTime)<5000)return;
     console.log('updating dotrow...');
     
     this.dots.forEach(
       d=>{
         d.parentNode.removeChild(d);
       }
     );
     this.init();
  
  }
  
});

})()