#!/usr/bin/python3 
import pandas as pd
import json
#import matplotlib.pyplot as plt;
import numpy as np
import time;
from pathlib import Path
df = pd.read_json("cleaned.json");

#ls = pd.DataFrame(df["list"])
def vector_to_numeric(series,main_df):
	base_value = {
	        'AV':[0.85,0.62,0.55,0.20],
	        'AC':[0.77,0.44],
	        'PR':[0.85,0.62,0.27,0.68,0.50,0.85],
	        'UI':[0.85,0.62],
	        'S':["U","C"],
	        'C':[0,0.22,0.56],
	        'I':[0,0.22,0.56],
	        'A':[0,0.22,0.56]
	}
	calc_result = {}
	ser_list = list(series.index)
	val_list = list(series)
	#print(ser_list)
	converter = base_value[ser_list[0].split(":")[0]]
		
	counter = 0;
	for i in val_list:
		calc_result[converter[counter]] = int(i);
		counter +=1
	#print(calc_result)
	return calc_result;
def cvss_parser(string):
	obj = {}
	
#	print(cleaned);
	parsetgt = string.split("/");
	parsetgt.reverse();
	parsetgt.pop();
#	print(parsetgt);
	for i in parsetgt:
		tgt = i.split(":");
#		print(tgt);
		obj[tgt[0]] = tgt[1]
	return obj;
def transform(jsondata):
	data = jsondata;
	if type(jsondata) != type({}):
		data = json.loads(jsondata);
	#print(type(data));
	#print(df.head())
	global arrdict
#	print(arrdict)
	for k,v in data.items():
		#if df[idx].get(k) == "":
#		print(v);
#		print(arrdict.get(k));
		if arrdict.get(k) == None:
			arrdict[k] = [v];
		else:
#			print(arrdict[k])
			arrdict[k].append(v);
		#df.iloc[idx][k] = v;
	
	return arrdict;
#print(ls.head())
#print(df.head())
#time.sleep(3)
# arrdict = {}
# for r,c in ls.iterrows():
# 	arrdict = transform(c.list);

# for k,v in arrdict.items():
# 	v = list(v);
# 	df[k] = pd.Series(v);

#print(df.tail())
#print(df.head())

vul_class = ' '.join([data for data in df.cwe.unique()])
#print(vul_class);	
def get_entry_year(df):
	unique = []
	for num,row in df.iterrows():
		y = row.id.split("-")[1]
		if y not in unique:
			unique.append(y);
	return unique
entry_year = get_entry_year(df);
#print("Detected Vulnerability Class : %s, entry year %s"% (vul_class,entry_year))
time.sleep(10);

df = df.set_index("id");

#print("Analysis result ... ")
#print("1. Description");
#print(df['description'].head())
#print("1. Score Spread...");
score_and_id = pd.DataFrame();
score_and_id['id'] = pd.Series(df.index.tolist());
score_and_id['v3BaseScore'] = pd.Series(df['v3BaseScore'].tolist())
scores = score_and_id.groupby('v3BaseScore').count();
scores = scores.sort_index(ascending=False);
scores = scores.rename(columns={"id":"CVE ID Count"})

#print(scores)
#time.sleep(10)
#ax = scores.plot.bar(y='CVE ID Count',color="gray")
import sys
#plt.title(sys.argv[1])
#plt.show();
#scores.show();
#print("2. Vector Spread...");
vectordata = pd.DataFrame();
vectordata['id'] = pd.Series(df.index.tolist())
loadstrings = pd.DataFrame(df['vectorString'])
arrdict = {}
for k,v in loadstrings.iterrows():
#	print(v);
	to_trf = cvss_parser(v.vectorString);
#	print(to_trf);
	arrdict = transform(to_trf);
for k,v in arrdict.items():
        v = list(v);
        vectordata[k] = pd.Series(v);
vectordata = vectordata.set_index("id");
print(vectordata)
#print(vectordata.describe())
#time.sleep(60)
#print(vectordata[vectordata['AV'] == 'A'].head() )

