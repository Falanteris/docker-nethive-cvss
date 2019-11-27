let piper = require("./piper2.0");
let util = require("util")

let promise = util.promisify;
let custom = util.promisify.custom

async function callbacker(func,arg,callback){
	try{
	result = func(arg);
	callback(undefined,result)
	}catch(err){
		callback(err,undefined);
	}
}	

let prm = promise(callbacker)
let type = process.argv[2]
let ip = process.argv[3]
let url = process.argv[4]
let fetched_res = {}
let ready_signal = 0;
async function runProcess(func,arg,cb){
	const res = await prm(func,arg).then((res) => {
  // Handle the error.
		cb(res)
	}).catch((err)=>{
		console.log(err)
	});
}
let Event = require("events")

class Emitter extends Event{}

let status_em = new Emitter();
let avarice_ev = new Emitter();
let prejudice_ev = new Emitter();
let source_ev = new Emitter();

runProcess(piper.avarice,ip,(res)=>{
	avarice_ev.emit("ready",res.result);
});
runProcess(piper.getSource,`JSON_SOURCE/${type}.json`,(res)=>{
	//console.log(`${res} is the result`)
	source_ev.emit("ready",res);
});

runProcess(piper.detectPR,url.split("/"),(res)=>{
	//console.log(final)
	prejudice_ev.emit("ready",res);
})

function readyCheck(){
	if(ready_signal == 3){
		status_em.emit("ready",fetched_res);
	}
}

avarice_ev.on("ready",(data)=>{
	fetched_res['AV'] = `AV:${data}`;
	ready_signal+=1;
	readyCheck();
})
prejudice_ev.on('ready',(data)=>{
	fetched_res['PR'] = `PR:${data}`;
	ready_signal+=1;
	readyCheck();
})
source_ev.on('ready',(data)=>{
	fetched_res['STRING'] = data;
	ready_signal+=1;
	readyCheck();
})
function modifyAV(string,av){
	return string.replace(/AV:\S/,av);
}
function modifyPR(string,pr){
	return string.replace(/PR:\S/,pr);
}
function sev(sev){
	if(sev>9.0){
		return "CRITICAL"
	}
	if(sev>7.0){
		return "HIGH"
	}
	if(sev>4.0){
		return "MEDIUM"
	}
	if(sev>0.1){
		return "LOW"
	}
	return "NONE"
}

status_em.on("ready",(data)=>{
	//console.log(data);
	let av_mod = modifyAV(data.STRING,data.AV)
	let final = modifyPR(av_mod,data.PR);
	//console.log(final)
	//CVSS:3.0/"+def.replace(/.$/,"")
	let score = piper.calculator("CVSS:3.0/"+final.replace(/.$/,""))
	let result = {
		vector:final,
		score:score,
		severity:sev(score)
	}
	console.log(JSON.stringify(result))

})
