import config from '../../../.data/client-config.json';
export default(()=>{
window.onload = e=>{
  let loginHTML = `
<div class="modal fade" id="login-modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" style="display: block;">
    <div class="modal-dialog">
		  <div class="loginmodal-container">
          <image id="logo" src="" width="64px">
          <h3 id="gamename">CS1</h3>
			<div>	  
					<input  placeholder="username" class="q1">
          <input  placeholder="password" type="password" class="q2"> 
          <button id="lb">Submit</button> 
          <div style="color:red" id="login-msg"></div> 
      </div>				

			</div>
	</div>
</div>
`
 let loginContainer = document.querySelector('#login');
 loginContainer.innerHTML = loginHTML;
 document.querySelector('#logo').setAttribute('src',config.theme.logo);
 document.querySelector('#gamename').innerHTML = config.gameName;
 document.getElementById('lb').setAttribute('style',`background-color:${config.theme.formButtonColor}`);
 setTimeout(e=>{
   if(!(CS1 && CS1.socket.connected)){
     document.getElementById('login-msg').innerHTML = 'OFFLINE MODE';
      document.querySelector('#lb').setAttribute('value','Play Game Offline');
   }
 },1000);
 document.getElementById('lb').addEventListener("click",login);
 document.querySelector('.q2').addEventListener("keydown",e=>{
   if(e.code=='Enter')login(e);
 }); 
  
  function login(e){
    e.preventDefault(); 
    if(!(CS1 && CS1.socket.connected)){
      loginContainer.style.zIndex = -1;
      loginContainer.setAttribute('hidden','');
      CS1.myPlayer.components["movement-controls"].data.speed=CS1.myPlayer.startSpeed;
      CS1.sounds.playerJoined.play();
      setTimeout(()=>{CS1.say(CS1.game.announcements.welcome)},CS1.game.welcomeDelay);    
    }
    else if(document.querySelector('.q1').value.length > 0 && document.querySelector('.q2').value.length > 0){
     if(navigator.vendor.includes('Apple')){
        CS1.sounds.playerJoined.play()
         .catch(err=>{console.log(err)});
      } 
     CS1.login(document.querySelector('.q1').value,document.querySelector('.q2').value);
      document.querySelector('.q1').value = '';
      document.querySelector('.q2').value = '';
    }
  }
  
}
  
})()

