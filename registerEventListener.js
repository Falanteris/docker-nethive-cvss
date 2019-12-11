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
function add_watcher(to_watch,kill_command,start_command){
fs.watchFile(to_watch,(old,curr)=>{

	fs.readFile(to_watch,(err,data)=>{
		if(err) {console.log(err);return;}
		try{
			let state = JSON.parse(data.toString());
			if(!state.active && !state.hasOwnProperty("termination")){
				let termination = new Date();
				state.termination = termination.toString();
				kill_command.forEach((command)=>{
					spawn(command[0],command[1])
				})
				fs.writeFile(to_watch,JSON.stringify(state),()=>{
					console.log("Done writing changes")
				})
				
				console.log(state)
				return;
			}
			if(state.active && state.hasOwnProperty("termination")){
				state.lastTermination = state.termination
				delete state.termination;
				//sp = spawn("forever",["start","updater.js"])
				start_command.forEach((command)=>{
				let sp =spawn(command[0],command[1]);
				
				sp.stderr.on("data",(d)=>{
					console.log(d.toString())
				})
				sp.stdout.on('data',(d)=>{
					console.log(d.toString())
				})

				})
				fs.writeFile(to_watch,JSON.stringify(state),()=>{
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
}
add_watcher("/var/cvss.json",[["forever",["stop","updater.js"]]],[["forever",["start","updater.js"]]])

//setInterval(()=>{
//	console.log("Running Diagnostic")
//},5000)

