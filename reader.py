import numpy as np
import pandas as pd
import spacy
import time;

import json

read = pd.read_json("cleaned.json");
nlp = spacy.load("en_core_web_sm")
read = read["list"]
def parseLine(x):
	print (x);
	return x["description"]
def contains(keywords,target):
	for words in keywords:
		if target.find(words) != -1:
			print(target)
			print("Is Found");
			return True;
	return False;
def allbig(w):
	if w.upper() == w:
		return False;
#		word[word.index(w)] = False
	return True;
def replaceSQL(l):
	for i in l:
		print(l.index(i));
		print(i);
		if contains(["SQL","XSS","Blind SQL Injection"],i):
			

			del l[l.index(i)]
	#del l[4]
	print(l)
	return l;
read = read.apply(lambda x: parseLine(x))
new_list = []
desc = [r for r in read]
print("Using en_core_web_sm model to perform word labelling....");
for i in desc:
	doc = nlp(i);
	ner_tokens = [(token.text,token.label_) for token in doc.ents]
	if len(ner_tokens)==0:
		continue;
	print(ner_tokens);
	new_list.append(ner_tokens[0][0])
	time.sleep(5);
print("Done, replacing CVE stopwords");
new_list = replaceSQL(new_list);
s = pd.Series(new_list)
companies = pd.DataFrame(s,columns=["Company","Count","Lang"]);
comp_count = companies.groupby("Company").nunique()
print(companies["Company"].head())
false_data = companies["Company"].apply(allbig);

complete_companies = companies[false_data]
final = complete_companies[complete_companies["Company"] != "Blind SQL Injection"]
final = final.set_index("Company");
final["count"] = 1
final["count"] = final.groupby("Company")['count'].nunique()
print(final[final['count'] > 1])
#final  = final.groupby("Company").count();
#companies = companies.groupby("Company").count();
#print(companies);
