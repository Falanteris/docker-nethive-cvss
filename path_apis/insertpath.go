package main;

import (

	"prejudice"
	"fmt"
	"os"

)
func CheckArg(data string) bool{
	if data == "1"{
		return true;
	}
	return false;
}

func main(){
	dsn := prejudice.GetEnv();
	if dsn == ""{
		panic("Cannot detect environment variable");
	}
	
	if len(os.Args) != 4{
		fmt.Println("invalid arguments");
	}
	db,err := prejudice.Connect(dsn);
	if err!= nil{
		panic(err);
	}
//	fmt.Println(bool(int("1")))
	var superuser,auth bool;
	if os.Args[2] != "1" && os.Args[2] != "0"{
		panic("Superuser Argument Invalid, must be 1 or 0")
	}
	if os.Args[3] != "1" && os.Args[3] != "0"{
		panic("Authentication argument invalid")
	}
	superuser = CheckArg(os.Args[2]);
	auth = CheckArg(os.Args[3]);
        err = prejudice.InsertPaths(db,os.Args[1],superuser,auth);
	if err!=nil{
		fmt.Println(err);
	}
	fmt.Println("ok");

}
