var config = require('../config/config');
const uuidv4 = require('uuid/v4');
 
var low = require('lowdb');
var FileSync = require('lowdb/adapters/FileSync');
//var FileAsync = require('lowdb/adapters/FileAsync')
var adapter = new FileSync('.data/db.json');
var db = low(adapter);
 
 
if(process.env.ADMIN_KEY.length > 0){
  // Set some defaults (required if your JSON file is empty)
 db.defaults({ users: [{ id:uuidv4(), name: 'admin', pw: process.env.ADMIN_KEY, isPlaying:false }]})
   .write();
  db.get('users').filter({isPlaying:true}).map(u=>{
    u.isPlaying = false;
    return u
  }).write();
  db.get('users').filter({name:'admin'}).map(u=>{
    if(u.pw != process.env.ADMIN_KEY)u.pw = process.env.ADMIN_KEY;
    return u
  }).write();
  db.get('users').value().forEach(user=>{
    console.log(user.name, user.pw); 
  });
} else {
  console.log('Set the value of ADMIN_KEY in .env, for example ADMIN_KEY="34crrg344"');
}   

           
module.exports = db;   
