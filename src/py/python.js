import script from './python-script';

export default(()=>{
  
  const d=document.createElement('div');
  d.innerHTML=script;
  window.z92$ = d;
    
  const b = document.createElement('script');
  b.src="https://cdnjs.cloudflare.com/ajax/libs/brython/3.7.3/brython.min.js"
  document.head.appendChild(b);
    
  const pre = window.onload;
  window.python_start = e=>{pre();document.body.appendChild(z92$);brython({debug: 1, py_id:['mypy']})}
  
})()