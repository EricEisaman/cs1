var pshapesShowing = 1;

function togglePShapes(){
  let a = document.querySelectorAll('.toggle-opacity');
  let v = (pshapesShowing) ? 0:1;
  a.forEach(ps=>{
   ps.setAttribute('opacity',v);
   pshapesShowing = v;
  });
}

togglePShapes();
