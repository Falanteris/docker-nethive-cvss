var WebSocketServer = require('websocket').server;
var WebSocketClient = require('websocket').client;
var WebSocketFrame  = require('websocket').frame;
var WebSocketRouter = require('websocket').router;
var W3CWebSocket = require('websocket').w3cwebsocket;
var jwt = require("jsonwebtoken");
let url = require("url")
let sock = "/tmp/piper.sock"
var fs = require("fs");
var handler = require("./piper-sock");
var Event = require("events");
class EventEmitter extends Event {}
const wsEmitter = new EventEmitter();
let minicache = []
console.log("[+] Hooking target file .. ");
/*
const credentials = {
        key: privateKey,
        cert: certificate,
        ca: ca
};
If we need to use wss:// protocol
*/
function validate_content(data){
	if(!data.hasOwnProperty("EVENT_TYPE")) return false;
	if(!data.hasOwnProperty("EVENT_DATA")) return false;
	if(!data.hasOwnProperty("@timestamp")) return false;
	return true;
}

let socket = handler((data)=>{
	console.time("sendtime");
	// let err;
	// try{
	// 	// do whatever validation you want to implement..
	// 	data = JSON.parse(data);
	// }catch(err){
	// 	console.log("[!] ERROR WHILE PROCESSING DATA")
	// 	console.log(err);
	// 	err = err;
	// }
	// if(err) return;
	try{
		data = JSON.parse(data);
	}catch(err){
		console.log(err);
		return;
	}
	if(validate_content(data)){
		minicache.push(data)
		console.log(minicache)
		if(minicache.length>25){
			minicache.pop();
		}
		wsEmitter.emit("change",data);
	}

},sock,2);

	/*
	fs.watchFile("ws-content.json",(curr)=>{
		console.time("sendtime");
		console.log("Change occured..");
		fs.readFile("ws-content.json",(err,data)=>{
			try{
				
				data = JSON.parse(data);
				
			}catch(err){
				console.log(data)
				console.log("error occured on reading json data");
				console.log(err);
				err = err;
			}
			if(err) return;
			wsEmitter.emit("change",data);
		})
	})
	*/

var WebSocketServer = require('websocket').server;
var http = require('http');
var https = require('https');

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8000, function() {
    console.log((new Date()) + ' Server is listening on port 8000');
});

socket.listen(sock,()=>{})
wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});
 
function originIsAllowed(request) {
  // put logic here to detect whether the specified origin is allowed.
  // check for JWT.
    
  if(!request.cookies){
  	console.log("No cookie detected")
  	return false;

  }
  let token;
  for(i in request.cookies){

  	if(request.cookies[i].name == 'webtoken'){
  		console.log("webtoken detect")
  		token = request.cookies[i].value;
  		break;
  	}	
  }
   if(!token){
   	console.log("No webtoken key detected..")
  	return false;

  }


  try{
    let decode = jwt.verify(token,"M0r3Sens1t1veTh4nY0urG1rlfr13nd")

    return decode;
  }catch(err){
 
  	return false;
  }
  
}
// console.log("Creating dummy authenticated key");
// let token = jwt.sign("doin ur mum","M0r3Sens1t1veTh4nY0urG1rlfr13nd"); 
// console.log(token)
wsServer.on('request', function(request) {
    if (originIsAllowed(request)===false) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    try{

    var connection = request.accept('echo-protocol', request.origin);
    
    console.log((new Date()) + ' Connection accepted.');
    
    if(minicache.length != 0){
      console.log("SENDING CACHE")
  	 minicache.forEach((data)=>{
		  connection.sendUTF(JSON.stringify(data));
	   })
    }
    // connection.on('message', function(message) {

    //     if (message.type === 'utf8') {
    //         console.log('Received Message: ' + message.utf8Data);
    //         connection.sendUTF(message.utf8Data);
    //     }
    //     else if (message.type === 'binary') {
    //         console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
    //         connection.sendBytes(message.binaryData);
    //     }
    // });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });

    wsEmitter.on("change",(data)=>{
	console.log("Sending changes ..");
	console.log(data)
	resp = JSON.stringify(data);
	connection.sendUTF(resp);
	console.timeEnd("sendtime");
    })
   }catch(err){
	console.log(err);
}
});

