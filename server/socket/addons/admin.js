const ideAPI = require('../../admin/ide/ide-api'); 

const admin = {
  name: 'admin',
  init: (socket,state) => {
  
   this.socket = socket;
   this.state = state;
   self = this;
   
   socket.on('admin-key',function(key,cb){
     if(key==process.env.ADMIN_KEY){
       console.log(`Admin credentials have been verified for socket id: ${socket.id}.`);
       ideAPI.setAdminSocket(socket);
       cb('success');
     }else{
       cb('fail');
     }   
   });   
   
     
  }
  
}
module.exports = admin; 