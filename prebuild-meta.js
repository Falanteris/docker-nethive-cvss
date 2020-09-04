let {meta} = require("./updater")
let {readFileSync} = require('fs')

let config = JSON.parse(readFileSync("configs/conf.json"))

console.log(config)
for (let index = 0; index < config.metafile.length; index++) {

    input = {
        "EVENT_DATA":config.metafile[index]
    }
    meta(config.target[index],config.metafile[index])

}