import json
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
r=Path(__file__).resolve().parent;d=json.loads((r/'report.json').read_text())
plt.rcParams.update({'font.size':10,'axes.spines.top':False,'axes.spines.right':False,'axes.titleweight':'bold','figure.facecolor':'#f7f6f2','axes.facecolor':'#ffffff'})
fig,axs=plt.subplots(2,2,figsize=(12,8),layout='constrained')
f,db,phase=zip(*d['ac']);axs[0,0].semilogx(f,db,color='#b4542b',lw=2);axs[0,0].axvline(d['nominal']['cutoff_hz'],color='#176d62',ls='--');axs[0,0].set(title='Frequency response · actual ngspice',xlabel='Frequency (Hz)',ylabel='Gain (dB)',ylim=(-100,10));axs[0,0].grid(alpha=.2)
f,out,inp=zip(*d['noise']);axs[0,1].loglog(f,[x*1e9 for x in out],color='#176d62',lw=2);axs[0,1].set(title='Output noise density · 27 °C',xlabel='Frequency (Hz)',ylabel='nV / √Hz');axs[0,1].grid(alpha=.2)
t,x,y=zip(*d['step']);axs[1,0].plot([v*1000 for v in t],x,label='Input',color='#9ca3a5');axs[1,0].plot([v*1000 for v in t],y,label='Output',color='#b4542b',lw=2);axs[1,0].set(title='Small-signal step · 100 mV input',xlabel='Time (ms)',ylabel='Voltage (V)',xlim=(.8,2.2));axs[1,0].legend();axs[1,0].grid(alpha=.2)
axs[1,1].hist([s['cutoff_hz'] for s in d['samples']],bins=14,color='#176d62',edgecolor='white');axs[1,1].set(title='128 SPICE tolerance runs · seed 17',xlabel='−3 dB frequency (Hz)',ylabel='Samples');axs[1,1].axvline(d['nominal']['cutoff_hz'],color='#b4542b',ls='--')
fig.suptitle('FilterBench | Linear active-filter simulation evidence',fontsize=17);fig.savefig(r/'evidence.png',dpi=170)
print('Saved evidence.png from actual recorded simulation data.')
