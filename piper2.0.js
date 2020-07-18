let calc = require("./learn");
var spawn = require("child_process");


function calculator(string){
	let calc = spawn.spawnSync("python3",["cvss-calc/scripter.py",string])
	//console.log(calc.stderr.toString() || "No error")
	res = calc.stdout == undefined?0.0:calc.stdout;
	return res.toString();
}

async function https_get(redir){
	
		return new Promise((resolve,reject)=>{

		https.request("https://"+redir,(data)=>{
						let av = {}

						let {statusCode} = data
							if (statusCode !== 200) {
								console.log("test")
               					 error = new Error('Request Failed.\n' +
                      				`Status Code: ${statusCode}`);
                					av.result = "L"
            				    av.statusCode = statusCode
								reject(error)

 		            }
				else{
					console.log("success")
                	av.result = "N"
                	av.statusCode = statusCode
                	resolve(av)

				}

					})
		})
}

async function http_get(redir){
	
		return new Promise((resolve,reject)=>{

		http.request("http://"+redir,(data)=>{
						let av = {}

						let {statusCode} = data
							if (statusCode !== 200) {
								console.log("test")
               					 error = new Error('Request Failed.\n' +
                      				`Status Code: ${statusCode}`);
                					av.result = "L"
            				    av.statusCode = statusCode
								reject(error)

 		            }
				else{
					console.log("success")
                	av.result = "N"
                	av.statusCode = statusCode
                	resolve(av)

				}

					})
		})
}
function callback(res){
const { statusCode } = res;
  const contentType = res.headers['content-type'];

  let error;
  if (![200,301].includes(statusCode) ) {
    error = new Error('Request Failed.\n' +
                      `Status Code: ${statusCode}`);
  } 
  if (error) {
    console.error(error.message);
    // Consume response data to free up memory
    res.resume();
    return;
  }

  res.setEncoding('utf8');
  let rawData = '';
  res.on('data', (chunk) => { rawData += chunk; });
  res.on('end', () => {
    try {
    	console.log(res)
      console.log(rawData)
      
    } catch (e) {
      console.error(e.message);
    }
  });
}
function detectPR(urlsplit,error_reports,cb){
	let {spawnSync} = require("child_process")
	let pr = spawnSync("python3",["requester.py","http://"+urlsplit])
	if(pr.stdout.toString()!="200"){
		return {result:'L'}
	}

	return {result:'N'}
	
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
	let {promisify} = require("util")
	let {lookup} = require("dns")
	let dns_lookup = promisify(lookup)
	return function (callbacker){

	dns_lookup(ip).then((result)=>{

	try{
	
	av = spawn.spawnSync("AVdetector/avarice",[result.address]);
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
				callbacker({
					status:undefined,
					stackTrace:error_reports}
				);
	}
	

	

	callbacker({status:1,result:av});
	})
	}
}
module.exports = {
	avarice:avarice,
	detectPR:detectPR,
	calculator:calculator,
	getSource:getSource
}
