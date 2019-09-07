let ADMIN = window.ADMIN = {};

ADMIN.socket;


// replace all feather icons
feather.replace();




// LOGIN

let projectInput = document.querySelector('#project');
let adminkeyInput = document.querySelector('#adminkey');
let cachedKey = '';
const login = _=>{
  
    
    ADMIN.projectURL = `https://${projectInput.value}.glitch.me`;
    
    // ADMIN SOCKET CONNECTION TO CS1 GAME ENGINE PROJECT
    ADMIN.socket = io(ADMIN.projectURL);

    ADMIN.socket.on('connect',data=>{
      console.log(`Socket opened to ${ADMIN.projectURL}.`);
      if(cachedKey!=''){
        
        ADMIN.socket.emit('admin-key',cachedKey,d=>{
          if(d=='success'){
            console.log('Reauthorizing server connection ...');        
          } 
         });
        
        
        
      }
      
    });

    ADMIN.socket.on('disconnect',data=>{
       ADMIN.socket.emit('admin-key',cachedKey,d=>{
        if(d=='success'){
          console.log('Reauthorizing server connection ...');  
          if(ADMIN.awaitingServerRefresh)ADMIN.db.getUsers();
        } 
       });
    });
    
    ADMIN.socket.on('msg',d=>{
      
      
       msg(d);
      
      
    });
    
    ADMIN.socket.on('log',d=>{
      
      
       console.log(d);
      
      
    });
    
    function msg(d,show=true){
      
      let msg = document.createElement('dialog');
      msg.innerHTML = `<h2>${d}</h2>`;
      document.body.appendChild(msg);
      if(!show)msg.setAttribute('style','display:none');
      if (typeof msg.showModal === "function") {
          msg.showModal();
          setTimeout(_=>{
            msg.close();
            msg.parentNode.removeChild(msg);
          },1400)
        } else {
          alert("The dialog API is not supported by this browser");
          msg.parentNode.removeChild(msg);
        }
      
    }
  
  function warn(name){
    
      let msg = document.createElement('dialog');
      msg.classList = "msg-warn";
      msg.innerHTML = `<h2>Delete user ${name}?</h2>`;
      let okBtn = document.createElement('button');
      okBtn.style.marginRight = '20px';
      okBtn.style.backgroundColor = 'lightgreen';
      okBtn.innerText = 'OK';
      okBtn.onclick = e=>{
        ADMIN.removeUser(name);
        msg.close();
        msg.parentNode.removeChild(msg);
      };
      let cancelBtn = document.createElement('button');
      cancelBtn.style.backgroundColor = 'pink';
      cancelBtn.innerText = 'CANCEL';
      cancelBtn.onclick = e=>{
        msg.close();
        msg.parentNode.removeChild(msg);
      };
      msg.appendChild(okBtn);
      msg.appendChild(cancelBtn);
      document.body.appendChild(msg);
      if (typeof msg.showModal === "function") {
          msg.showModal();
          
        } else {
          alert("The dialog API is not supported by this browser");
          msg.parentNode.removeChild(msg);
        }
    
  }
  
    
    
    
    
    //ADMIN.db.set({"name":"admin","data":{"pw":"449"}},r=>{msg(r)});
    
    const names = ['Lisa','Bobby','Mindy','Larry','Wendy','Diana'];
    const passes = ['bigFriday','lazySunday','noisyStreet','happyMonday','sillyNilly','wuzUp'];
    
    ADMIN.socket.emit('admin-key',adminkeyInput.value,d=>{
      if(d=='success'){
        document.body.focus();
        cachedKey = adminkeyInput.value;
        console.log('ADMIN.socket has been authorized.');
        
        const cb = r=>{console.log(r)};
        
        ADMIN.db = {};
        ADMIN.db.set = (nameDataObject,cb)=>{
          ADMIN.socket.emit('db-set', nameDataObject, cb);
        }
   
        ADMIN.db.get = (key,cb)=>{
          ADMIN.socket.emit('db-get', key, cb);
        }
        
        ADMIN.addUser =(name,pw,cb)=>{
      
          ADMIN.socket.emit('add-user',{key:cachedKey,name:name,pw:pw},cb);

        }
        
        ADMIN.removeUser = (name)=>{
          ADMIN.socket.emit('db-remove-user',name,r=>{
            if(r=="success"){
              ADMIN.db.getUsers();
            }
          });
        }
    
        ADMIN.updatePassword=(name,pw,cb)=>{
          ADMIN.db.set({"name":name,"data":{"pw":pw}},cb);
        }
        
        ADMIN.db.getUsers = (cb)=>{
          ADMIN.socket.emit('db-get-users', users=>{
            const c = document.querySelector('#users-card .card-body'); 
            c.innerHTML = '';
            msg('',false);
            ADMIN.users = users;
            users.forEach( (user,index)=>{
              c.innerHTML+=`<span id="up${index}" class="user"><i class="ubtn-remove" data-feather="x-circle"></i><i id="ubtn${index}" class="ubtn-ok" data-feather="save"></i>   name:<span>${user.name}</span>  pw:<span data-index=${index} class="editable" contenteditable="true">${user.pw}</span></span>`;
            });
            
            
            
            
            
            c.innerHTML+=`<span id="new-user"><i id="ubtn999" class="ubtn-new" data-feather="user"></i>   name: <span style="color:orange" data-index=999 class="editable nud" contenteditable="true">username</span>  pw:<span style="color:orange" data-index=999 class="editable nud pw" contenteditable="true">password</span></span>`;
            
            feather.replace();
            
            
            ADMIN.removeBtns = document.querySelectorAll('.ubtn-remove');
            ADMIN.removeBtns.forEach(btn=>{
              btn.onclick = e =>{
                const name = btn.parentNode.querySelector('span').innerText;
                warn(name);
              };
            });
            
            const nud = document.querySelectorAll('.nud');
            nud.forEach(n=>{
              n.addEventListener('focus',e=>{
                if(n.innerText=='username'){
                  e.target.innerHTML = names.pop();
                  document.querySelector(`#ubtn${e.target.dataset.index}`).classList="ubtn-dirty";
                }else if(n.innerText=='password'){
                  e.target.innerHTML = passes.pop();
                  document.querySelector(`#ubtn${e.target.dataset.index}`).classList="ubtn-dirty";
                }
                  
              });
            });
            
            document.querySelector('#ubtn999').addEventListener('click',e=>{
              if(e.target.classList=="ubtn-dirty"){
                const name = e.target.parentNode.querySelector('span').innerText;
                const pw = e.target.parentNode.querySelector('span [class="editable nud pw"]').innerText;
                ADMIN.addUser(name,pw,res=>{
                  if(res="success"){
                    ADMIN.db.getUsers();
                  }
                });
              }
            });
            
            ADMIN.userBtns = document.querySelectorAll('.ubtn-ok');
            ADMIN.userBtns.forEach(btn=>{
              btn.onclick = e=>{
                if(btn.classList=="ubtn-dirty"){
                  const name = btn.parentNode.querySelector('span').innerText;
                  const pw = btn.parentNode.querySelector('span [class="editable"]').innerText;
                  ADMIN.updatePassword(name,pw,res=>{
                     if(res=="success"){
                       btn.classList="ubtn-ok";
                       ADMIN.awaitingServerRefresh=true;
                     }
                  });

                }
                
              }
            });
            ADMIN.editables = document.querySelectorAll('.editable');
            ADMIN.editables.forEach(editable=>{
              editable.addEventListener('keydown',e=>{
               document.querySelector(`#ubtn${e.target.dataset.index}`).classList="ubtn-dirty";
                if(e.code=='Enter'){
                  e.preventDefault();
                  e.target.blur();
                  
                }else if(isNumberKey(e) || isAlphaNumeric(e)){
                  //document.querySelector(`#ubtn${e.target.dataset.index}`).classList="ubtn-dirty";
                }else{
                  e.preventDefault();
                }
                
                
              });
              
              ADMIN.isMobile = function() {
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
};
    
if(ADMIN.isMobile()){
                
    editable.addEventListener('input',e=>{
      const str = editable.innerText.replace(/[^0-9a-z]/gi, '');
      editable.innerText = str;
      const sel = window.getSelection();
      sel.collapse(editable.firstChild, editable.innerText.length);
                
  });        
  
  
                
                
}
            
              
              
              
              
            });
            
            
          });
        }
        
        ADMIN.getLogoURL = ()=>{
          ADMIN.socket.emit('get-logo-url',r=>{
            if(r.result=="success"){
              const icon = document.querySelector('#icon');
              icon.innerHTML=`<img src=${r.url}/>`;
            }
          });        
        }
        
        ADMIN.getLogoURL();
        
        const usersCard = document.querySelector('#users-card');
        const usersCardBody = usersCard.querySelector('.card-body');
        
        
        ADMIN.db.getUsers();
        usersCard.style.display='block';
        
        
        
        
        // const icon = document.querySelector("link[rel='shortcut icon']").href;
        // document.querySelector("#icon").innerHTML = `<image src=${icon}/>`;
        
      }else{
        console.log('Failed to authorize ADMIN.socket.');
      } 
    });
    
    
    ADMIN.socket.on('new-admin-key',newkey=>{
       cachedKey = newkey;   
    });
    
        
  
}
setTimeout(_=>{
  
  if(adminkeyInput.value.length>0)login();
  
},1500);
adminkeyInput.addEventListener('keydown',e=>{
  if(e.which==13 && (projectInput.value.length>0)  ){
    login();
  }
});


function isNumberKey(evt){ // Numbers only
  var charCode = (evt.which) ? evt.which : event.keyCode;
  if (charCode > 31 && (charCode < 48 || charCode > 57))
      return false;
  return true;
}
     
function isAlphaNumeric(e){ // Alphanumeric only
  let k;
  document.all ? k=e.keycode : k=e.which;
  return((k>47 && k<58)||(k>64 && k<91)||(k>96 && k<123)||k==0);
}