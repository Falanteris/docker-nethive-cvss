let {ungzip} = require("node-gzip");
let net = require('net')
let {spawn,spawnSync} = require("child_process")
let template = require("./event-template")
let isAccessible = require('fs').accessSync;
let unlink = require('fs').unlinkSync
let sock = "/tmp/updater.sock"
let wssock = "/tmp/piper.sock"
let ungzipped = 0;
let Event = require("events")
class Emitter extends Event{}
let fs = require("fs")
let merge_emitter = new Emitter();
let prep_em = new Emitter()
function socketExists(socket){
	let exist;
	try{
		isAccessible(socket)
		exist = true;
	}catch(err){
		
	}
	return exist;
}
function setEventTemplate(data,opts={}){
	template["EVENT_TYPE"]= opts.EVENT_TYPE || "UPDATE";
	template["EVENT_DATA"] = data;
	let date_time = new Date();
	template["@timestamp"] = date_time.toString();
	return template;
}
function checkSockets(){

	let chk = socketExists(wssock)
	console.log(chk)
	if(chk){
		prep_em.emit("piper-ready")
	}
	console.log("[-] Socket unavailable..")

}

let client,copyClient,conn
let availability = 0
function main(){
let checks = setInterval(checkSockets,1000)
prep_em.on("piper-ready",()=>{
 client = net.createConnection(wssock,()=>{
	console.log("[+] Connected to notification service..");
	
 });
 availability +=1
 if(availability==1){
 	clearInterval(checks)
 	// start service here.
 	copyClient = client;
 	let addresses = []
	let savefile = []
	let metafile = []
	openConfig();
	conn = net.createServer((client)=>{
	conn.getConnections((err,count)=>{
		if(count>1){
			client.destroy();
			return;
		}

		client.on('data',(data)=>{
			try{
				if(validate_newdata(data)){
					addr_meta_list.push(JSON.parse(data.toString()))
				}	
			}catch(err){
				client.write("error in parsing data..  must be in JSON format with the schema of {addr:<>,meta:<>}");
			}
		})
		client.on('close',()=>{
					console.log("Downloading..")
					console.log(addr_meta_list)
					for(i in addr_meta_list){
						let pair = addr_meta_list[i]
						download_runner(pair.meta,pair.addr);
					}
					
					merge_emitter.on("ready",()=>{
						console.log("merging data ..")
						let merge_proc = spawnSync("bash",["./auto_merge"]);
						let mergeMeta = setEventTemplate("Data has been successfully merged",{"EVENT_TYPE":"EVENT_MERGE_DONE"})
						copyClient.write(JSON.stringify(mergeMeta));
						addr_meta_list = [];
						ungzipped = 0;
					});
		})
	})
})

if(socketExists(sock)){
		//so that it can work properly with forever daemon
		//since it doesn't send proper kill signal for the process events to be emitted
        unlink(sock)
}
process.on("SIGINT",()=>{
	if(socketExists(sock)){
		unlink(sock);
	}
	conn.close()
})
process.on("SIGTERM",()=>{
	if(socketExists(sock)){
		unlink(sock);
	}
	conn.close()
})
conn.listen(sock)
 }
})
}
if (require.main === module) {
    main()
}
function openConfig(){
	let data = JSON.parse(require("fs").readFileSync("configs/conf.json").toString())
	addresses = data.target;
	savefile = data.savefile;
	metafile = data.metafile
}

async function ungzipper(data,saveTo,meta){
	//wrapper around ungzip

	const res = await ungzip(data)
	let content = res.toString()
	let {writeFile} = require('fs')
	writeFile(`data_feeds/${saveTo}`,content,()=>{
		meta["EVENT_TYPE"]  = "EVENT_EXTRACT_DONE"
		let date_time = new Date();
		meta["EVENT_DATA"] = `${saveTo}`
		meta["@timestamp"] = date_time.toString()
		if(client){
	    client.write(JSON.stringify(meta));
	    ungzipped += 1
	    if(ungzipped == addr_meta_list.length){
			merge_emitter.emit("ready");
		}
		}
	})
}
function wget_runner(meta,addr){
		console.log("Running WGET on " + addr );
		let instance = spawnSync("wget",['-O',`gzdata/${meta.EVENT_DATA}.json.gz`,`${addr}.json.gz`]);
		meta["EVENT_TYPE"]  = "EVENT_UPDATE_DONE"
		let date_time = new Date();
		meta["@timestamp"] = date_time.toString()
		if(client!=undefined){
			client.write(JSON.stringify(meta));	
		}
		return instance;	
}
function download_runner(meta,addr){
		meta = setEventTemplate(meta);
		let instance = wget_runner(meta,addr);
		let {readFile} = require('fs')
		//console.log("Downloading..")
		readFile(`gzdata/${meta.EVENT_DATA}.json.gz`,(err,data)=>{
				if(err){console.log("ERROR: data not received properly"); console.log(err); return;}
				let saveto = savefile[addresses.indexOf(addr)];

				ungzipper(data,saveto,meta).catch((err)=>{
					if(err){
						console.log(`error occured while downloading from ${addr}, redownloading..`)
					
							download_runner(meta,addr);
					
						//download_runner(meta,addr);
						return;
					}
				
				});

			})
}
let addr_meta_list = []


let validate_newdata = (data)=>{
	data = JSON.parse(data.toString())
	if(data.meta == undefined || data.addr == undefined){
		console.log("Broken entry");
		return false;
	}
	for(i in addr_meta_list){
		let meta = addr_meta_list[i]
		if(meta.meta == data.meta && meta.addr == data.addr){
			console.log("Duplicate entry")
			return false;
		}
	}
	return true;
}

module.exports = {downloader:wget_runner,ungzipper:ungzipper}

