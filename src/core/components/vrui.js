import config from '../../../.data/client-config.json';

export default(()=>{

AFRAME.registerSystem('vrui', {
  schema: {
	  panels: {default: 3}
  },
  
  dependencies: ['htmlembed'],
  
  init: ()=>{
    
    document.head.innerHTML += `

    
       <link href="https://fonts.googleapis.com/css?family=Roboto&display=swap" rel="stylesheet">
    <style>
    body{
      font-family: 'Roboto', sans-serif;
      
      font-size: 32px;
    }
    h1{
      font-size: 52px;
    }
    .dark{
      background-color: rgba(0,0,0,0.2);
      border-radius:50px;  
      background-repeat: no-repeat;
      background-position: bottom right;
      padding: 40px;
      color: #fff;
    }
    .main{
      width: 1024px;
      height: 900px;
      overflow: hidden;
    }
    .menu{
      width: 256px;
      height: 900px;
      text-align: center;
    }
    .menu ul{
      list-style-type: none;
      margin: 0;
      padding: 0;
    }
    a.button{
      display: inline-block;
      width: 100%;
      border-radius: 20px;
      background-color: #000;
      color: #fff;
      text-decoration: none;
      text-align: center;
      padding: 10px 0;
      margin-bottom: 20px;
    }
    a.button:hover{
      background-color: #fff;
      color: #888;
    }
    a.button:active{
      background-color: #fff;
      color: #888;
      box-shadow: 0px 0px 50px #00d2ff;
    }
    a.imgLink{
      width: 100%;
      border-radius: 20px;
      color: #fff;
      text-decoration: none;
      text-align: center;
      padding: 10px 0;
      margin-bottom: 20px;
      background-color: #444;
      border: 3px solid #444;
      text-shadow: none;
      display: block;
    }
    a.imgLink:hover{
      border: 3px solid #fff;
      background-color: #444;
    }
    .code{
      white-space: pre;
      font-size: 0.7em;
      background-color: #000;
      margin-bottom: 30px;
    }
    .next,.prev{
      position: absolute;
      bottom: 0px;
      right: 30px;
      display: inline-block;
      width: auto !important;
      padding: 20px 30px !important;
    }
    .prev{
      right: auto;
      left: 30px;
    }
    #page1{
      position: relative;
      height: 100%;
    }
    #page2, #page3, #page4{
      display: none;
      position: relative;
      height: 100%;
    }
    .slide{
      height:100%;
    }
    .slide:target #page1{
      display: none;
    }
    #slide2:target #page2{
      display: block;
    }
    #slide3:target #page3{
      display: block;
    }
    #slide4:target #page4{
      display: block;
    }
    #page4 ul{
      list-style-type: square;
      font-size: 0.8em;
    }
    </style>
  `;
    
    
    AFRAME.registerComponent('showbutton', {
      schema: {
        'target': {type: 'selector'},
      },
      init: function () {
        var show=false;    
        this.el.addEventListener("click",()=>{
          if(show){
            this.data.target.setAttribute("visible","false");
            this.el.querySelector("a").innerHTML="Show Box";
          }else{
            this.data.target.setAttribute("visible","true");
            this.el.querySelector("a").innerHTML="Hide Box";
          }
          show=!show;
        });
      }
    });
    
    let t =`<a-entity id="menu1" class="screen menu dark"  position="-2.712 1.5 -1.476" rotation="0 45 0">
       <h2>Menu</h2>
       <ul>
          <li><a id="b1" href="#" class="button">Stats</a></li>
          <li><a id="b2" href="#slide2" class="button">Mission</a></li>
          <li><a id="b3" href="#slide3" class="button">Interactivity</a></li>
          <li><a id="b4" href="#slide4" class="button">Limitations</a></li>
       </ul>
    </a-entity>
    <a-entity id="main" class="screen dark main" position="0 1.5 -2">
       <div id="page1">
         
       </div>
       <div id="page2">
          <h1>Mission</h1>
         <p>Roam the virtual world looking for mission clues. Be nice and helpful to everyone you meet.</p>
         <p>Once you have gathered enough clues and your mission is clear, gather the neccessary resources and fulfill your calling. 🦄</p>
           
           <a href="#" class="button prev">Prev Page</a>
           <a href="#slide3" class="button next">Next Page</a>
       </div>
       <div id="page3">
          <h1>Interactivity</h1>
          <p>You can add javascript interactivity in the standard way either by events on the elements themselves or alternatively by adding event listeners to the DOM.</p>
          <div class="code">  
             cubebutton.addEventListener("click",function(){
             if(show){
             box.setAttribute("visible","false");
             cubebutton.innerHTML="Show Box";
             }else{
             box.setAttribute("visible","true");
             cubebutton.innerHTML="Hide Box";
             }
             show=!show;
             });
          </div>
          <a-entity id="showbutton" showbutton="target:#box"><a class="button" href="javascript:void(0)">Show Box</a></a-entity>
          <a href="#slide2" class="button prev">Prev Page</a>
          <a href="#slide4" class="button next">Next Page</a>
       </div>
       <div id="page4">
          <h1>Limitations</h1>
          <ul>
             <li>All styles and images must be in the same origin or allow access via CORS; this allows the component to embed all of the assets required to render the html properly to the canvas via the foreignObject element. </li>
             <li>transform-style css is limited to flat. This is mainly due to it not being rendered properly to canvas so element bounding for preserve-3d has not yet been implemented. If the rendering is fixed as some point I may go back and get it working as well.</li>
             <li>"a-" tags do not render correctly as XHTML embeded into SVG, so any parent "a-" elements of the embed html will be converted to div tags for rendering. This may mean your css will require modification.</li>
             <li>Elements that require rendering outside of the DOM such as the iframe and canvas element will not work.</li>
             <li>:before and :after pseudo elements can't be accessed via the DOM so they can't be used in the element to determine the object bounds. As such, use them with caution. </li>
             <li>Form elements are not consistently rendered to the canvas element so some basic default styles are included for consistency.</li>
             <li>Currently there is no support for css transitions.</li>
          </ul>
          <a href="#slide3" class="button prev">Prev Page</a>
       </div>
    </a-entity>
    <a-entity id="menu2" class="screen menu dark" position="2.712 1.5 -1.476" rotation="0 -45 0">
       <h2>Avatars</h2>
       <a id="top-btn" class="imgLink" href="#">
          <img crossorigin="anonymous"   src="https://cdn.glitch.com/fec96da0-7526-4b9a-aecf-3abbbe7fcdc5%2Fchip.png?v=1567384714024" width="80" height="80">
          <div>Chip</div>
       </a>
       <a id="mid-btn" class="imgLink" href="#">
          <img crossorigin="anonymous"  src="https://cdn.glitch.com/fec96da0-7526-4b9a-aecf-3abbbe7fcdc5%2Fmel.png?v=1567389128396" width="80" height="80">
          <div>Mel</div>
       </a>
       <a id="bot-btn" class="imgLink" href="#">
          <img  crossorigin="anonymous" src="https://cdn.glitch.com/fec96da0-7526-4b9a-aecf-3abbbe7fcdc5%2Fvr.png?v=1567383953311" width="80" height="80">
          <div>VR-1</div>
       </a>
    </a-entity>
    <a-box material="src:#chip" scale="0.5 0.5 0.5" position="1 1 -1.5" id="box" visible="false"></a-box> `;
    
    const ec = document.createElement('a-entity');
    ec.setAttribute('style','visibility:hidden');
    ec.setAttribute('vrui','');
    ec.id = 'embed-container';
    ec.innerHTML = t;
    let scn = document.querySelector('a-scene');
    scn.appendChild(ec);
        
    
    document.addEventListener('gameStart',e=>{
      
    let nextBtn = document.createElement('a');
    nextBtn.href = '#slide2';
    nextBtn.classList = 'button next';
    nextBtn.innerText = 'Next Page';
    let w = document.createElement('div');
    w.style.width = '100%';
    w.style.height = '100%';
    w.appendChild(CS1.hud.container);
    w.appendChild(nextBtn);
    
    
    document.querySelector('#page1').appendChild(w);  
      
    let scn = document.querySelector('a-scene');
    let ctr = document.querySelector('#embed-container');
    ctr.setAttribute('visible',false);
    ctr.setAttribute('position','0 0.3 0');
    CS1.myPlayer.add(ctr);
    CS1.hud.container = ctr;
    let m = document.querySelector('#main');
    let m1 = document.querySelector('#menu1');
    let m2 = document.querySelector('#menu2');
    m.setAttribute('htmlembed','');
    m1.setAttribute('htmlembed','');
    m2.setAttribute('htmlembed','');


    function runOnce(){
      m1.setAttribute('sound','src:url(https://cdn.glitch.com/36918312-2de3-4283-951d-240b263949f7%2Fclick.mp3?v=1561929149589)');
      m2.setAttribute('sound','src:url(https://cdn.glitch.com/36918312-2de3-4283-951d-240b263949f7%2Fclick.mp3?v=1561929149589)');
      document.removeEventListener('click',runOnce);
    }


    document.addEventListener('click',runOnce);
    
    const box = document.querySelector('#box');

    let topBtn = document.querySelector('#top-btn');
    if(topBtn)topBtn.addEventListener('mouseenter',e=>{
  
      if(CS1.hud.container.getAttribute('visible')&&m2.components.sound)m2.components.sound.playSound()

    });
    if(topBtn)topBtn.addEventListener('click',e=>{
      e.preventDefault();
      box.setAttribute('material','src:#chip');
      CS1.socket.playerData.faceIndex = 1;
      CS1.myPlayer._avatarType = config.avatar.models[CS1.socket.playerData.faceIndex].type;
    });

    let midBtn = document.querySelector('#mid-btn');
    if(midBtn)midBtn.addEventListener('mouseenter',e=>{

      if(CS1.hud.container.getAttribute('visible')&&m2.components.sound)m2.components.sound.playSound()

    });
    if(midBtn)midBtn.addEventListener('click',e=>{
      e.preventDefault();
      box.setAttribute('material','src:#mel');
      CS1.socket.playerData.faceIndex = 2;
      CS1.myPlayer._avatarType = config.avatar.models[CS1.socket.playerData.faceIndex].type;
    });

    let botBtn = document.querySelector('#bot-btn');
    if(botBtn)botBtn.addEventListener('mouseenter',e=>{

      if(CS1.hud.container.getAttribute('visible')&&m2.components.sound)m2.components.sound.playSound()

    });
    if(botBtn)botBtn.addEventListener('click',e=>{
      e.preventDefault();
      box.setAttribute('material','src:#vr1');
      CS1.socket.playerData.faceIndex = 0;
      CS1.myPlayer._avatarType = config.avatar.models[CS1.socket.playerData.faceIndex].type;
    });


    let Btn1 = document.querySelector('#b1');
    if(Btn1)Btn1.addEventListener('mouseenter',e=>{

      if(CS1.hud.container.getAttribute('visible')&&m1.components.sound)m1.components.sound.playSound()

    });

    let Btn2 = document.querySelector('#b2');
    if(Btn2)Btn2.addEventListener('mouseenter',e=>{

      if(CS1.hud.container.getAttribute('visible')&&m1.components.sound)m1.components.sound.playSound()

    });

    let Btn3 = document.querySelector('#b3');
    if(Btn3)Btn3.addEventListener('mouseenter',e=>{

      if(CS1.hud.container.getAttribute('visible')&&m1.components.sound)m1.components.sound.playSound()

    });

    let Btn4 = document.querySelector('#b4');
    if(Btn4)Btn4.addEventListener('mouseenter',e=>{

      if(CS1.hud.container.getAttribute('visible')&&m1.components.sound)m1.components.sound.playSound()

    });
      
      
    document.querySelectorAll('.dark').forEach(e=>{
               e.classList.remove('screen')
              })  
      
    
    let lh = CS1.myPlayer.components.player.lh.components["oculus-touch-controls"];
    let rh = CS1.myPlayer.components.player.rh.components["oculus-touch-controls"];
    if(CS1.device=="Oculus Quest"){
       //AFRAME.utils.device.checkHeadsetConnected()
      
        let cursor = document.querySelector('a-cursor');
        cursor.pause();
        if(CS1.cam.components.raycaster)CS1.cam.components.raycaster.pause();
          lh.el.addEventListener('abuttondown',e=>{
            CS1.hud.container.object3D.rotation.y = CS1.cam.object3D.rotation.y;
            let v = CS1.hud.container.getAttribute('visible');
            CS1.hud.container.setAttribute('visible',!v);
            if(v){
              document.querySelectorAll('.dark').forEach(e=>{
               e.classList.remove('screen')
              })
            }else{
              document.querySelectorAll('.dark').forEach(e=>{
               e.classList.add('screen')
              })
            }
          });
          rh.el.addEventListener('abuttondown',e=>{
            CS1.hud.container.object3D.rotation.y = CS1.cam.object3D.rotation.y;
            let v = CS1.hud.container.getAttribute('visible');
            CS1.hud.container.setAttribute('visible',!v); 
            if(v){
              document.querySelectorAll('.dark').forEach(e=>{
               e.classList.remove('screen')
              })
            }else{
              document.querySelectorAll('.dark').forEach(e=>{
               e.classList.add('screen')
              })
            }
          });   
    } else if(CS1.device=="Standard") {
      
      document.addEventListener('keypress',e=>{
          if(e.code=='Backquote'){
            CS1.hud.container.object3D.rotation.y = CS1.cam.object3D.rotation.y;
            let v = CS1.hud.container.getAttribute('visible');
            CS1.hud.container.setAttribute('visible',!v);
            if(v){
              document.querySelectorAll('.dark').forEach(e=>{
               e.classList.remove('screen')
              })
            }else{
              document.querySelectorAll('.dark').forEach(e=>{
               e.classList.add('screen')
              })
            }
          }
        });       
          
    } else if(CS1.device=="Mobile"){
      
      
      document.addEventListener('doubleTapMenu',e=>{
        CS1.hud.container.object3D.rotation.y = CS1.cam.object3D.rotation.y;
        let v = CS1.hud.container.getAttribute('visible');
        CS1.hud.container.setAttribute('visible',!v);
        if(v){
              document.querySelectorAll('.dark').forEach(e=>{
               e.classList.remove('screen')
              })
            }else{
              document.querySelectorAll('.dark').forEach(e=>{
               e.classList.add('screen')
              })
            }
        
      });
      
      
    }  
      
      
      
    });
    
       
    
  },

  
  
  
});
  
})()