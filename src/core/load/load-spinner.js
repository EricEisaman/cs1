export default(()=>{

  window.addEventListener('load', function () {
    let loadSpinner = document.createElement('div');
    loadSpinner.className = 'lds-grid';
    for(let i=0;i<9;i++){
      loadSpinner.appendChild(document.createElement('div'));
    } 
    loadSpinner.style.left = window.innerWidth/2 - 32 + 'px';
    let loadingScreen =  document.querySelector('#loading-screen');
    loadingScreen.style.width = window.innerWidth + 'px';
    loadingScreen.style.height = window.innerHeight + 'px';
    loadingScreen.appendChild(loadSpinner);
  }, false);
  
})()