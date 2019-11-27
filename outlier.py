import json
import subprocess
import pandas as pd
import os
"""
DDOS = cwe-400
SQLi = cwe-89
XSS  = cwe-79
"""

#sqlidata = json.loads(open("JSON_SOURCE/SQL.json").read());
#xssdata = json.loads(open("JSON_SOURCE/XSS.json").read());

""" 
loops through the data to find the suitable mod
"""
def getDesc(item):
	try:
		return item["cve"]["description"]["description_data"][0]["value"]
	except Exception as e:
		print(e)
		return None;
def getV3Data(item):
	try:
		return item["impact"]["baseMetricV3"]["cvssV3"]["vectorString"];
	except Exception as e:
		print(e)
		return None;
def getCWE(item):
	try:

		return item["cve"]["problemtype"]["problemtype_data"][0]["description"][0]["value"];
		print(e)
	except Exception as e:
		return None
def getKeyName(key):
	if key == "DDOS":
		return "CWE-400"
	if key == "SQLi":
		return "CWE-89"
	if key == "XSS":
		return "CWE-79"
def getKeyValue(key):
	if key == "CWE-400":
		return "DDOS"
	if key == "CWE-89":
		return "SQLi"
	if key == "CWE-79":
		return "XSS"
	pass
out = subprocess.check_output(["node","getSource.js"])
out = json.loads(out)
outliers = out;
def getOutliers(outlierString,original):
	outlierSplit = outlierString.split("/");
	originalSplit = original.split("/");
	diffs = []
	for i in outlierSplit:
		if i != originalSplit[outlierSplit.index(i)]:
			diffs.append(i);
	return ",".join(diffs)
for i in out:
	out[getKeyName(i)] = out.pop(i);
listdir = os.listdir("data_feeds");
for i in listdir:
	print(i)
	df = pd.read_json("data_feeds/"+i);
	cve_items = df["CVE_Items"];
	print("Processing Data Series..")
	for j in cve_items:
		inst = j
		extracted = {}
		vectorString = getV3Data(inst)
		desc = getDesc(inst)
		cwe = getKeyValue(getCWE(inst));

		if cwe == None:
			continue;
		if out[getKeyName(cwe)] not in vectorString+"/":
			if cwe not in outliers:
				outliers[cwe] = list();
			newData = {
				"vectorString":vectorString,
				"cwe":cwe,
				"description":desc,
				"outlierLoc":getOutliers(vectorString,out[getKeyName(cwe)])
			}
			outliers[cwe].append(newData);
json.dump(outliers,open("outliers.json","w"))




