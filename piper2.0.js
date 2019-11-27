var Falanteris = require("falanteris").Falanteris;
//var servapp = falanteris.Falanteris;
let calc = require("./learn");
var app = Falanteris("0.0.0.0");
var spawn = require("child_process");
//app.verbosity();

//app.enableMP(3);
function calculator(string){
	let calc = spawn.spawnSync("python3",["cvss-calc/scripter.py",string])
	//console.log(calc.stderr.toString() || "No error")
	res = calc.stdout == undefined?0.0:calc.stdout;
	return res.toString();
}
function detectPR(urlsplit){
	urlsplit =  decodeURIComponent(urlsplit.join("/"))|| "/"
	//console.log(urlsplit)
	let av = spawn.spawnSync("prejudice/src/prejudice",[urlsplit]);
//	if(av.stderr!=null){
		//console.log(av.stderr.toString())
//	}
	if(av.stdout != null){
		//console.log(av.stdout)
		av = av.stdout.toString()
		//console.log("successfully calculated PR")
	}
	else{
			//console.log(av.stderr.toString())
				return "PARSE_ERROR";
	}
	try{
		av = JSON.parse(av);
		//console.log("JSON Parse done");
	}catch(err){
	
		return "N"
	}
	if (av.Superuser){
		return "H"
	}
	if (av.Authentication){
		return "L"
	}
	
	return "N";
}
function getSource(src){
	//console.log(src)
	try{
		
		let sp = calc(src);
		//console.log(sp);
		let item = JSON.parse(sp)

		
		let vector = item.vector;
		
		return vector;
	}catch(exception){
		return exception;
	}
}

function avarice(ip){
	//console.log(ip);
	let av;
	try{
	av = spawn.spawnSync("AVdetector/avarice",[ip]);
	}catch(err){
		return {
			status:undefined,
			stackTrace:err.toString()
		}
	}
	let util = require("util")
	//console.log(JSON.stringify(util.inspect(av)));
	//console.log("OUTPUT:")
	//console.log(av.stdout);
	//console.log("STDERR");
	//console.log(av.stderr.toString())
	//console.log(av);
	//av.stdout = av.stdout.toString();
	//av.stderr = av.stderr.toString()	

	if(av.stdout != ''){
	//	console.log(av)
		av = av.stdout.toString()[0];
	}

	else{
				//av = util.inspect(av);
				//console.log("HELL")
				//console.log(av)
				return {status:undefined,
					stackTrace:av.stderr
				};
	}
	

	
	
	return {status:1,result:av};
}
app.addRedir("POST","/vul/[type]/post-api",(req,res)=>{
	//console.time("Summarizing Job...")
	req.parseFromForm((data)=>{
		if(data.url != undefined){
			data.url = decodeURIComponent(data.url);
		}
		//console.log(data);
		let def;
		let stackTrace = {}
	if(req.rawParam.type=="SQL"){
		let vul_analysis = getSource("JSON-SOURCE/SQL.json");
		//console.log(vul_analysis)
		let vector = vul_analysis.split("/");
		for(v in vector){

			let spliced = vector[v].split(":");
		
			if(spliced[0] == "PR" ){
				
				spliced[1]=detectPR(data.url.split("/"));
			}
			if(spliced[0] == "AV"){
				let item = avarice(data.ip);
				if(item.status){
					spliced[1] = item.result 
				}
				if(item.hasOwnProperty("stackTrace")){
					stackTrace.av = item.stackTrace
					stackTrace.ignore = true;
				}

			}
			
			vector[v] = spliced.join(":");
		}

		def = vector.join("/") /*SOMETHING ELESE*/
	}
	if(req.rawParam.type=="XSS"){
		let vul_analysis = getSource("JSON-SOURCE/XSS.json");

	let vector = vul_analysis.split("/");
		for(v in vector){

			let spliced = vector[v].split(":");
		
			if(spliced[0] == "PR" ){
				
				spliced[1]=detectPR(data.url.split("/"));
			}
			if(spliced[0] == "AV"){
				let item = avarice(data.ip);
				if(item.status){
					spliced[1] = item.result 
				}
				if(item.hasOwnProperty("stackTrace")){
					stackTrace.av = item.stackTrace
					stackTrace.ignore = true;
				}


			}
			
			vector[v] = spliced.join(":");
		}

		def = vector.join("/") /*SOMETHING ELESE*/
	
	}
	if(!def){
		res.write("Sorry, that vulnerability type is not ready yet to be tested :(", ()=>{
			res.end();
		})
		return;
	}
		
		let calcResult = {
			vector:def,
			score:calculator("CVSS:3.0/"+def.replace(/.$/,"")),
			errors:stackTrace.ignore?stackTrace:"No errors"
		}
		//console.log(calcResult);
		res.writeHead(200,{"Content-type":"application/json"})
		res.write(JSON.stringify(calcResult), ()=>{
			res.end();
		})
	})
	//console.timeEnd("Summarizing Job...")
})

app.addRedir("GET","/",(req,res)=>{
	let ngemeng = `
		Welcome to Avarice and Prejudice 1.0.0
		
		A fully automated Base Score calculation pipeline that
		can quickly summarize a class of web vulnerability by only
		using ip and url as a parameter

		for starters, you can try our REST API from this endpoint
		
		--> vul/SQL/post-api

		this would require you to send a request with "application/json" header
		that contains 'ip' and 'url' property.
		
		this would output a JSON response of the calculation based
		on our automatic summarizer ..
	`
	res.write(ngemeng,()=>{
		res.end();
	})
})
app.verbosity();
module.exports = {
	avarice:avarice,
	detectPR:detectPR,
	calculator:calculator,
	getSource:getSource,
	app:app
}
//app.listen(8080)
