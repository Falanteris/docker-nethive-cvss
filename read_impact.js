var fs = require('fs');

function sleep(s,cb=()=>{}){
	setTimeout(cb,s*1000);
}
let vendor_data = []
fs.readFile(process.argv[2],(err,data)=>{
	parsed = JSON.parse(data)
	console.log(parsed);
	console.log("Preparing Data..");
	sleep(2,()=>{
		for(let i=0;i<parsed.CVE_Items.length;i++){
			let cve_info = parsed.CVE_Items[i].cve.CVE_data_meta.ID
			let vendor_info = parsed.CVE_Items[i].cve.affects.vendor;
			
			console.log(vendor_info);
			let new_data = {"vendor_info":vendor_info.vendor_data,"CVE":cve_info}
			vendor_data.push(JSON.stringify(new_data));
		}
		
		fs.writeFileSync(process.argv[3],"["+vendor_data+"]");
	})
})
