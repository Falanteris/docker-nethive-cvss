import pandas as pd
import math
import sys


vultype = sys.argv[1];

#print(dataset)

base_values = {
                'AV':[0.85,0.62,0.55,0.20],
                'AC':[0.77,0.44],
                'PR':[0.85,0.62,0.27,0.68,0.5],
                'UI':[0.85,0.62],
                'S':[0.0,1.0],
                'C':[0,0.22,0.56],
                'I':[0,0.22,0.56],
                'A':[0,0.22,0.56]
}
def interitem_variance(data):
		# data is a pandas Series of float data
	local_mean = data.mean();

	sigma_x = [(float(instance) - local_mean)**2 for instance in data];
	#	print(sigma_x)
	size = len(list(data))
	sigma_x = (pd.Series(sigma_x).sum())
	
	sample_var = sigma_x /  (size - 1)
#	print("sample var : {}".format(sample_var))
	return sample_var
def gather_sample_var_data(vultype,vector):
	""" Gather numeric representation of the data, so we can implement Cronbach later """
	""" values corresponds to base_values"""
	dataset = "{}_{}.csv".format(vultype,vector);
	df = pd.read_csv(dataset);
	print(df.describe())
	data_total = df.shape[0]
	#print(data_total)


	#total_series = pd.Series([1 for i in range(0,data_total)])
	#print(total_series)
	#var_total_col = interitem_variance(total_series)
	#total_var = 0.0;
	score_df = [];
	# vector = dataset.split(".csv")[0].split("_")[1]
	#print(vector)
	for rows in df.iterrows():
	#	print(rows[1].tolist().index(1))
		score = base_values[vector][rows[1].tolist().index(1)]
		score_df.append(score)
	#	if rows["AV:L"] == 1:
	#		score_df.append({"AV":0.22},)
	#print(score_df)
	return score_df;
	# total_var = interitem_variance(score_df[vector])
	# var_total_col = interitem_variance(score_df["total"])
	# print(var_total_col)
	# #for i in df.columns.values.tolist():
	# #	interitem_var = interitem_variance(df[i])
	# #	total_var+=interitem_var;
	# #	print("Sample Var ({}): {}".format(i,interitem_var))
	# #print(total_var)
	# #print(" var total col {} ".format(var_total_col))
	# CronbachAlpha = (data_total/(data_total-1))*((var_total_col-total_var)/var_total_col)

	# print(CronbachAlpha)

def calc_cronbach(**kwargs):
	data =dict(kwargs);
	data_total = float(data["data_total"])
	a = data_total/(data_total-1);
	print("left hand equation result {}".format(a))
	var_total_col = float(data["var_total_col"])
	total_var = float(data["total_var"]);
	b = (var_total_col**2 - total_var**2)/var_total_col**2;
	#print("right hand equation result {}".format(b))
	return a*b;
	pass
if __name__ == "__main__":
	merge_df = {}
	for vectors in base_values:
		merge_df[vectors] = gather_sample_var_data(vultype,vectors);
	merge_df = pd.DataFrame(merge_df);
	merge_df = merge_df.replace([0.0,1.0,0.56,0.22],[0.1,1.1,0.57,0.23])
	#print(merge_df["S"])
	describe_result = merge_df.describe()
	describe_result.to_csv("{}_describe.csv".format(vultype),index_label=False,index=True)
	sys.exit()
	total_sample_var = 0.0
	rows_sum = []
	for rows in merge_df.iterrows():
		rows_sum.append(rows[1].sum())

	var_total_col = interitem_variance(pd.Series(rows_sum));
	#print("var total {}".format(var_total_col))
	for columns in merge_df.columns.values.tolist():
		data = interitem_variance(merge_df[columns])
		total_sample_var+=data;

	print("total sample var : {}".format(total_sample_var))
	print("sample var of data total : {}".format(var_total_col))
	amt = merge_df.shape[1];
	# print("data sum : {}".format(amt) )
	cronbach = calc_cronbach(data_total=amt,var_total_col=var_total_col,total_var=total_sample_var);
	
	print("cronbach alpha for {} is {}".format(vultype,cronbach))


