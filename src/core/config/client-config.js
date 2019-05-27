/*
Note most of this configuration file is a remnant of an
earlier iteration.  The look and function of this file
will surely be greatly changing.
*/
export default {
 gameName:"CS1 Agency Headquarters",
 welcomeMsg:"Welcome to CS1 Agency Headquarters . . . . . . All visitors are required to sign in at the welcome desk.",
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
      scale:0.75, yOffset:0.11,
      animations:{idle:"idle",walk:"walk"},
      msg:{color: 'orange',offset: '0 4 0'}
    },
    {
      url:"https://cdn.glitch.com/7001d18b-ab06-4934-84ee-f9bc0645e42c%2Fchip_eyes_pack.glb?1553596528401",
      scale:0.75, yOffset:0.11,
      animations:{idle:"idle",walk:"walk"},
      msg:{color: 'orange',offset: '0 4 0'}
    },
    {
      url:"https://cdn.glitch.com/7001d18b-ab06-4934-84ee-f9bc0645e42c%2Fchippewa.glb?1553596541620",
      scale:0.75, yOffset:0.11,
      animations:{idle:"idle",walk:"walk"},
      msg:{color: 'orange',offset: '0 4 0'}
    }
    ],
  buttonFaces: [
    "https://cdn.glitch.com/d9ff495e-24db-4a3f-b88d-05ddd4e02632%2Fdragon_orange.png?1543070170738",
    "https://cdn.glitch.com/d9ff495e-24db-4a3f-b88d-05ddd4e02632%2Fdragon_blue.png?1543070754969",
    "https://cdn.glitch.com/38098e30-bf12-4ed8-ba20-d2f4ba8f65a8%2Fdragon.png?1543064467876",
  ],
  buttonColor: '#fff'
 },
 //sounds object example: {url:<URL> , loop:<BOOLEAN>, volume:<NUMBER>}
 sounds:{
  playerJoined: {url:'https://cdn.glitch.com/f8abb766-9950-44ff-9adb-2f5f53fdaf1b%2Felevator.mp3?1552143572126'},
  playerLeft: {url:'https://cdn.glitch.com/f8abb766-9950-44ff-9adb-2f5f53fdaf1b%2Felevator_leave.mp3?1552207263640'},
  //yay: {url:'https://cdn.glitch.com/162b879e-fd42-40d9-8519-671d783b8c70%2Fyay.mp3?1538839840045',loop:false,volume:0.8},
  //hyperspace: {url:'https://cdn.glitch.com/7f007e49-e78d-40b6-964d-097554282381%2Fhyperspace.mp3?1545441819724',loop:false,volume:1.0} 
 },
 //Soundcloud track numbers from share/embed code
 bgm:{
  songs: [461828928,347139395,257421013],
  volume: 0.2,
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
 vr: false
}