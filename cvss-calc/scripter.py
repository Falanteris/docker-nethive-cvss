from cvss import CVSS3
import sys;
vector =  sys.argv[1]
calc = CVSS3(vector)

print(calc.scores()[0])




