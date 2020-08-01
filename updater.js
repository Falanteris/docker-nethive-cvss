let https = require("https");
let ev = require("events")
let template = require("./event-template")
let fs = require("fs")
let isAccessible = require('fs').accessSync;
// let request = require('request');
//let gunzip = require("gunzip-file")
let addresses = [];

let savefile = [] //deprecated.. preferrably, the user download the gz file themselves *UPDATE* nope, we can download it for them :)
let metafile = []
let {ungzip} = require("node-gzip");
let net = require('net')
let {spawn,spawnSync} = require("child_process")
let util = require("util")
let downloadUrls = []
class em extends ev{}
let prep_em = new em();
function socketExists(socket){
	let exist;
	try{
		isAccessible(socket)
		exist = true;
	}catch(err){
		
	}
	return exist;
}
function openConfig(){
	let data = JSON.parse(require("fs").readFileSync("configs/conf.json").toString())
	addresses = data.target;
	savefile = data.savefile;
	metafile = data.metafile
}
//let writeStream = require('fs').createWriteStream(metafile)
let event = new em();
let metaEvent = new em();
//let writeStream = require('fs').createWriteStream(savefile);
event.on('data',(chunk)=>{
	writeStream.write(chunk.toString())
})
function setEventTemplate(data,opts = {}){
	template["EVENT_TYPE"]= opts.EVENT_TYPE || "UPDATE";
	template["EVENT_DATA"] = data;
	let date_time = new Date();
	template["@timestamp"] = date_time.toString();
	return template;
}
function checkSum(old,newMeta){
	let oldMeta = require("fs").readFileSync(old).toString();
	//console.log(oldMeta.toString())
	//console.log(newMeta)
	// let lineByLine = oldMeta.split("\n")
	// let lineByLineNew = newMeta.split("\n");
	// console.log(lineByLine)
	// console.log(lineByLineNew)
	// for(i in lineByLine){
	// 	console.log(lineByLine[i])
	// 	if(lineByLine[i] !== lineByLineNew[i]){

	// 		console.log("Difference in index " + i)
	// 		return true;
	// 	}
	// }
	// return false;
	if(oldMeta !== newMeta){
		console.log("diff")
		return true;
	}
	console.log("no new data detected..");
	return false;
}
function checkMeta(newMeta,meta){
	let exists = require('fs').accessSync;
	let isNewMeta = false;
	let fileExists
	try{
		exists(meta);
		fileExists = true
	}catch(err){
//		console.log(err)
		fileExists = false
	}
//	console.log(fileExists)
	if(!fileExists){
		isNewMeta = true
	}
	if(fileExists && checkSum(meta,newMeta) ){
		isNewMeta = true;
	}
	return isNewMeta
}
function getMeta(addr,meta,saveto){
	let bufferData = ""

	if(addr != ""){

		https.get(addr+".meta",(res)=>{
			const {statusCode} = res;
			if(statusCode  != 200){
				console.log(`ERROR:request failed on ${addr} :${statusCode} `)
				return false;
			}
			console.log(`Success on connecting to ${addr}.meta`)
			res.on("data",(meta)=>{
				bufferData += meta.toString();
			})
			res.on("end",()=>{
		
				if(checkMeta(bufferData,meta)){

					console.log(`New Data Detected on ${addr}.. download the latest .gz file`)
					let writeStream = require('fs').createWriteStream(meta)
					writeStream.write(bufferData)
					let d = setEventTemplate(meta);
					//console.log(meta)
					//contentman(JSON.stringify(d));
					//downloadZip(addr,saveto);
		
					metaEvent.emit("new",d,addr);
				}
				else{
					
					console.log("Meta is still the same..")
				}
			})
		}).on("error",(err)=>{
		
			let err_ev = {message:err.message}
			err_ev.name = addr;
		
			let data = setEventTemplate(err_ev,{"EVENT_TYPE":"EVENT_ERROR"})
			client.write(JSON.stringify(data));
		})
	}
}
function createconn(socket){
	let err = false
	
	net.createConnection(socket,()=>{

	})

}
let availability = 0
function checkSockets(){

	if(socketExists("/tmp/piper.sock")){
		prep_em.emit("piper-ready")
	}
	if(socketExists("/tmp/updater.sock")){
		prep_em.emit("updater-ready")
	}
	console.log("[-] Socket unavailable..")

}

