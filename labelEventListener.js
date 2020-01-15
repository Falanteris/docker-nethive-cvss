let fs = require('fs')
let {spawn} = require("child_process")

fs.watchFile("/var/nethive/config.json",(err)=>{
	console.log("NEWEVENET")
	spawn("python3",["mergemaker.py"]);
})
