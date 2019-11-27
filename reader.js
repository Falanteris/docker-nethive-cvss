var fs = require('fs');
const EventEmitter = require('events');

class MyEmitter extends EventEmitter {}
function error_handler(){

	console.log(`Whoops, looks like you typed it wrong..
	here's how you run it:
	node reader.js [nvd-dataset-json-file/a-single-dataset-folder] [comma-separated-cwe] [respective vulnerability tags]
	Examples:
	- node reader.js nvdcve-1.0-2017.json CWE-79 XSS
	- node reader.js nvdcve-1.0.2018.json CWE-79,CWE-89 XSS,SQL
	- node reader.js <data-feeds-folder> CWE-89 SQL
	`)
	process.exit()
}
const myEmitter = new MyEmitter();
const ender = new MyEmitter();
let makeShiftSignaller = [];
let datalist = []

const writeReady = new MyEmitter();
let filter,mark = undefined;
let data_args = []
try{
data_args = process.argv[2].split(",");
}catch(err){
	error_handler()
}
function loadAndProcessData(source,cb=(data)=>{console.log(data)}){

let ws = new MyEmitter();
try{

	fs.readFile(source,(err,data)=>{

		ws.emit("close",data,source);
	});
	filter = process.argv[3].split(",") // .. CWE-434,CWE-89,CWE-1337,etc.
	mark = process.argv[4].split(",") // ..SQL,XSS,LEET
	
let cwes = [];

let cve_count = 0;
ws.on("close",(bigdata,nvd)=>{

	console.log("[+] Finsihing up for .. " + nvd)
	let test = JSON.parse(bigdata);

	test = test.CVE_Items;
	cve_count = test.length;
	for (i in test){
		//cve_count+=1
		//console.log(i)
		//if (i !== "impact" && i !== "cve") continue;
		if (test[i].hasOwnProperty("cve")){
		try{
	
		let cwe = test[i].cve.problemtype.problemtype_data[0].description[0].value
		//console.log(test[i].cve.problemtype.problemtype_data[0].description[0])
		if(filter.includes(cwe)){
			cwes.push(test[i]);

		} 
		}catch(error){
			
		}	
		}
		
	}
	

	ws.emit("ready",cwes);
})

let cycle = ["cve","impact"]
ws.on("ready",(data)=>{
	//SQL injection and XSS data.
	let test = cwes;
	
	let filtered = []

	let point = 0;
	for (i in test){
		let marker = test[i].cve.problemtype.problemtype_data[0].description[0].value
		try{
		filtered.push({
			id:test[i].cve.CVE_data_meta.ID,
			vectorString:test[i].impact.baseMetricV3.cvssV3.vectorString,
			v3BaseScore:test[i].impact.baseMetricV3.cvssV3.baseScore,
			v3BaseSeverity:test[i].impact.baseMetricV3.cvssV3.baseSeverity,
			cwe:test[i].cve.problemtype.problemtype_data[0].description[0].value=mark[filter.indexOf(marker)],
			description:test[i].cve.description.description_data[0].value
		})

		}catch(error){
			
		}	
		
	}

		
	
	cb(filtered)
	//ender.emit("end",filtered);
})
//ender.on("end",(cleaned)=>{
	//writeDataThroughStream(cleaned)

//})

writeReady.on("end",()=>{
	console.log("Finished Writing Data");
})
writeReady.on("written",(chunk_length)=>{
	console.log(`chunk length : ${chunk_length}`)
})	
}catch(err){
	error_handler()
}

}
function writeDataThroughStream(cleaned){
	console.log("[+] Beginning Transmission Process..")
	console.log(`[+] Extracted ${cleaned.length} data through this processes`)
	let currdate = new Date();
	let days = ["Minggu","Senin","Selasa","Rabu","Kamis","Jum'at","Sabtu"]
	let months = [undefined,"Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","November","Desember"]
	currdate = `${days[currdate.getDay()]}, ${currdate.getDate()} ${months[currdate.getMonth()]}  ${currdate.getHours()}:${currdate.getMinutes()}:${currdate.getSeconds()}`;
	let writethis =	[...cleaned]
	

	var ws = fs.createWriteStream("cleaned.json");

//	let rpcmode;
//	 if(process.argv.length==4){
  //              if(process.argv[3] == "rpcmode"){
    //                    rpcmod = true;
      //          }
       // }
       // if(!rpcmode){return;}
	//console.log(!ws.write(Buffer.from(JSON.stringify(writethis),"utf8")))

	ws.write(Buffer.from(JSON.stringify(writethis),"utf8"),()=>{
		
		// let rpcmode;
  //       	 if(process.argv.length==6){
		// 	console.log("Checking RPCmode..")
	 //               if(process.argv[5] == "rpcmode"){
  //                       	rpcmode = true;
  //               	}
	 //        }
  //       	if(!rpcmode){return;}


		// 	let parsed = JSON.parse(fs.readFileSync("cleaned.json"));
		// 	let http = require("http");
		// 	console.log("Sending Data..")
		// 	if(parsed.list.length == 0){
		// 		console.log(`No Entry on this CWE classification..`)
		// 	}
		// 	for (var i = 0;i<parsed.list.length;i++){
		// 		let vs = parsed.list[i].vectorString;
		// 		let cwe = parsed.list[i].cwe;
		// 		vs = vs.split("CVSS:3.0/")[1];
		// 		//console.log(cwe);
				
					
		// 			vs = `CVSS:3.0/VUL:${cwe}/`+vs;
				
	
		// 		http.get(`http://127.0.0.1:7000/${vs}`,()=>{});
		// 	}
			

	})


}
//console.log(`CVE COUNT:${cve_count}`)
ender.on("end",(cleaned)=>{
	writeDataThroughStream(cleaned);

})
function multiDataProcessing(dir,datasets){
	 for(let i = 0;i<datasets.length;i++){
                file = datasets[i]

                loadAndProcessData(dir+"/"+file,(data)=>{
                        datalist.push(data);
                        console.log("Incoming "+ data.length)
                        
                        if(datalist.length == datasets.length ){
                                //compile data
                                console.log("[+] Compiling..")
                                ds = []
                                for( i in datalist){
                                        temp = datalist[i]
                                        for(j in temp){
                                                ds.push(temp[j]);

                                        }
                                }
                                ender.emit("end",ds);
                        }


                });
        }


}

function main(){
if(data_args.length == 1){

	console.log(fs.lstatSync(process.argv[2]).isDirectory())
	if(fs.lstatSync(process.argv[2]).isDirectory()){
		//test
		feeds = fs.readdirSync(process.argv[2])

		multiDataProcessing(process.argv[2],feeds)
	}
	else{
		loadAndProcessData(process.argv[2])
	}
}
else{


	multiDataProcessing(data_args)

}
}
//module.exports = main;
main();

