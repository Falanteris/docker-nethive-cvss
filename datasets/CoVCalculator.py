import pandas as pd
import sys
import math
csv_file = sys.argv[1]
df = pd.read_csv(csv_file);
save_address = "CoV_{}.csv".format(csv_file.split("_")[0])
print(df.loc["std"]["AV"])
#result = pd.DataFrame(((df.loc["std"])/df.loc["mean"]),columns=["CoV (%)"]);
result = pd.DataFrame(((df.loc["std"])/df.loc["count"].apply(math.sqrt)),columns=["stderr"]);
#result = pd.DataFrame((df.loc["std"]["AV"])/math.sqrt(df.loc["count"]["AV"])),columns=["stderr"]);
#print(df)
result["mean"] = df.loc["mean"]
result["std"] = df.loc["std"]
print(result)
result.to_csv(save_address,index=True,index_label=False);

