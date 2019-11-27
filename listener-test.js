process.on("SIGUSR1",()=>{
	console.log("RECEIVED USR1");
	process.exit()
})


setInterval(()=>{
	console.log("MOO")
},3000)