let client
let updateclient
let checks = setInterval(checkSockets,1000)
prep_em.on("piper-ready",()=>{
 client = net.createConnection("/tmp/piper.sock",()=>{
	console.log("[+] Connected to notification service..");
	
 });
 availability +=1
 if(availability==2){
 	clearInterval(checks)
 	for (i in addresses){
		runAsync(addresses[i],metafile[i],savefile[i]==undefined?metafile[i].replace(".meta",".tgz"):savefile[i]);
	}
 }
})
prep_em.on("updater-ready",()=>{
	updateclient = net.createConnection("/tmp/updater.sock",()=>{
		console.log("[+] Connected to download service..");
	})

 availability +=1
 if(availability==2){
 	clearInterval(checks)
 	for (i in addresses){
		runAsync(addresses[i],metafile[i],savefile[i]==undefined?metafile[i].replace(".meta",".tgz"):savefile[i]);
	}
 }
})
process.on("exit",()=>{
	console.log("Notifying downloader..");
	updateclient.write("start");

})
metaEvent.on("new",(meta,addr)=>{
        client.write(JSON.stringify(meta));
        updateclient.write(JSON.stringify({meta:meta.EVENT_DATA,addr:addr}))
		//get new spawn instance
		//create a function to do so..?
		// let {spawn} = require('child_process');
		// downloadZip(addr,`gzdata/${savefile[addresses.indexOf(addr)]}.gz`,(fileloc)=>{
		// 	let {readFile} = require('fs')
		// 	console.log(fileloc)
		// 	readFile(fileloc,(err,data)=>{
		// 		if(err){console.log(err);return;}
		// 		console.log(data)
		// 		ungzipper(data,savefile[addresses.indexOf(addr)])
		// 	})
		// });
		//wget it ?
		// let instance = spawn("wget",['-O',`gzdata/${meta.EVENT_DATA}.json.gz`,`${addr}.json.gz`]);
		//implement queue system, FIFO


})

function download(addr,meta,saveto){

/*
metaEvent.on("new",(meta)=>{
		
		client.write(JSON.stringify(meta));
})
*/

getMeta(addr,meta,saveto);

//metaEvent.on("new",(meta)=>{
	
//	console.log("Fetching New Data");
//	let d = setEventTemplate(meta);
//	console.log(meta)
//	contentman(JSON.stringify(d));
	//downloadZip(addr,saveto)

//})
}
async function runAsync(addr,meta,saveto){
	download(addr,meta,saveto)
	setInterval(()=>{download(addr,meta,saveto)},60*1000);
}

console.log("[+] Parsing configs..")
openConfig()
console.log("[+] Running 1 minute updates..");
function compareData(old,recent){
	let newdata = []
	for (i in recent){
		if(old.indexOf(recent[i])==-1){
			newdata.push(recent[i]);
		}
	}
	return newdata;
}
// async function asyncFileListener(){
// 	let watch = require('fs').watch;
// 	watch("configs/conf.json",()=>{
// 		//perform adjusments when changes occur
// 		let reader = require('fs').readFile;
// 		reader("configs/conf.json",(err,data)=>{
// 			let newdata = JSON.parse(data.toString())
// 			let newAddr = compareData(addresses,newdata.target)
// 			let newMetaFile = compareData(metafile,newdata.metafile);
// 			let newSaveFile = compareData(metafile,newdata.savefile);
// 			if(newAddr.length == 0){
// 				console.log("ERROR: No changes to newAddr, aborting..")
// 				return false;
// 			}
// 			if(newMetaFile.length == 0){
// 				console.log("ERROR: No changes to metafile, aborting..")
// 				return false;
// 			}
// 			if(newSaveFile.length == 0){
// 				console.log("ERROR: No changes to savefile, aborting..")
// 				return false;
// 			}

// 			newAddr.forEach((data,index)=>{
// 				try{	
// 					runAsync(data,newMetaFile[index])
// 				}
// 				catch(err){
// 					console.log(`An error occured while integrating changes ${err.toString()}`)

// 				}
// 			});
// 		})
// 	})
// }

// console.log("[+] Starting configs/conf.json Listener..")
// asyncFileListener()
