var fs = require('fs');
var assert = require("assert");
//let item = JSON.parse(fs.readFileSync(process.argv[2]))
// let probabils = [0,0,0,0,0,0,0];
// let total = item.AV['0.85'] + item.AV['0.62'] + item.AV['0.55'] + item.AV['0.20'];
// let max_probable =  total*8 //count total prob. from AV  '0.85': 68, '0.62': 0, '0.55': 1, '0.20': 0
//let queue = []
let EventEmitter = require("events");
class EmitterClass extends EventEmitter{};
var Emitter = new EmitterClass();
function CalculateQueueValue(queue){
	let prob = 1; 
	for (var i = 0;i<queue.length;i++){
			
			let value = parseInt(queue[i][1])===NaN?0:parseInt(queue[i][1])
			let tempval;
			if(value==0){prob=0;break;}
			
			if(i==2 || i == 5 || i == 6 || i == 7){
				tempval=value/(total)
			}
			if(i==1){
				tempval=value/(total)
			}
			else{
				tempval=value/(total)	
			}			
	
			prob*=tempval
		
	}
	
	prob = parseFloat(parseFloat((prob)).toFixed(6));
	
	return {combination:queue,prob:prob};
}

function slicerApi(arr,slice){
	let res = []
	for(let i =0;i<arr.length;i++){
		
			res.push(arr[i][slice[i]]);
			
		
	}
	return res;
}

function findMod(sets){
	let init = {type:null,value:0};
	for(items in sets){
		let parsed = {type:items,value:parseInt(sets[items])}
		init = parsed.value > init.value?parsed:init;
	}
	return init;
}
// let dataset = traverse();
// let iv = [0,0,0,0,0,0,0,0];

// //	CalculateQueueValue(slicerApi(dataset,iv))
// let modulus = []
// for(sets in item){
// 	let getm = findMod(item[sets])
// 	let toBePushed = {vector:sets,mod:getm,percentage:(getm.value/total*100).toFixed(1)+"%"}
// 	modulus.push(toBePushed);
// }
// var BaseCheckers = {
//         AV:["N","A","L","P"],
//         AC:["L","H"],
//         PR:["N","L","H"],
//         UI:["N","R"],
//         S:["U","C"],
//         C:["N","L","H"],
//         I:["N","L","H"],
//         A:["N","L","H"]
// }

// var BaseValue = {
//         AV:[0.85,0.62,0.55,0.20],
//         AC:[0.77,0.44],
//         PR:[0.85,0.62,0.27],
//         UI:[0.85,0.62],
//         S:undefined,
//         C:[0,0.22,0.56],
//         I:[0,0.22,0.56],
//         A:[0,0.22,0.56]
// }
// let avg_perc = 0.0; let counter = 0;
// let vector = "";
// let relative_val = [];
// let relative_val_perc = [];
// let choose = parseFloat(process.argv[process.argv.length-1]) || 90.0
// modulus.forEach((mods)=>{
// //	console.log(mods)
// //	console.log(`percentage ${parseFloat(mods.percentage)}`)
// 	//TODO: relative vectors
// 	let perc = parseFloat(mods.percentage);

// 	let key = mods.vector
// 	if(perc<=choose){
	
// 		relative_val.push(key);
// 		relative_val_perc.push(perc);
// 	}
// 	let val = mods.mod.type;
// 	if(key!=="S"){

// 		val = BaseCheckers[mods.vector][BaseValue[mods.vector].indexOf(parseFloat(val))]
// 	}
	
// 	vector += `${key}:${val}/`
// 	avg_perc += perc;
// 	counter+=1;
// 	if(counter==modulus.length){
// 		let jsonfinal = {
// 			variables:relative_val,
// 			final:null,
// 			vector:vector,
// 			percentages:relative_val_perc
// 		}
// 		let final = parseFloat(avg_perc/modulus.length).toFixed(0)
// 		jsonfinal.final = final;
// 		console.log(JSON.stringify(jsonfinal))
// 		// console.log(`Likely Accuracy for Vuln : ${final} %`)
// 		// console.log(`Vector ${vector}`)
// 	}
// })

function calc(filePath) {
	let data = fs.readFileSync(filePath)
	let item = JSON.parse(data)
	
	let probabils = [0,0,0,0,0,0,0];
	let total = item.AV['0.85'] + item.AV['0.62'] + item.AV['0.55'] + item.AV['0.2'];
	let max_probable =  total*8 //count total prob. from AV  '0.85': 68, '0.62': 0, '0.55': 1, '0.20': 0

	let queue = []
	let output = ""

	function traverse (){
		//converts JSON to a set of array..
		for(i in item){
		
		let setRand;
		let temp = [];
		
		for (j in item[i]){
			var pointer =  j
			
			let obj = [pointer,item[i][j]]
		
			temp.push( obj ) ;
			
		}
		queue.push(temp)
	
		
		//pick a value
		}
		return queue;
	}

	let dataset = traverse();
	let iv = [0,0,0,0,0,0,0,0];

	//	CalculateQueueValue(slicerApi(dataset,iv))
	let modulus = []
	for(sets in item){
		let getm = findMod(item[sets])

		let toBePushed = {vector:sets,mod:getm,percentage:(getm.value/total*100).toFixed(1)}
		modulus.push(toBePushed);
	}

	var BaseCheckers = {
			AV:["N","A","L","P"],
			AC:["L","H"],
			PR:["N","L","H"],
			UI:["N","R"],
			S:["U","C"],
			C:["N","L","H"],
			I:["N","L","H"],
			A:["N","L","H"]
	}

	var BaseValue = {
			AV:[0.85,0.62,0.55,0.20],
			AC:[0.77,0.44],
			PR:[0.85,0.62,0.27],
			UI:[0.85,0.62],
			S:undefined,
			C:[0,0.22,0.56],
			I:[0,0.22,0.56],
			A:[0,0.22,0.56]
	}
	let avg_perc = 0.0; let counter = 0;
	let vector = "";
	let relative_val = [];
	let relative_val_perc = [];
	let choose = parseFloat(process.argv[process.argv.length-1]) || 90.0
	modulus.forEach((mods)=>{
	//	console.log(mods)
	//	console.log(`percentage ${parseFloat(mods.percentage)}`)
		//TODO: relative vectors
		let perc = parseFloat(mods.percentage);

		let key = mods.vector
		if(perc<=choose){
		
			relative_val.push(key);
			relative_val_perc.push(perc);
		}
		let val = mods.mod.type;
		if(key!=="S"){

			val = BaseCheckers[mods.vector][BaseValue[mods.vector].indexOf(parseFloat(val))]
		}
		
		vector += `${key}:${val}/`
		avg_perc += perc;
		counter+=1;
		if(counter==modulus.length){
			let jsonfinal = {
				variables:relative_val,
				final:null,
				vector:vector,
				percentages:relative_val_perc
			}
			let final = parseFloat(avg_perc/modulus.length).toFixed(0)
			jsonfinal.final = final;
			output += JSON.stringify(jsonfinal)
			
			
		}
	})

	return output
}

module.exports = calc
