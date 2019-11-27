let {ungzip} = require("node-gzip");
let net = require('net')
let {spawn,spawnSync} = require("child_process")
let template = require("./event-template")
let isAccessible = require('fs').accessSync;
let unlink = require('fs').unlinkSync
let sock = "/tmp/updater.sock"
function setEventTemplate(data,opts={}){
	template["EVENT_TYPE"]= opts.EVENT_TYPE || "UPDATE";
	template["EVENT_DATA"] = data;
	let date_time = new Date();
	template["@timestamp"] = date_time.toString();
	return template;
}
let addresses = []
let savefile = []
let metafile = []
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
		// client.write(JSON.stringify(meta));
	})
}
function wget_runner(meta,addr){
		console.log("Running WGET on " + addr );
		let instance = spawnSync("wget",['-O',`gzdata/${meta.EVENT_DATA}.json.gz`,`${addr}.json.gz`]);
		meta["EVENT_TYPE"]  = "EVENT_UPDATE_DONE"
		let date_time = new Date();
	    	meta["@timestamp"] = date_time.toString()
		// client.write(JSON.stringify(meta));	
		
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
// let conn = socket((data)=>{
	
// 		try{
// 			addr_meta_list.append(JSON.parse(data.toString()))
// 		}catch(err){
// 			client.write("error in parsing data..  must be in JSON format with the schema of {addr:<>,meta:<>}");
// 		}
// 	client.on("close",()=>{
// 		addr_meta_list.forEach((pair)=>{
// 			download_runner(pair.meta,pair.addr);
// 		})
// 	})
// },sock,1)
// conn.listen(sock)
openConfig();
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
let conn = net.createServer((client)=>{
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
					addr_meta_list = [];
					
		})
	})
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
if(socketExists()){
		//so that it can work properly with forever daemon
		//since it doesn't send proper kill signal for the process events to be emitted
        unlink(sock)
}
process.on("SIGINT",()=>{
	if(socketExists()){
		unlink(sock);
	}
	conn.close()
})
process.on("SIGTERM",()=>{
	if(socketExists()){
		unlink(sock);
	}
	conn.close()
})
conn.listen(sock)
