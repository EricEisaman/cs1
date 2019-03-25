export default {
 gameName:"CS1 Agency Headquarters . . . . . . The question of whether a computer can think is no more interesting than the question of whether a submarine can swim. . . Edsger W. Dijkstra",
 // https://emojipedia.org/  leave as "" if you want no emoji
 emoji:"🏰",
 // https://www141.lunapic.com/editor/  http://icoconvert.com/
 favicon:"https://cdn.glitch.com/38098e30-bf12-4ed8-ba20-d2f4ba8f65a8%2Fcoin.gif?1543018269225",
 theme:{
  // https://fonts.google.com/ examples: Kirang Haerang, Megrim, Permanent Marker, Orbitron, Monoton
  fontFamily:"New Rocker",
  titleFontColor:"#f2d15c",
  formFontColor:"white",
  formColor:"#0f3917",
  overlayColor:"rgba(0,0,0, 0.7)",
  fontSize:2
 },
 avatar:{
  models:[
    {
      url:"https://cdn.glitch.com/8f1d6c34-bcd8-4c19-a2c6-18d155fc1050%2Fchip_2.79.glb?1553371735573",
      scale:1, yOffset:0.7,
      animations:{idle:"idle",walk:"walk"},
      msg:{color: 'orange',offset: '0 3.7 0'}
    },
    {
      url:"https://cdn.glitch.com/8f1d6c34-bcd8-4c19-a2c6-18d155fc1050%2Fchip_skull_2.79.glb?1553387334223",
      scale:2, yOffset:3,
      animations:{idle:"idle",walk:"walk"},
      msg:{color: 'blue',offset: '0 4 0'}
    }
    ],
  buttonFaces: [
    "https://cdn.glitch.com/d9ff495e-24db-4a3f-b88d-05ddd4e02632%2Fdragon_orange.png?1543070170738",
    "https://cdn.glitch.com/d9ff495e-24db-4a3f-b88d-05ddd4e02632%2Fdragon_blue.png?1543070754969",
    "https://cdn.glitch.com/38098e30-bf12-4ed8-ba20-d2f4ba8f65a8%2Fdragon.png?1543064467876",
  ],
  buttonColor: '#fff',
  speed: 140
 },
 sounds:{
  playerJoined: {url:'https://cdn.glitch.com/f8abb766-9950-44ff-9adb-2f5f53fdaf1b%2Felevator.mp3?1552143572126'},
  playerLeft: {url:'https://cdn.glitch.com/f8abb766-9950-44ff-9adb-2f5f53fdaf1b%2Felevator_leave.mp3?1552207263640'},
  yay: {url:'https://cdn.glitch.com/162b879e-fd42-40d9-8519-671d783b8c70%2Fyay.mp3?1538839840045',loop:false,volume:0.8},
  splashIn: {url:'https://cdn.glitch.com/b10e1289-ada6-412c-a444-83b2ee39c4a0%2FsplashIn.mp3?1544623314600',loop:false,volume:0.8},
  splashOut: {url:'https://cdn.glitch.com/b10e1289-ada6-412c-a444-83b2ee39c4a0%2FsplashOut.mp3?1544623312237',loop:false,volume:0.8},
  hyperspace: {url:'https://cdn.glitch.com/7f007e49-e78d-40b6-964d-097554282381%2Fhyperspace.mp3?1545441819724',loop:false,volume:1.0} 
 },
 // https://github.com/feiss/aframe-environment-component
 environment:{
  preset:"default",
  seed:0.3,
  shadow:true,
  playArea:1, 
  shadow:true,
  shadowSize:10,
  dressing:"",
  dressingAmount:10, 
  dressingColor:"",
  dressingScale:15,
  dressingVariance:"20 30 40",
  dressingUniformScale:false,
  fog:0.4, 
  flatShading:false,
  skyType:"", 
  horizonColor:"", 
  skyColor:"",
  ground:"",
  groundYScale:5,
  groundTexture:"walkernoise",
  groundColor:"#032d26",
  groundColor2:"#564d19",
  grid:"",
  gridColor:"",
  lighting:"",
  lightPosition:""
 },
 //Soundcloud track numbers from share/embed code
 bgm:{
  songs: [95999380],
  volume: 0.05,
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
 showCursor:false,
 //Run printVoices() in the game browser console
 voice:{
   name:'Google UK English Female',
   // from 0.1 to 10
   rate: 1,
   // from 0 to 2
   pitch: 1,
   // from 0 to 1
   volume: 1,
   // delay in milliseconds 
   welcomeDelay: 4000
 },
 physics:{
   //This gravity affects the players
   gravity: -9.8,
   maxGrabDistance: 40,
   //These objects are not affected by gravity or collisions, but you can grab and move them
   // https://github.com/aframevr/aframe/blob/master/docs/components/geometry.md
   // These objects require a unique name.
   objects:[
      {name:'Blue Sphere', geometry:'primitive: sphere; radius: 2',position:'50 75 -40',color:'#00f'},
      {name:'Red Sphere', geometry:'primitive: sphere; radius: 2',position:'60 75 -40',color:'#f00'},
      {name:'Green Sphere', geometry:'primitive: sphere; radius: 2',position:'70 75 -40',color:'#0f0'}
    ]
 },
 collectibles:{
   itemDefs:[
     {type:'doge_coin',scale:'0.4 0.4 0.4',rotation:'0 0 0',threshold:3,
      positions:['15 0 -30','-15 0 -30','12 0 -35','-12 0 -35','9 0 -40','-9 0 -40','6 0 -45','-6 0 -45',
                '15 0 -65','-15 0 -65','12 0 -60','-12 0 -60','9 0 -55','-9 0 -55','6 0 -50','-6 0 -50'],
      url:'https://cdn.glitch.com/14597f75-728f-4d7e-bbd2-202118ee70e0%2Fdoge_coin.glb?1542836614183',
      collectSound:{url:'https://cdn.glitch.com/14597f75-728f-4d7e-bbd2-202118ee70e0%2Fcollect_bark_.mp3?1542837713162',volume:1},
      collectParticles:{type:'magic',color:'#fff',scale:4},
      callback:{name:'addPoints',params:{amount:100}},animation:{type:'rotY'}
     }  
   ]
 },
 readouts:{
   itemDefs:[
     {type:'scoreboard',scale:'16 10 0.1',color:'#a80003',
      positions:['-79 48 -30','50 48 -30'],
      rotations:['0 30 0','0 30 0'],
      textAttributes:{value:'Welcome to\nCastle Bridge',color:'white',scale:'9 9 1',align:'center',shader:'msdf',
                      position:'0 -1.5 0',
                      font:'https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/newrocker/NewRocker-Regular.json'}
     },
     {type:'instructions',scale:'4 1.5 0.1',color:'#a80003',
      positions:['1 2 -35'],
      rotations:['0 0 0'],
      textAttributes:{value:
`Ye Olde Game Instructions:
=========================
1) Collect Doge Coins to earn credits.
2) Spend your credits to ride the teleporters.
3) Be Friendly!`,color:'white',scale:'0.7 0.7 1',align:'left',shader:'msdf',
                      position:'-1.5 0 0',
                      font:'https://raw.githubusercontent.com/etiennepinchon/aframe-fonts/master/fonts/newrocker/NewRocker-Regular.json'}
     }  
   ]
 },
 mobile:{
   thruster_icon: "https://cdn.glitch.com/162b879e-fd42-40d9-8519-671d783b8c70%2Fjump_fly_btn.png",
   joystick_outer_color: "rgba(5, 31, 101, 0.2)",
   joystick_inner_color: "rgba(5, 31, 101, 0.4)"
 },
 vr: false
}