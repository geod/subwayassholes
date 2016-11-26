import matplotlib.pyplot as plt
import numpy as np
from pandas import DataFrame, read_csv
import pandas as pd
from scipy.interpolate import UnivariateSpline

datafile = "/Users/ewanlowe/Documents/developer/p5Subway/analysis/data.csv"
df = pd.read_csv(datafile)

fig, ax = plt.subplots()

for exiting in df['exiting'].unique():
    exN = df[df['exiting'] == exiting]
    exN = exN.groupby(['exiting', 'polite', 'asshole']).mean().sort(ascending=False)
    ax.plot(exN.index.get_level_values('asshole').values / (exiting + 0.0), exN, label=str(exiting) + ' enter/exit')

legend = ax.legend(loc='upper center', shadow=True)
frame = legend.get_frame()
frame.set_facecolor('0.90')
# Set the fontsize
for label in legend.get_texts():
    label.set_fontsize('large')


plt.grid(True)
plt.show()

plt.xlabel('Number of assholes within entering population')
plt.ylabel('Total Time Taken to Enter/Exit')
plt.title('Cost of an asshole')
#plt.savefig("test.png")
plt.show()