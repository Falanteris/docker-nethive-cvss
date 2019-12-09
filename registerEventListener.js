let fs = require('fs')
let startDate = new Date()
let status = {
	pid: process.pid,
	active:true,
	start:startDate.toString()
}
fs.writeFile("/var/cvss_service/cvss.json",JSON.stringify(status),(err)=>{
	if(err){
		console.log(err)
		console.log("error while writing")
		return;
	}
	console.log("Instantiate Process Finished")
});
process.on("SIGUSR1",()=>{
	console.log("Attempting to start maintenance mode..")
	process.exit()
})
setInterval(()=>{
	console.log("Running Diagnostic")
},5000)

