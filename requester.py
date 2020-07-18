import requests;

import sys


url = sys.argv[1]

r = requests.get(url)
print(r.status_code,end='')
