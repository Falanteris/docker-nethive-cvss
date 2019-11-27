## NVDEELYSIS 
This tool is designed to evaluate CVSS3 Information NVD JSON Datasets. It combines Node.js Events and Asynchronous File Reading with Python Data Science tools such as Pandas and Matplotlib for Data Visualization.

## Flowchart
The following is  the procedure to use the tool
1. use the script *reader.js* to a downloaded nvd json dataset ( if you wish to compile multiple datasets, separate the name of the files by comma) from nvd.nist.gov with the CWE and classification name.

    node reader.js < nvd-dataset(s), ... , ... > < cwe > < label >

 2. A file called *cleaned.json* should be outputted by the previous process. you can then call *nvd-df.py* to visualize the data.

Output: A Vertical Bar Chart of every Vector String of a single CWE class

