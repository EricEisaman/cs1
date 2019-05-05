export default CS1=>{
   
AFRAME.registerComponent('userdata', {
  init: function () {
    //{avatar:'Mary'}
    CS1.db = {};
    CS1.db.save = (keyValueObject,cb)=>{
      CS1.socket.emit('db-store', keyValueObject, cb);
    }
    //'avatar'
    CS1.db.get = (key,cb)=>{
      CS1.socket.emit('db-get', key, cb);
    }  
  }
  
});

}