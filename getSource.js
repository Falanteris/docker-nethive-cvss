let piper = require("./piper2.0")

let fs = require("fs");

let files = fs.readdirSync("JSON_SOURCE");

let resp = {}
for(i in files){
	resp[files[i].split(".")[0]] = `CVSS:3.0/${piper.getSource(`JSON_SOURCE/${files[i]}`)}`

}
console.log(JSON.stringify(resp))