let fs = require('fs')
let {spawn} = require("child_process")
let {spawnSync} = require("child_process")

spawnSync("python3",["mergemaker.py"]);

fs.watchFile("/var/nethive/config.json",(err)=>{
	console.log("NEWEVENET")
	sp = spawn("python3",["mergemaker.py"]);
	sp.on("close",()=>{
		spawn("chmod",["+x","auto_merge"])
	})
})