#vectordata = vectordata.pivot_table(index=["AV","AC","PR","UI","S","C","I","A"],aggfunc=np.sum)
#vectordata = vectordata.groupby(["AV","AC","PR","UI","S","C","I","A"]).count()
PRdata = vectordata.loc[:,"PR"];
PRdata = PRdata.reset_index()
PRdata = PRdata.pivot(columns="PR",values="id").fillna(0);

def zeroOrOne(num):
	if not num:
		return 0;
	return 1;
PRdata["N"] = PRdata["N"].apply(zeroOrOne);
PRdata["L"] = PRdata["L"].apply(zeroOrOne);
PRdata["H"] = PRdata["H"].apply(zeroOrOne);

#print(PRdata.count())

#print(PRData.info())

time.sleep(10)
cvss_dfs = [[i,pd.DataFrame()] for i in ["AV","AC","PR","UI","S","C","I","A"]]
N_rows = vectordata.shape[0]
N_cols = vectordata.shape[1]

df_index = 0;

BaseCheckers = {
        'AV':["N","A","L","P"],
        'AC':["L","H"],
        'PR':["N","L","H","LC","HC"],
        'UI':["N","R"],
        'S':["U","C"],
        'C':["N","L","H"],
        'I':["N","L","H"],
        'A':["N","L","H"]
}

def get_column_name(series_list):
	return series_list[0].split(":")[0];
for tup in cvss_dfs:
	""" find unique string interpolation for every cvss vector;"""
	tup[1]['id'] = pd.Series(df.index.tolist())
	#get_col = vectordata.loc[df_index,tup[0]]
	#df_index+=1;
	for get_col in BaseCheckers[tup[0]]:
		tup[1][tup[0]+":"+get_col] = pd.DataFrame(pd.DataFrame(np.zeros((N_rows))))
	tup[1] = tup[1].set_index("id");
	#print(tup[1].head());
df_index = 0;
print("Processing...");

for change in cvss_dfs:
	cve_ids = change[1].index.values
	for cve_id in cve_ids:
		
	#print(change[1].index)
		get_scope = "";
		get_val = vectordata.loc[cve_id,change[0]];

#		print(get_val);
	#	continue;

		get_val = get_val[0]
		if(change[0] == "PR"):
			scope = vectordata.loc[cve_id,"S"];
			if(scope=="C" and get_val !="N"):
				get_val += "C"
		
	#print(get_val)
	#print(change[1].head())
	#print(change[1][df_index])
		change[1].loc[cve_id,change[0]+":"+get_val] = 1; 
		df_index+=1;
#print(cvss_dfs)

# creating new subplot
#fig, axes = plt.subplots(nrows=4,ncols=2)
#fig.tight_layout()
#x_count = 0
#y_count = 0
#cvss_len = 7
setlist = {}
#print(cvss_dfs)

for dfs in cvss_dfs:
#	get_column_name = dfs[1].columns.values.tolist()[0].split(":")[0]
	#dfs[1].to_csv("{}_{}.csv".format(vul_class,get),index=False)
#	time.sleep(5)
	scores = dfs[1].apply(np.sum)
	colname = get_column_name(list(scores.index))
	dfs[1].fillna(0)
	print(dfs[1])
	dfs[1].to_csv("datasets/{}_{}.csv".format(vul_class,colname),index=False)
	val = list(scores.values);
#	print(scores)
	setlist[colname] = vector_to_numeric(scores,cvss_dfs);
	
	#scores.plot(kind='hist',subplots=True)
	#ax = scores.plot.bar(subplots=True,color="gray")
	#scores.plot(ax=axes[y_count,x_count],kind="barh",title="{} ({} {})".format(dfs[0],vul_class,entry_year))
	#y_count+=1;
#	print(x_count,y_count)
	#if y_count == 4:
	#	x_count = 1;
	#	y_count = 0

Path("JSON_SOURCE/{}.json".format(vul_class)).touch()
#print(setlist)
json.dump(setlist,open("JSON_SOURCE/{}.json".format(vul_class),"w"));
#plt.title("%s (%s %s)"%(dfs[0],vul_class,entry_year))
#plt.show();
#	calculate_sum = tup[1].groupby(tup[0]).count();
#	print(calculate_sum)
#	ax = tup[1].plot.bar(y=tup[0],color="gray")
#print(df[df['v3BaseScore'] != 6.1])

