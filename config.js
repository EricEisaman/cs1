let config = {
 db:{
  tables:[{
   name: 'Users',
     fields: [{
      name:'name',
      type: 'TEXT'
     },{
     name: 'pw',
     type: 'TEXT' 
     }]
  }]
 }
}
module.exports = config;