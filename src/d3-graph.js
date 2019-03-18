export default (function player(){
  
  AFRAME.registerComponent('d3-graph', {
    schema:{
      side: {type:'string', default:'front'},
      url: {type:'string', default:''}
    },
    dependencies: ['geometry', 'material'],
    init: function () {
      this.canvas=document.createElement('canvas');
      this.canvas.id=CS1.utils.uid();
      this.canvas.setAttribute('crossOrigin','anonymous');
      document.querySelector('a-scene').appendChild(this.canvas);
      this.el.setAttribute('material',`shader:flat;src:#${this.canvas.id};side:${this.data.side}`);
      
      this.cursor = document.querySelector('#cam-cursor');

      var ctx = this.ctx = this.canvas.getContext('2d');
      ctx.fillStyle = 'rgb(0, 0, 0)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);  
      this.dataProcessed=false;
      fetch(this.data.url)
        .then(resp=>{return resp.json()})
        .then(json=>{this.processData(json)})
        .catch(err=>{console.log(err)})
    },
    processData: function(dataToProcess){
        this.data = [];
        dataToProcess.list.forEach(day=>{
          //console.log(day.dt_txt , this.k2f(day.main.temp_max)+'F');
          this.data.push({dt:day.dt_txt,temp_max:this.k2f(day.main.temp_max)});
        });
        this.dataProcessed=true;
    },
    k2f: function(k){
      return Math.round((k - 273.15) * 9/5 + 32);
    },
    tick: function(t,dt){
      if(!this.dataProcessed)return;
      this.visualizeData(t);
      this.updateCanvas(); 
    },
    visualizeData: function(t){
      let canvas = this.canvas;
      let dt_width = canvas.width/this.data.length;
      let ctx = this.ctx;
      if(this.cursor.getAttribute('material').color=='green')t=1000;
      this.data.forEach((d,i)=>{
        let hue = t*(d.temp_max / 500);
        ctx.fillStyle = 'hsl(' + hue + ', 50%, 30%)';
        ctx.fillRect(i*dt_width, 0, dt_width, canvas.height);
      });
      
      
      
    
    },
    drawRectangles: function(t){
      var canvas = this.canvas;
      var ctx = this.ctx;
      var x;
      var y;
      var hue = t / 10;
      ctx.fillStyle = 'hsl(' + hue + ', 50%, 80%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      hue = t / 15;
      ctx.fillStyle = 'hsl(' + hue + ', 50%, 60%)';
      x = canvas.width / 10;
      y = canvas.height / 10;
      ctx.fillRect(x, y, canvas.width - x * 2, canvas.height - y * 2);
      hue = t / 20;
      ctx.fillStyle = 'hsl(' + hue + ', 50%, 40%)';
      x = canvas.width / 5;
      y = canvas.height / 5;
      ctx.fillRect(x, y, canvas.width - x * 2, canvas.height - y * 2);
    },
    updateCanvas: function(){
      var el = this.el;
      var material;
      material = el.getObject3D('mesh').material;
        if (!material.map) {
            return;
      }
      material.map.needsUpdate = true;   
    }
    
  });
  
})()