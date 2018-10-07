window.config = {
 gameName:"CS1",
 // https://emojipedia.org/  leave as "" if you want no emoji
 emoji:"💫",
 // https://www141.lunapic.com/editor/  http://icoconvert.com/
 favicon:"https://cdn.glitch.com/684a531a-502e-4b52-a097-a4bc6aaed6cb%2Fstar.ico",
 theme:{
  // https://fonts.google.com/ examples: Kirang Haerang, Megrim, Permanent Marker, Orbitron, Monoton
  fontFamily:"Cabin Sketch",
  fontColor:"#063684",
  formColor:"#f7d85d",
  overlayColor:"rgba(226, 204, 136, 0.8)",
  fontSize:3
 },
 avatar:{
  models:["https://cdn.glitch.com/f54ba682-ab47-46e4-bf61-5e68e6053f18%2Fthing-idle.glb?1532828880828",
          "https://cdn.glitch.com/f54ba682-ab47-46e4-bf61-5e68e6053f18%2Fowl.glb?1532839615976",
          "https://cdn.glitch.com/162b879e-fd42-40d9-8519-671d783b8c70%2Fgreeny_animated.glb?1537474053675",
          "https://cdn.glitch.com/162b879e-fd42-40d9-8519-671d783b8c70%2Fred_thing.glb?1537622937733"],
  buttonFaces: ["https://cdn.glitch.com/f54ba682-ab47-46e4-bf61-5e68e6053f18%2Fweebs.png?1532833980859",
          "https://cdn.glitch.com/f54ba682-ab47-46e4-bf61-5e68e6053f18%2Fowl.png?1532839076824",
          "https://cdn.glitch.com/162b879e-fd42-40d9-8519-671d783b8c70%2Fgreeny_btn.png?1537463045668",
          "https://cdn.glitch.com/162b879e-fd42-40d9-8519-671d783b8c70%2Fred_thing.png?1537622885960"],
  buttonColor: '#fff',
  speed: 140
 },
 sounds:{
  playerJoined: {url:'https://cdn.glitch.com/264357be-a97e-43ca-8194-b6020c6fd45e%2Fdoorbell.mp3'},
  playerLeft: {url:'https://cdn.glitch.com/3294c4a3-a3d8-412f-a31e-1e03d1cd1cbd%2Fplayer-leave.mp3?1532440646173'},
  yay: {url:'https://cdn.glitch.com/162b879e-fd42-40d9-8519-671d783b8c70%2Fyay.mp3?1538839840045',loop:false,volume:0.8}
 },
 msg:{
  color: "#063684"
 },
 // https://github.com/feiss/aframe-environment-component
 environment:{
  preset:"forest",
  seed:0.3,
  shadow:true,
  playArea:1.3, 
  shadow:true,
  shadowSize:10,
  dressing:"",
  dressingAmount:12, 
  dressingColor:"",
  dressingScale:15,
  dressingVariance:"20 30 40",
  dressingUniformScale:false,
  fog:0.7, 
  flatShading:false,
  skyType:"", 
  horizonColor:"", 
  skyColor:"",
  ground:"",
  groundYScale:5,
  groundTexture:"",
  groundColor:"",
  groundColor2:"",
  grid:"",
  gridColor:"",
  lighting:"",
  lightPosition:""
 },
 //Soundcloud track numbers from share/embed code
 bgm:{
  songs: [187091374,47209929,265693310,120585130,156420873,180582345,1801713],
  volume: 0.15,
  playAll: true,
  initialDelay: 5000
 },
 releasePointerLockOnUI: true,
 //SEE REF. http://keycode.info/
 keys:{
  toggleUI:'Equal',
  nextSong:'KeyP',
  toggleMute:'Digit0',
  toggleCursor:'KeyC'
 },
 //Run printVoices() in the game browser console
 voice:{
   name:'Serena',
   // from 0.1 to 10
   rate: 1,
   // from 0 to 2
   pitch: 1,
   // from 0 to 1
   volume: 1,
   // delay in milliseconds 
   welcomeDelay: 2000
 },
 physics:{
   //This gravity affects the players
   gravity: -9.8,
   maxGrabDistance: 40,
   //These objects are not affected by gravity or collisions, but you can grab and move them
   // https://github.com/aframevr/aframe/blob/master/docs/components/geometry.md
   // These objects require a unique name.
   objects:[
      {name:'Big Sphere', geometry:'primitive: sphere; radius: 2',position:'-10 5 -10',color:'#e59a19'},
      {name:'First Little Sphere',geometry:"radius:0.6;primitive:sphere",position:'-5 3 -10',color:'#FFF'},
      {name:'Second Little Sphere',geometry:"radius:0.6;primitive:sphere",position:'10 3 -10',color:'#FFF'},
      {name:'Cone',geometry:"height:5;primitive:cone",position:'10 7 -10',color:'#e59a19'},
      {name:'Big Torus',geometry:"radius:5;radiusTubular:0.3;primitive:torus",position:'0 8 -10',color:'#e59a19'},
      {name:'Little Torus',geometry:"radius:2;radiusTubular:0.8;primitive:torus",position:'0 21 -10',color:'#183ee5'},
      {name:'Box',geometry:"primitive:box;width:4;height:7;depth:2",position:'-20 12 -10',color:'#183ee5'},
      {name:'Shiny Cube',geometry:"primitive:box;width:4;height:4;depth:4",position:'-28 8 -10',color:'#FFF',material:'shiny-crinkle'},
      {name:'Shiny Sphere',geometry:'primitive: sphere; radius: 2',position:'-20 4 -10',color:'#FFF',material:'shiny-crinkle'},
      {name:'Heart',model:'heart',position:'-28 4 -10',color:'#FFF'},
      {name:'Boom Box',model:'custom',
       url:'https://cdn.glitch.com/d8401fe6-52a6-4c57-a271-36a0b25b97e8%2Fboom_box.glb?1538650649040',
       sound:{url:'https://cdn.glitch.com/d8401fe6-52a6-4c57-a271-36a0b25b97e8%2Fbeat.mp3?1538665641133'},
       scale:'0.06 0.06 0.06',position:'60.2 2.038 23.2',rotation:'0 -45 0',color:'#FFF'},
     {name:'Clock',model:'custom',
       url:'https://cdn.glitch.com/162b879e-fd42-40d9-8519-671d783b8c70%2Fclock.glb?1538858467717',
       sound:{url:'https://cdn.glitch.com/162b879e-fd42-40d9-8519-671d783b8c70%2Ftick_tock.mp3?1538858557825'},
       scale:'0.06 0.06 0.06',position:'15 0 23',rotation:'0 -45 0',color:'#FFF'},
     {name:'Bull Pug',model:'custom',
       url:'https://cdn.glitch.com/d8401fe6-52a6-4c57-a271-36a0b25b97e8%2Fbullpug.glb?1538661547665',
       sound:{url:'https://cdn.glitch.com/d8401fe6-52a6-4c57-a271-36a0b25b97e8%2Fdog_barking.mp3?1538666719402'},
       scale:'0.15 0.15 0.15',position:'22 0 28',rotation:'0 135 0',color:'#FFF'},
     {name:'Bird',model:'custom',
       url:'https://cdn.glitch.com/d8401fe6-52a6-4c57-a271-36a0b25b97e8%2Fbird.glb?1538670682969',
       sound:{url:'https://cdn.glitch.com/d8401fe6-52a6-4c57-a271-36a0b25b97e8%2Fbird.mp3?1538670877349',volume:0.3},
       scale:'0.12 0.12 0.12',position:'74.2 2.3 18.9',rotation:'0 -110 0',color:'#FFF'},
      {name:'Small Shiny Sphere',geometry:'primitive: sphere; radius: 1',position:'0 8 -10',color:'#FFF',material:'shiny-crinkle'}
      //{name:'Heart2',model:'heart-light',position:'0 18 -10',color:'#FFF'} 
    ]
 },
 thruster:{
   innerColor: "orange",
   outerColor: "white"
 },
 mobile:{
   thruster_icon: "https://cdn.glitch.com/162b879e-fd42-40d9-8519-671d783b8c70%2Fjump_fly_btn.png",
   joystick_outer_color: "rgba(5, 31, 101, 0.2)",
   joystick_inner_color: "rgba(5, 31, 101, 0.4)"
 },
 vr: false
}