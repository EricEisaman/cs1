export default(()=>{
window.onload = e=>{
  let loginHTML = `
<div class="modal fade" id="login-modal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true" style="display: block;">
    <div class="modal-dialog">
		  <div class="loginmodal-container">
					<h1>CS1</h1><br>
				  <form id="login-form">
					  <input id="name" type="text" name="user" placeholder="Username">
					  <input id="pw" type="password" name="pass" placeholder="Password">
					  <input id="login-submit" type="submit" name="login" class="login loginmodal-submit" >
            <div id='login-msg'></div>
				  </form>
			</div>
	</div>
</div>
`
 let loginContainer = document.querySelector('#login');
 loginContainer.innerHTML = loginHTML;
 setTimeout(e=>{
   if(!(CS1 && CS1.socket.connected)){
     document.getElementById('login-msg').innerHTML = 'OFFLINE MODE';
     document.getElementById('login-submit').setAttribute('value','Play Game Offline');
   }
 },1000);
 document.getElementById('login-form').addEventListener("submit",function(e) {
    e.preventDefault(); 
    if(!(CS1 && CS1.socket.connected)){
      loginContainer.style.zIndex = -1;
      CS1.myPlayer.components["movement-controls"].data.speed=CS1.myPlayer.startSpeed;
      CS1.sounds.playerJoined.play();
      setTimeout(()=>{CS1.say(CS1.game.announcements.welcome)},CS1.game.welcomeDelay);    
    }
    else if(document.getElementById('name').value.length > 0 && document.getElementById('pw').value.length > 0){
     if(navigator.vendor.includes('Apple')){
        CS1.sounds.playerJoined.play()
         .catch(err=>{console.log(err)});
      } 
     CS1.login(document.getElementById('name').value,document.getElementById('pw').value);
      document.getElementById('name').value = '';
      document.getElementById('pw').value = '';
    }
  });
  
}
  
})()

