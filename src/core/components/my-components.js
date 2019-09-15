export default (()=>{
  
  document.addEventListener('gameStart',e=>{
    
    CS1.scene.setAttribute('space','');
  
  });
  

  
  AFRAME.registerComponent('auto-magic', {
    schema:{
 
    },
    
    init: function () {
         
    },
    
    tick: function (t,dt) {
  
      if(Math.random() > 0.999){
        CS1.hud.magicDial.animateTo(CS1.hud.magicDial.value + 20);
      }
  	
    }
    
  });
  
  function b(a,b){
    return a*a + b*b;
  }
  
  AFRAME.registerComponent("space", {
      schema: {},
      init: function() {
        var t = document.createElement("canvas");
        (t.width = 2048), (t.height = 2048);
        var e = t.getContext("2d");
        (e.fillStyle = "#FF00FF"), e.fillRect(0, 0, t.width, t.height);
        for (
          var i = e.createImageData(t.width, t.height), n = i.data, o = 0;
          o < t.width;
          o++
        )
          for (var r = 0; r < t.height; r++) {
            var a = b((5 * o) / t.width, (5 * r) / t.height);
            (n[(s = 4 * (r * t.width + o)) + 0] = -25 * a + 41),
              (n[s + 1] = 7 * a + 10),
              (n[s + 2] = -8 * a + 59),
              (n[s + 3] = 255);
          }
        for (let e = 0; e < 1e4; e++) {
          let e = ~~(Math.random() * t.width);
          var s = 4 * (~~(Math.random() * t.height) * t.width + e);
          const i = ~~(255 * Math.random());
          (n[s + 0] = i / 2 + 128),
            (n[s + 1] = i),
            (n[s + 2] = i / 2 + 128),
            (n[s + 3] = 255);
        }
        e.putImageData(i, 0, 0),
          this.el.setAttribute("material", {
            shader: "flat",
            color: "white",
            src: t
          }),
          this.el.setAttribute("rotation", "0 -90 0");
      }
    });
  
  
  
})()