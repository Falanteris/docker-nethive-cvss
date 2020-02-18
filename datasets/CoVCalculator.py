import pandas as pd
import sys

csv_file = sys.argv[1]
df = pd.read_csv(csv_file);
save_address = "CoV_{}.csv".format(csv_file.split("_")[0])
result = pd.DataFrame(((df.loc["std"]**2)*100/df.loc["mean"]),columns=["CoV (%)"]);
#print(df)
result["mean"] = df.loc["mean"]
result["std"] = df.loc["std"]
result.to_csv(save_address,index=True,index_label=False);
#print(df.loc["mean"])

