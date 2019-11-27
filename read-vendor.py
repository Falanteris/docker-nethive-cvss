import matplotlib.pyplot as plt
plt.close("all");
import pandas as pd
import sys
import json
input = pd.read_json(sys.argv[1])
pd.options.mode.chained_assignment = None
def nonEmptyJsonArr(x):
#	data = json.loads(json.dumps(x));
	if len(x) == 0:
		return False;
	return True
def vendor_name(df):
	stack = []
	for i in df:
		for j in i:
			
			l = j["vendor_name"]
			stack.append(l);
	#	print(i[0]['vendor_name']);
#		print(df.loc[i])
	#	l = i[0].vendor_name or "Undefined"
	#	stack.push(l)
	return stack;
print(input.shape)
clear = input["vendor_info"].apply(nonEmptyJsonArr)

sanitized = input[clear]


sanitized["vendor"] = pd.Series(vendor_name(sanitized["vendor_info"]))

occurence = sanitized.groupby("vendor").count();
occurence = occurence.sort_values(by="vendor_info",ascending=False);
#print(occurence.head())

frequent = sanitized.vendor.mode()

print("Most frequent CVE Entry Vendor : %s"%frequent[0]);
#print(sanitized["vendor"])
datalength = sanitized[sanitized["vendor"] == frequent[0]].shape[0]
print("With %s number of CVE entries"% datalength);
#print(type(occurence))
occurence = occurence.drop("vendor_info",axis=1)
print(occurence)
fig, ax  = plt.subplots()
occurence = occurence.reset_index()
#print(occurence);
occurence.plot.hist(ax=ax,x='vendor' ,y='CVE');
occurence.to_csv(sys.argv[1]+".csv",index=False);
ax.set_yscale("log")

plt.show();
#ax.show();
