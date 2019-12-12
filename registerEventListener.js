let fs = require('fs')
let {spawn} = require('child_process');
let startDate = new Date()

let status = {
	pid: process.pid,
	active:true,
	start:startDate.toString()
}
function validateConfig(content){
	let missing = [];
	let toCheck = ["startcommands","stopcommands","listenerfile"]
	for(i in toCheck){
	 	if(!content.hasOwnProperty(toCheck[i])){
		 	missing.push(toCheck[i])
		}
	}
	return missing;
}
let config = JSON.parse(fs.readFileSync("event-config.json").toString())
let missingConf = validateConfig(config)
if(missingConf.length > 0){
	throw `Config not properly set... Missing ${missingConf.join(",")}`
}

function registerListener(listener){
fs.writeFile(listener,JSON.stringify(status),(err)=>{
	if(err){
		console.log(err)
		console.log("error while writing")
		return;
	}
	console.log("Instantiate Process Finished")
});
}
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
					console.log(command)
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
				let newStart = new Date();
				state.start = newStart.toString();
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

registerListener(config.listenerfile);
add_watcher(config.listenerfile,config.stopcommands,config.startcommands)

//setInterval(()=>{
//	console.log("Running Diagnostic")
//},5000)

