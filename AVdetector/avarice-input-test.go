package main
import (
	
	"strconv"
	"encoding/json"
	"stringchemist"
	"errors"
	"net"
	"fmt"
	"os"
	"math"
)

type IP struct{
	ClassA string
	ClassB string
	ClassC string
	ClassD string
	Literal string
}
func ParseIp(item string) (string, error){
	ip := IP{};
	res := stringchemist.Split(item,".");

	if len(res) != 4{
		err := errors.New("Failed to parse IP");
		return "",err;
	}
	ip.ClassA = res[0]	
	ip.ClassB = res[1]
	ip.ClassC = res[2]
	ip.ClassD = res[3]
	ip.Literal = stringchemist.Join(res,".");
	
	final,err :=json.Marshal(ip);

	if err != nil {
		return "", err;
	}
	return string(final),nil
}

func externalIP() (string, map[string]string,int, error) {
	ifaces, err := net.Interfaces()
	if err != nil {
		return "",nil,-1, err
	}
	for _, iface := range ifaces {
		if iface.Flags&net.FlagUp == 0 {
			continue // interface down
		}
		if iface.Flags&net.FlagLoopback != 0 {
			continue // loopback interface
		}
		addrs, err := iface.Addrs()

		if err != nil {
			return "",nil,-1, err
		}
	
		for _, addr := range addrs {
			
			naddr := stringchemist.Split(addr.String(),"/");
			// fmt.Println(addr)
			subnets,hostaddr_loc,err:=GenerateSubnet(naddr[0],naddr[1])
			if err != nil{
				fmt.Println("OOPS")
			}
	
			var ip net.IP
			switch v := addr.(type) {
			case *net.IPNet:
				ip = v.IP
			case *net.IPAddr:
				ip = v.IP
			}
			if ip == nil || ip.IsLoopback() {
				continue
			}
			ip = ip.To4()
			if ip == nil {
				continue // not an ipv4 address
			}
			return ip.String(),subnets,hostaddr_loc, nil
		}
	}
	return "",nil,-1, errors.New("are you connected to the network?")
}
func Binarize(num int) string{
	if num > 255 {
		return "11111111";
	}
	bin:= "1";
	nobin := "0"
	binstr := "";
	bincap := 7;
	for bincap >= 0{
		
		next_bin := int(math.Pow(2,float64(bincap)))
		flag := false;
		if next_bin <= num {
			num = num - next_bin
			binstr += bin
			flag=true
		}
		if !flag{
			binstr += nobin;
		}
		
		bincap-=1;
	}
	return binstr;
}
func NumerizeFromBin(bin string) (int,error){
	if len(bin) != 8 {
		n := errors.New("Invalid Binary Format, must be in Octet format")
		return 0,n;
	}

	pointer := 7;
	value := 0;
	for _,v := range bin{
		
		if string(v) == "1"{
			value += int(math.Pow(2,float64(pointer)))
		}
		pointer-=1;
	
	}
	return value,nil;

}
func PushArrInt(item int, arr []int) []int{
	newarr := arr
	arr = make([]int,len(arr)+1);	
	copy(arr,newarr);
	arr[len(arr)-1] = item;
	return arr;
}
func BinGen(amt int) string{
	bin := "";
	population := 0;
	for population < 8{
		if amt > 0{
			bin+= "1"
			
		}
		if amt == 0{
			bin+="0";
			
		}
		
		population+=1;
		
		if amt > 0 {amt-=1}
		
	}
	return bin;
}
func BinarizeCIDR(num int) []int{
	netmask := make([]int,0)
	
	for len(netmask) != 4 {
		
		if num >= 8 {
			netmask = PushArrInt(255,netmask);
			num-=8;
			continue;
		}
		if num <= 0 {
			netmask = PushArrInt(0,netmask);
			continue;
		}		
		numerize,err:=NumerizeFromBin(BinGen(num));
		if err!= nil{
			panic(err);
		}
		netmask = PushArrInt(numerize,netmask)
		num-=num;
	}
	return netmask;
}


