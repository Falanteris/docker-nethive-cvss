let download_runner = require("./downloader").downloader
let ungzipper = require("./downloader").ungzipper
let {readFileSync} = require('fs')
let {readFile} = require('fs')

let config = JSON.parse(readFileSync("configs/conf.json"))

console.log(config)
for (let index = 0; index < config.metafile.length; index++) {

    input = {
        "EVENT_DATA":config.metafile[index]
    }
    download_runner(input,config.target[index])
    readFile(`gzdata/${input.EVENT_DATA}.json.gz`,(err,data)=>{
        if(err){console.log("ERROR: data not received properly"); console.log(err); return;}
        let saveto = config.savefile[index];

        ungzipper(data,saveto,config.metafile[index]).catch((err)=>{
            if(err){
                console.log(`error occured while downloading from ${addr}, redownloading..`)
            
                    download_runner(meta,addr);
            
                //download_runner(meta,addr);
                return;
            }
        
        });

    })
    

}