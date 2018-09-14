window.dialog = {
  init:()=>{
    window.dialog.isShowing = false;
    window.dialog.button = document.getElementById('submit-message');
    window.dialog.submit =()=>{
      let msg = document.getElementById('msg').value;
      document.getElementById('msg').value = '';
      if(window.socket.isInitialized) window.socket.emit('msg',{msg:msg});
    }
    window.dialog.ui = document.getElementById('dialog');
    window.dialog.isShowing = false;
    document.body.addEventListener('keydown',function(e){
      if(e.code == window.config.keys.toggleUI ){
        window.dialog.toggleUI(e);
      }else if(e.keyCode == 13 && window.dialog.isShowing 
               && document.getElementById('msg').value.length > 0){
        if(window.iOS)window.dialog.ui.style.display = "none";
        window.dialog.submit();
        window.dialog.ui.close();
        window.dialog.isShowing = false;
        if(window.config.releasePointerLockOnUI){
          let c = document.getElementsByTagName('canvas')[0];
          c.requestPointerLock();
        }
        
      }
      
    });
    window.config.avatar.buttonFaces.forEach((url,index)=>{
      let btns = document.getElementById('btns');
      let btn = document.createElement('button');
      btn.classList = "face-btn";
      btn.style.backgroundColor = window.config.avatar.buttonColor;
      btn.innerHTML = '<img width=40 src="'+url+'" />';
      btn.id = index;
      btn.onclick = ()=>{
       window.setPlayerProperty('faceIndex',index);
       if(window.iOS)window.dialog.ui.style.display = "none";
       window.dialog.submit();
       window.dialog.ui.close();
       window.dialog.isShowing = false;
      }
      btns.appendChild(btn);
    });
    document.querySelector('#dialog h3').innerHTML = window.config.gameName;
    document.querySelector('#dialog h3').style.fontFamily=`"${window.config.theme.fontFamily}",sans-serif`;
    document.querySelector('#dialog h3').style.color= window.config.theme.fontColor;
    document.querySelector('#dialog h3').style.fontSize=(window.config.theme.fontSize*65) + "%";
    document.querySelector('#dialog h3').style.backgroundColor= window.config.theme.formColor;
    document.querySelector('.modal-header').style.borderBottom= `8px solid ${window.ColorLuminance(window.config.theme.formColor,0.8)}`;
    document.querySelectorAll('.modal-footer').forEach(elem=>{
      elem.style.borderTop = `4px solid ${window.ColorLuminance(window.config.theme.formColor,0.8)}`;
    });

    document.querySelectorAll('input,button').forEach(elem=>{
     let bc = elem.style.borderColor;
     let bs = elem.style.boxShadow;
     let o = elem.style.outline;
     elem.addEventListener('focus',e=>{
       elem.style.borderColor = window.config.theme.formColor;
       elem.style.boxShadow = `0 1px 1px rgba(0, 0, 0, 0.075) inset, 0 0 8px ${window.ColorLuminance(window.config.theme.formColor,0.97)}`;
       elem.style.outline = '0 none';
     });
     elem.addEventListener('blur',e=>{
       elem.style.borderColor = bc;
       elem.style.boxShadow = bs;
       elem.style.outline = o;
     }); 
    });
    
    
  },
  toggleUI: (e)=>{
  
    if(window.dialog.isShowing){
          window.dialog.ui.close();
          window.dialog.isShowing = false;
          if(window.config.releasePointerLockOnUI){
            let c = document.getElementsByTagName('canvas')[0];
            c.requestPointerLock();
          }
        }else if(typeof window.setPlayerProperty != "undefined"){
          e.preventDefault();
          document.getElementById('msg').value = '';
          window.dialog.ui.show();
          window.dialog.isShowing = true;
          if(window.config.releasePointerLockOnUI){
            document.exitPointerLock = document.exitPointerLock    ||
                                     document.mozExitPointerLock;
            // Attempt to unlock
            document.exitPointerLock();
          }
        }
  
  }
}
window.dialog.init();

// by @craigbuckler
function ColorLuminance(hex, lum) {

	// validate hex string
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;

	// convert to decimal and change luminosity
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}

	return rgb;
}

window.iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream; 
var mylatesttap;
if(AFRAME.utils.isMobile() && !window.iOS) {
    document.body.addEventListener('click',e=>{
    var now = new Date().getTime();
     var timesince = now - mylatesttap;
     if((timesince < 600) && (timesince > 0)){
      // double tap 
      window.dialog.toggleUI(e);
     }else{
      // single tap
     }
     mylatesttap = new Date().getTime();
  });

}

if(window.iOS){
  let dialogToggle = document.createElement('div');
  dialogToggle.style.zIndex = 10;
  dialogToggle.style.position = 'fixed';
  dialogToggle.style.top = 0;
  dialogToggle.style.right = 0;
  dialogToggle.style.width = (window.innerWidth / 2) + 'px';
  dialogToggle.style.height = (window.innerHeight / 2) + 'px';
  document.body.appendChild(dialogToggle);
  dialogToggle.addEventListener('click',function(e){
    e.preventDefault();
    if(window.dialog.isShowing){
     window.dialog.ui.style.display = "none";
     window.dialog.isShowing = false;
    }else{
     window.dialog.ui.style.display = "block";
     document.getElementById('msg').focus();
     window.dialog.isShowing = true;
    }
  }); 
}
