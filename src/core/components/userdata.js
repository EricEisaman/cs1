export default CS1=>{
   
AFRAME.registerComponent('userdata', {
  init: function () {
    //{avatar:'Mary'}
    CS1.db = {};
    CS1.db.set = (keyValueObject,cb)=>{
      CS1.socket.emit('db-set', keyValueObject, cb);
    }
    //'avatar'
    CS1.db.get = (key,cb)=>{
      CS1.socket.emit('db-get', key, cb);
    }
  }
  
});

}