func GenerateSubnet(ip_addr string, subnet string) (map[string]string,int,error){
	sub,_ := strconv.Atoi(subnet);
	indf := float64(sub % 8);
	
	
	group := math.Pow(2,indf);
	if group > 64{
		errs := errors.New("SUBNET CANNOT BE MORE THAN 64");

		return nil,-1,errs
	}
	/*10.20.90.24 --> example*/
	
	
	
	netmask := BinarizeCIDR(sub);
	hostaddr := 0
	if sub >=25 && sub <= 30{
		hostaddr = 3;
	}

	if sub >=17 && sub <= 24{
		hostaddr = 2;
	}

	if sub >=8 && sub <= 16{
		hostaddr = 1;
	}
	/*TODO: 
	1. hostaddr harus diganti dengan netmask XOR ip
	2. cari netmask
	*/
	
	range_template := "1...255"
	getbinary := netmask[hostaddr:];
	focusaddr := hostaddr;
	tobesliced := stringchemist.Split(ip_addr,".")
	//sliced_address := tobesliced[:hostaddr];
	hostaddr = netmask[hostaddr];

	
	zeros := 0;
	ones := 0;
	for _,v:=range getbinary{
		binform := Binarize(v);
		
		for _,v := range binform{
			if string(v) == "0"{
				zeros +=1;
				continue;
			}
			ones +=1;
		}
	}
	

	//addr_all := stringchemist.Split(ip_addr,".");
	// fmt.Println("Angka 0 pada Binari");
	// fmt.Println(zeros);
	// fmt.Println("Angka 1 pada Binari");
	// fmt.Println(ones);
	ip_range := int(math.Pow(2,float64(ones)));
//	subnet_group := make([]int,4);
// 	for k,v := range netmask {
// 		getSlice,_ := strconv.Atoi(tobesliced[k])
// 		subnet_group[k] = v ^ getSlice ;
// 	}
	
	group_sum := 256 - hostaddr;
	
	subnets := make(map[string]string,group_sum)
	// fmt.Println("JUMLAH SUBNET");
	// fmt.Println(ip_range)
	// fmt.Println("BLOK SUBNET");
	// fmt.Println(group_sum);
	grouped := 0;
	base := 0;
	
	get_ip_template := make([]string,4);
	low_end := make([]string,4);
	high_end := make([]string,4)
	
	auto_index := map[int]string{
		2:"",
	}
	auto_index_idx := 3;
	curr_host := group_sum-1;
	// fmt.Println("SUBNET RANGE");
	// fmt.Println(subnet_group);

	for grouped < ip_range{


		get_ip_template = tobesliced;
		
		low_end = get_ip_template;
		
		if focusaddr < 3 {
			for k,_ := range low_end{
			

				if k > focusaddr{
					low_end[k] = range_template;
					
					
				}
			}
		//	grouped+=int(math.Pow(255,float64(3-focusaddr)));
		}
		low_end[focusaddr] = strconv.Itoa(base)
		if auto_index[2] != ""{
			low_end[2] = auto_index[2]
		}
		if auto_index[1] != ""{
			low_end[1] = auto_index[1]
		}

		if auto_index[0] != ""{
			low_end[0] = auto_index[0]
		}


		copy(high_end,low_end)
		
		high_end[focusaddr] = strconv.Itoa(curr_host)
		curr_host,_ = strconv.Atoi(high_end[focusaddr])
		if curr_host > 255 {
			high_end[focusaddr] = strconv.Itoa(curr_host - 256); 
			curr_host,_ = strconv.Atoi(high_end[focusaddr])
			parsed_int,_ :=strconv.Atoi(high_end[focusaddr-1]);
			high_end[focusaddr-1] = strconv.Itoa(parsed_int+1) 
			base = 0
			auto_index[auto_index_idx-1] = high_end[focusaddr-1];

			
		}
		// fmt.Println(low_end);
		// fmt.Println(high_end);
		subnets[stringchemist.Join(low_end,".")] = stringchemist.Join(high_end,".");

		// final_result[grouped] = final_low;
		// final_result[grouped+1] = final_high;
		grouped+=1;
		
		base =  curr_host+1;
		curr_host +=  group_sum ;
		
	}
	// fmt.Println(subnets)
	return subnets,focusaddr,nil;
	

	/*this returns the possible subnet of the IP*/
}

