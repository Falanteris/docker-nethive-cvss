let piper = require("./piper2.0");
let util = require("util")

let promise = util.promisify;
let custom = util.promisify.custom
let errors = {};
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
let ip = process.argv[3] || "0.0.0.0"
let url = process.argv[4]
function validate(argv){
	return argv.length == 5
}
if(!validate(process.argv)){
	errors.COMMON="Incomplete Argument, Length of Argument must be equals to 5";
	console.log(errors)
	return;
}

//console.log(type)
//console.log(ip)
//console.log(url)
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
	
	res((result)=>{
		if(result.errors) errors.AV_ERRORS = result.stackTrace;

		avarice_ev.emit("ready",result.result);
	})
});
runProcess(piper.getSource,`JSON_SOURCE/${type}.json`,(res)=>{
	//console.log(`${res} is the result`)
	//if(res.error_reports) errors._ERRORS = res.error_reports
	source_ev.emit("ready",res);
});

runProcess(piper.detectPR,ip+url,(res)=>{
	//console.log(final)
	
	//since the variable is a promise, it has to be handled this way
	

	prejudice_ev.emit("ready",res.result);
	
	// if(res.error_reports) {
	// 	errors.PR_ERRORS = res.error_reports;
	// 	let {spawn} = require("child_process");
	// 	insert = spawn("path_apis/insertpath",[url,"0","0"]);
	// 	insert.stdout.on("data",(err,data)=>{
	// 		//console.log(err);console.log(data);
	// 	})
	// 	insert.stderr.on('data',(data)=>{
	// 		//console.log(data.toString())
	// 	})
	// }
	
})

function readyCheck(){
	//console.log(ready_signal)
	if(ready_signal == 3){
		//console.log("READY")
		status_em.emit("ready",fetched_res);
	}
}

avarice_ev.on("ready",(data)=>{
	//console.log("AVR")
	fetched_res['AV'] = `AV:${data}`;
	ready_signal+=1;
	readyCheck();
})
prejudice_ev.on('ready',(data)=>{
	//console.log("A")
	fetched_res['PR'] = `PR:${data}`;
	ready_signal+=1;
	readyCheck();
})
source_ev.on('ready',(data)=>{
	// console.log("SOUCE RE")
	// console.log(data)
//	data = JSON.parse(data);
	fetched_res['STRING'] = data.vector;
	fetched_res['likelyhood'] = data.final
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
	let likelyhood = data.likelyhood;
	//console.log(final)
	//CVSS:3.0/"+def.replace(/.$/,"")
	let score = piper.calculator("CVSS:3.0/"+final.replace(/.$/,"")).trim()
	let stat_score = piper.calculator("CVSS:3.0/"+data.STRING.replace(/.$/,"")).trim()
	let result = {
		stat_vector:data.STRING,
		vector:final,
		stat_score:stat_score,
		score:score,
		stat_severity:sev(stat_score),
		severity:sev(score),
		errors:errors,
		likelyhood:`${likelyhood}`
	}
	console.log(JSON.stringify(result))

})
