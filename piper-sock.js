let net = require("net");
let {avarice} = require("./piper2.0");
let {detectPR} = require("./piper2.0");
let {getSource} = require("./piper2.0");
let {calculator} = require("./piper2.0");
let sock = ""
let unlink = require('fs').unlinkSync
let link = require('fs').linkSync
let isAccessible = require('fs').accessSync;
let readline = require("readline")
let rl = readline.createInterface({
	input:process.stdin,
	output:process.stdout
})
function socketExists(){
	let exist;
	try{
		isAccessible(sock)
		exist = true;
	}catch(err){
		
	}
	return exist;
}
rl.on("SIGINT",()=>{
	console.log("Stopping")
	
	if(socketExists()){
		unlink(sock);
	}
	process.exit()
})

function validator(data){
	let regex = /ip=([0-9]{1,3}\.){3}[0-9]{1,3}&url=\S+&vul=[A-Z]+/g
	return regex.test(data);
}
function deserializer(data){
	data = data.split("&")
	let unser = {}
	for(i in data){
		let item = data[i].split("=")
		unser[item[0]] = item[1];
	}
	return unser;
}
function createServerHandler(handler,sockName,maxCons=undefined){
console.log("Creating handler ..");
sock = sockName
let server = net.createServer((c)=>{
	//handlers
	if(!isNaN(maxCons) && maxCons>0){
		server.getConnections((err,count)=>{
			if(count > maxCons){
				c.destroy();
				return;
			}
			c.on("data",(data)=>{
				handler(data);
			})
			c.on("close",()=>{
				console.log("Connection terminated");
			})
			c.on("error",()=>{
				console.log("[+] Socket is missing.. attempting to recover from abrupt termination..")
				if(!socketExists()){
			
				link(sock,sock);
			}
			console.log("[+] Recovery success ..")
			})
		})
		return;
	}
	c.on("data",(data)=>{
		handler(data);
	})
	c.on("close",()=>{
		console.log("Connection terminated");
	})
	c.on("error",()=>{
		console.log("[+] Socket is missing.. attempting to recover from abrupt termination..")
		if(!socketExists()){
			
			link(sock,sock);
		}
		console.log("[+] Recovery success ..")
	})
})
/*
process.on("exit",()=>{

	if(socketExists()){
		unlink(sock);
	}
})*/

server.on("error",(err)=>{

	console.log(err);
	if(socketExists()){
		unlink(sock)
	}
})
return server;
}
process.on("SIGTERM",()=>{
	server.close(()=>{
		process.exit()	
	})
})
process.on("SIGINT",()=>{
	server.close(()=>{
		process.exit();
})
})
if(socketExists()){
		//so that it can work properly with forever daemon
		//since it doesn't send proper kill signal for the process events to be emitted
             unlink(sock)
}
module.exports = createServerHandler;
/*
server.listen(sock,()=>{
	console.log("[+] Server listening");
});
*/