func Check(ip string, ip2 string,subnets map[string]string,host_addr_loc int) (string,error){
	var ip_json,ip_json2 IP
	

	err := json.Unmarshal([]byte(ip),&ip_json);
	if err != nil{
		return "",err;
	}
	
	err = json.Unmarshal([]byte(ip2),&ip_json2);
	if err != nil{
		return "",err;
	}
	//if ip_json2.Literal == "127.0.0.1" || ip_json.Literal == "127.0.0.1" ||ip_json.Literal==ip_json2.Literal {

	//	return "Adjacent",nil;
	//}
		
	
// 		if ip_json2.ClassA != ip_json.ClassA || ip_json2.ClassB != ip_json.ClassB {

// 			return "Network",nil;
// 		}
// 	fmt.Println(host_addr_loc);
	
// 		if ip_json2.ClassC != ip_json.ClassC {

// 			return "Network",nil;
// 		}
		
	
		
	HostLow,HostHigh := InBetween(ip_json2.Literal,subnets,host_addr_loc);
	OutLow,OutHigh := InBetween(ip_json.Literal, subnets,host_addr_loc);
	// fmt.Println(HostLow)
	// fmt.Println(HostHigh)
	// fmt.Println(OutLow)
	// fmt.Println(OutHigh)
	if (HostLow != OutLow || HostHigh != OutHigh) || (OutLow == "")  || (HostLow == ""){

		return "Network",nil
	}
	
	return "Adjacent",nil

	
}
func InBetween(host_ip string,subnets map[string]string, addr_loc int) (string,string) {
	LowEnd := "";
	HighEnd := "";

	host_addr_ip := stringchemist.Split(host_ip,".")
	
	host_addr,_ := strconv.Atoi(host_addr_ip[addr_loc])
	// fmt.Println("ADDR LOC")
	// fmt.Println(addr_loc)


	
	for min,max := range subnets{
		
		min_splitted := stringchemist.Split(min,".");
		max_splitted := stringchemist.Split(max,".");
		min_val,_ := strconv.Atoi(min_splitted[addr_loc]);
		max_val,_ := strconv.Atoi(max_splitted[addr_loc]);
		// fmt.Println("MIN")
		// fmt.Println(min_val)
		// fmt.Println("MAX")
		// fmt.Println(max_val)
		if addr_loc > 0 {
			parent := host_addr_ip[addr_loc-1];
			sample_local_parent := min_splitted[addr_loc-1];
			if parent != sample_local_parent{
				break;
			}
		}
		if host_addr >= min_val && host_addr <= max_val{
			
			
			LowEnd = min;
			HighEnd = max;
			// fmt.Println("LOW END")
			// fmt.Println(LowEnd)
			// fmt.Println("HIGH END")
			// fmt.Println(HighEnd)
			break;
		}
	
		
	}
	
	return LowEnd,HighEnd;

}
func main(){
	if os.Args[1] == "0.0.0.0" || os.Args[1] == "127.0.0.1" {
		fmt.Println("Adjacent")
		return
	}
	res,err := ParseIp(os.Args[1])
	if err != nil{
		return
	}

	localip,subnets,addr_loc,err := externalIP(); /*Network Interface Check*/

	localip,_ = ParseIp(localip)
	//subnets,addr_loc,_ := GenerateSubnet(os.Args[2],os.Args[3]); /*for testing with input*/
	//localip,err := ParseIp(os.Args[2]) /*for testing with input*/
	//fmt.Println(localip)
	if err != nil{
		fmt.Println(err)
		return
	}

	result,err :=Check(localip,res,subnets,addr_loc);
	fmt.Println(result);
}

