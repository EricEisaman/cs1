if(window.config.theme.fontFamily.length > 0){
  let link = document.createElement('link');
  //<link href="https://fonts.googleapis.com/css?family=Megrim" rel="stylesheet" type="text/css">
  link.rel="stylesheet";
  link.type="text/css";
  link.href=`https://fonts.googleapis.com/css?family=${window.config.theme.fontFamily}`;
  document.querySelector('head').appendChild(link);
  document.querySelector('.login-background').style.fontFamily=`"${window.config.theme.fontFamily}",sans-serif`;
  document.fonts.ready.then(()=>{
    document.querySelector('a-scene').addEventListener('loaded', function (){
      $('.login').show();
      $('#un').focus();
    }); 
  });
}else {
  $('.login').show();
  $('#un').focus();
}
document.querySelector('.login').style.color=window.config.theme.fontColor;
document.querySelector('.login-header').style.fontSize=(window.config.theme.fontSize * 100) + "%";
document.querySelectorAll('.login-form span').forEach(s=>{s.style.fontSize=(window.config.theme.fontSize * 70) + "%"});

$('.error-page').hide(0);

// $('.login-button , .no-access').click(function(){
//   $('.login').slideUp(500);
//   $('.error-page').slideDown(1000);
// });

$('.try-again').click(function(){
  $('.error-page').hide(0);
  $('.login').slideDown(1000);
  $('#un').focus();
});

$('.login-background').css('background',window.config.theme.overlayColor);

$('#game-name').html(window.config.gameName);
if(window.config.theme.backgroundColor != "")$('.login-form').css('background',window.config.theme.formColor);



$('.login-button').click((e)=>{
  e.preventDefault();
  if($('#un').val()=="" || $('#pw').val()=="")return;
  window.socket.login({
    name:$('#un').val(),
    pw:$('#pw').val()
  });
  $('.login').slideUp(500);
  $('#un').val('');
  $('#pw').val('');
  if(window.config.releasePointerLockOnUI){
          let c = document.getElementsByTagName('canvas')[0];
          c.requestPointerLock();
        }
});

window.login.fail = msg=>{
  $('.try-again').html(msg);
  $('.error-page').slideDown(1000);
}

$('#pw').on('keydown',e=>{
  if(e.keyCode == 13 && $('#un').val() != '' && $('#pw').val() != ''){
   window.socket.login({
      name:$('#un').val(),
      pw:$('#pw').val()
    });
    $('.login').slideUp(500);
    $('#un').val('');
    $('#pw').val('');
    if(window.config.releasePointerLockOnUI){
          let c = document.getElementsByTagName('canvas')[0];
          c.requestPointerLock();
        }
  }
});