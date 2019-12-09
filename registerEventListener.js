let fs = require('fs')
let {spawn} = require('child_process');
let startDate = new Date()
let status = {
	pid: process.pid,
	active:true,
	start:startDate.toString()
}
fs.writeFile("/var/cvss.json",JSON.stringify(status),(err)=>{
	if(err){
		console.log(err)
		console.log("error while writing")
		return;
	}
	console.log("Instantiate Process Finished")
});
fs.watchFile("/var/cvss.json",(old,curr)=>{

	fs.readFile("/var/cvss.json",(err,data)=>{
		if(err) {console.log(err);return;}
		try{
			let state = JSON.parse(data.toString());
			if(!state.active && !state.hasOwnProperty("termination")){
				let termination = new Date();
				state.termination = termination.toString();
				spawn("forever",["stop","updater.js"])
				fs.writeFile("/var/cvss.json",JSON.stringify(state),()=>{
					console.log("Done writing changes")
				})
				
				console.log(state)
				return;
			}
			if(state.active && state.hasOwnProperty("termination")){
				state.lastTermination = state.termination
				delete state.termination;
				sp = spawn("forever",["start","updater.js"])
				sp.stderr.on("data",(d)=>{
					console.log(d.toString())
				})
				sp.stdout.on('data',(d)=>{
					console.log(d.toString())
				})
				fs.writeFile("/var/cvss.json",JSON.stringify(state),()=>{
                                        console.log("Done writing changes")
                                })
				console.log(state)
			}
		}catch(err){
			console.log("Failed to process state")
			console.log(err)
		}
	})
})

//setInterval(()=>{
//	console.log("Running Diagnostic")
//},5000)

