const ideAPI = require('../../admin/ide/ide-api'); 
const dashboardAPI = require('../../admin/dashboard/dashboard-api'); 

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
       dashboardAPI.setAdmin(socket,state);
       cb('success');
       if(state.myAddonFailed){
         socket.emit('server-addon-error',state.myAddonFailed);
         console.log('server addon error called from admin addon');
       }
     }else{
       cb('fail');
     }   
   });   
   
     
  }
  
}
module.exports = admin; 