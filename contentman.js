let file_writer = require('fs').writeFileSync;
let file_reader = require('fs').readFileSync;


function writeToContent(message){
	
	try{
		let data = file_reader('ws-content.json');
		let json = JSON.parse(data)
		json.push(message)
		file_writer('ws-content.json',JSON.stringify(json));
	
	}catch(err){
		console.log(err)
	}
	

}
module.exports = writeToContent;
