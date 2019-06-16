const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function ls() {
  const { stdout, stderr } = await exec('ls');
  console.log('stdout:', stdout);
  console.log('stderr:', stderr);
}


async function build(cb) {
  try{
    await exec('pnpm run build');
    cb('success');
  }catch(err){
    cb('fail');
  }
    
}


const fs = require('fs');

const ideAPI = {
  
  setApp: app=>{
    
    app.use(function(req, res, next) {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });
    
    app.get("/ide-get-client-config", function (request, response) {
      response.setHeader('Content-Type', 'application/json');
      //response.end(JSON.stringify({ a: 1 }));
      response.sendFile('./src/core/config/client-config.json',{root:'.'});
    });    
    
  },
  
  setAdminSocket: socket=>{
      
    socket.on('build', cb=>{
        build(cb);
    }); 
    
    socket.on('save', (data,cb)=>{
      const d = new Uint8Array(Buffer.from( String( data.txt ) ));
      fs.writeFile(data.path,d,err=>{
        if (err) {
          cb('fail');
          throw err;
        }else{
          cb('success');
        }         
      }); 
    });
    
    socket.on('get-src',(path,cb)=>{
      fs.readFile(path,"utf8",(err,data)=>{
        if (err) {
          cb({status:'fail',data:err});
          throw err;
        }else{
          cb({status:'success',data:data});
        }         
      }); 
    });

    
    
    
    
  }
  
}

module.exports = ideAPI;