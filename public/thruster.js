/*
<a-entity id="thruster" position="10 10 0" rotation="180 0 0">
          <a-entity rotation="10 0 0" rain="width:0.5;height:8;splash:false;color:#f66;dropRadius:0.1,vector:0,-15,0;count:500"></a-entity>
          <a-entity rotation="0 0 10" rain="width:0.5;height:8;splash:false;color:#f66;dropRadius:0.1,vector:0,-15,0;count:500"></a-entity>
          <a-entity rotation="-10 0 0" rain="width:0.5;height:8;splash:false;color:#f66;dropRadius:0.1,vector:0,-15,0;count:500"></a-entity>
          <a-entity rotation="0 0 -10" rain="width:0.5;height:8;splash:false;color:#f66;dropRadius:0.1,vector:0,-15,0;count:500"></a-entity>

          <a-entity rotation="5 0 5" rain="width:0.5;height:6;splash:false;color:#f11;dropRadius:0.3,vector:0,-15,0;count:100"></a-entity>
          <a-entity rotation="5 0 -5" rain="width:0.5;height:6;splash:false;color:#f11;dropRadius:0.3,vector:0,-15,0;count:100"></a-entity>
          <a-entity rotation="-5 0 5" rain="width:0.5;height:6;splash:false;color:#f11;dropRadius:0.3,vector:0,-15,0;count:100"></a-entity> 
          <a-entity rotation="-5 0 -5" rain="width:0.5;height:6;splash:false;color:#f11;dropRadius:0.3,vector:0,-15,0;count:100"></a-entity> 
</a-entity>
*/

window.addThruster = player=>{
  let r1 = ['10 0 0','0 0 10','-10 0 0','0 0 -10'];
  let r2 = ['5 0 5','5 0 -5','-5 0 5','-5 0 -5'];
  let thruster = document.createElement('a-entity');
  thruster.setAttribute('rotation','180 0 0');
  thruster.setAttribute('position','0 -2 0');
  thruster.setAttribute('visible',false);
  for(let i=0;i<4;i++){
    let e = document.createElement('a-entity');
    e.setAttribute('rain',`width:0.5;height:8;splash:false;color:${window.config.thruster.outerColor};dropRadius:0.1,vector:0,-15,0;count:500`);
    e.setAttribute('rotation',r1[i]);
    thruster.appendChild(e);
  }
  for(let j=0;j<4;j++){
    let e = document.createElement('a-entity');
    e.setAttribute('rain',`width:0.5;height:6;splash:false;color:${window.config.thruster.innerColor};dropRadius:0.3,vector:0,-15,0;count:100`);
    e.setAttribute('rotation',r2[j]);
    thruster.appendChild(e);
  }
  player.appendChild(thruster);
  player.thruster = thruster;
}