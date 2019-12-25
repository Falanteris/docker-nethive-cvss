let calc = require("./learn");
var spawn = require("child_process");

function calculator(string){
	let calc = spawn.spawnSync("python3",["cvss-calc/scripter.py",string])
	//console.log(calc.stderr.toString() || "No error")
	res = calc.stdout == undefined?0.0:calc.stdout;
	return res.toString();
}
function detectPR(urlsplit,error_reports){
	urlsplit =  decodeURIComponent(urlsplit.join("/"))|| "/"
	//console.log(urlsplit)
	let av = spawn.spawnSync("prejudice/src/prejudice",[urlsplit]);
//	if(av.stderr!=null){
		//console.log(av.stderr.toString())
//	}
	if(av.stderr.length!=0){
		error_reports = av.stderr.toString();

	}
	if(av.stdout != null){
	
		//av = av.stdout.toString()
		//console.log("successfully calculated PR")
	}
	//defaulting to N if error.
	try{
		av = JSON.parse(av);
		//console.log("JSON Parse done");
	}catch(err){
	
		return {result:"N",error_reports:error_reports};
	}
	if (av.Superuser){
		return {result:"H",error_reports:error_reports}
	}
	if (av.Authentication){
		return {result:"L",error_reports:error_reports}
	}
	
	return {result:"N",error_reports:error_reports};
}
function getSource(src){
	//console.log(src)
	try{
		
		let sp = calc(src);
		let item = JSON.parse(sp)
		
		
		return item;
	}catch(exception){
		return exception;
	}
}

function avarice(ip,error_reports){
	let av;
	try{
	av = spawn.spawnSync("AVdetector/avarice",[ip]);
	}catch(err){
		error_reports = stackTrace
		return {

			status:undefined,
			stackTrace:error_reports
		}
	}
	let util = require("util")


	if(av.stdout != ''){
		av = av.stdout.toString()[0];
	}

	else{

				error_reports = av.stderr.toString()
				return {
					status:undefined,
					stackTrace:error_reports
				};
	}
	

	
	
	return {status:1,result:av};
}
module.exports = {
	avarice:avarice,
	detectPR:detectPR,
	calculator:calculator,
	getSource:getSource
}