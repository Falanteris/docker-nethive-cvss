import subprocess
import json
import time
import select


def set_initial():
	fd = open("/var/nethive/config.json")
	data = json.loads(fd.read())
	fd.close()
	return data
def update():
	fd = open("auto_merge","w+")
	config = {
		"CWE-79":"XSS",
		"CWE-89":"SQLi"
	}
	try:
		data = json.loads(open("/var/nethive/config.json").read())
		print(data)
		config = data;
	except Exception as e:
		print(e)
		pass;
	[fd.write("node reader.js data_feeds {} {}\npython3 nvd-df.py\n".format(i,config[i])) for i in config.keys()]

	ls = subprocess.check_output(["chmod","+x","auto_merge"]);
	print(ls)
	fd.close()
#def Popen():
#	r = subprocess.Popen(["tail","-f","/var/nethive/config.json"],stdout=subprocess.PIPE,shell=True,stderr=None);
#	print(r)
#	while True:
##		line = r.stdout.readline().rstrip()
#		print(line)
#		print(line)
#		if not line:
#			break;
#		print(line)
#		yield line;

if __name__ == "__main__":
	# start subproces popen
	update()
