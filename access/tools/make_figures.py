"""Regenerate Figures 2--5 from archived aggregate data; no experimental changes."""
from pathlib import Path
import csv,sys,runpy
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D
sys.path.insert(0,str(Path(__file__).resolve().parent))
from figure_style import configure,INK,MUTED,BLUE,GRAY,BORDER
configure()
OUT=Path(__file__).resolve().parents[1];figdir=OUT/'figures'
def rows(path):
 with open(path,newline='',encoding='utf-8-sig') as f:return list(csv.DictReader(f))
def save(fig,name):
 for ext in ['pdf','svg','png']:fig.savefig(figdir/(name+'.'+ext),dpi=220,bbox_inches='tight',pad_inches=.055)
 plt.close(fig)
def interval_key(fig,handle,labels=None):
 zero=Line2D([0],[0],color=MUTED,lw=.85,linestyle=(0,(3,2)))
 fig.legend([handle,zero],labels or ['Mean difference and paired 95% CI','No difference'],
  loc='lower center',bbox_to_anchor=(.5,.005),ncol=2,handlelength=2.7,columnspacing=2.5)
runpy.run_path(str(OUT/'tools/make_protocol.py'))
regimes=['recent_window','popularity_matched'];titles=['(a) Recent-window','(b) Same-day']
fusion=rows(OUT/'data/fusion_paired_intervals.csv')
fig,axes=plt.subplots(1,2,figsize=(7.6,2.6),sharex=True,sharey=True)
for j,(regime,ax) in enumerate(zip(regimes,axes)):
 rec=[next(r for r in fusion if r['regime']==regime and r['left']=='full_pec' and r['right']==f'fusion_{d}d' and r['metric']=='ndcg@10') for d in [1,2,4,5]]
 x,lo,hi=[np.array([float(r[k]) for r in rec]) for k in ['delta','user_ci_low','user_ci_high']]
 ax.axvline(0,color=MUTED,lw=.85,ls=(0,(3,2)))
 key=ax.errorbar(x,np.arange(4)[::-1],xerr=[x-lo,hi-x],fmt='o',ms=4.5,color=BLUE,capsize=2.5,lw=1.2)
 ax.set_yticks([3,2,1,0],['1-D fusion','2-D fusion','4-D fusion','5-D fusion'])
 ax.set_xlim(-.005,.026);ax.set_ylim(-.45,3.5);ax.grid(axis='x');ax.set_axisbelow(True)
 ax.set_title(titles[j],loc='left',fontweight='bold',pad=10)
 ax.set_xlabel(r'$\Delta$ NDCG@10: complete PEC $-$ fusion',labelpad=7)
fig.subplots_adjust(left=.12,right=.99,bottom=.31,top=.84,wspace=.23)
interval_key(fig,key)
save(fig,'fusion_width')

core=rows(OUT/'data/core_user_bootstrap.csv')
checks=['headline_full_vs_control','E0_full_vs_control','pc_no_e_vs_control_no_e','matched_full_vs_no_e']
labels=['Complete PEC vs control',r'PEC vs control ($E=0$)','No-E PEC vs no-E control','Complete PEC vs no-E PEC']
fig,axes=plt.subplots(1,2,figsize=(7.6,2.75),sharex=True,sharey=True)
for j,(regime,ax) in enumerate(zip(regimes,axes)):
 for k,check in enumerate(checks):
  r=next(r for r in core if r['candidate_regime']==regime and r['comparison']==check and r['metric']=='ndcg@10')
  d,lo,hi=[float(r[t]) for t in ['delta','ci_low','ci_high']]
  key=ax.errorbar(d,3-k,xerr=[[d-lo],[hi-d]],fmt='o',ms=4.5,color=BLUE,capsize=2.5,lw=1.2)
 ax.axvline(0,color=MUTED,lw=.85,ls=(0,(3,2)));ax.grid(axis='x');ax.set_axisbelow(True)
 ax.set_xlim(-.004,.175);ax.set_ylim(-.45,3.5);ax.set_yticks([3,2,1,0],labels)
 ax.set_xlabel(r'$\Delta$ NDCG@10: first model $-$ second',labelpad=7)
 ax.set_title(titles[j],loc='left',fontweight='bold',pad=10)
fig.subplots_adjust(left=.27,right=.99,bottom=.30,top=.84,wspace=.18)
interval_key(fig,key,['Difference and paired 95% CI','No difference'])
save(fig,'evidence_checks')

metrics=rows(OUT/'data/pool_metrics.csv');cis=rows(OUT/'data/pool_paired_differences.csv')
seeds=['original','7','13','42','101','202'];x=np.arange(6)
fig,axes=plt.subplots(2,2,figsize=(7.6,4.0),sharex=True)
for j,(reference,pec,comparison) in enumerate([('headline_control','headline_pec','headline_pec-headline_control'),('collapsed','audit_pec','audit_pec-collapsed')]):
 ax=axes[0,j]
 for model,color,marker,label,offset in [(reference,GRAY,'s','Control' if j==0 else 'Collapsed',-.085),(pec,BLUE,'o','Complete PEC' if j==0 else 'Audit PEC',.085)]:
  vals=[float(next(r for r in metrics if r['seed']==s and r['model']==model)['ndcg@10']) for s in seeds]
  ax.plot(x+offset,vals,marker=marker,markersize=4.3,color=color,ls='none',label=label)
 ax.set_ylim(.63,.825);ax.set_ylabel('NDCG@10');ax.grid(axis='y');ax.set_axisbelow(True)
 ax.legend(loc='upper right',ncol=2,columnspacing=1,handletextpad=.4)
 ax.set_title(['(a) Headline fits','(b) Compression-audit fits'][j],loc='left',fontweight='bold',pad=9)
 ax=axes[1,j]
 for k,s in enumerate(seeds):
  r=next(r for r in cis if r['seed']==s and r['comparison']==comparison and r['metric']=='ndcg@10')
  d,lo,hi=[float(r[t]) for t in ['delta','ci_low','ci_high']]
  key=ax.errorbar(k,d,yerr=[[d-lo],[hi-d]],fmt='o',ms=4.3,color=BLUE,capsize=2.5,lw=1.15)
 ax.axhline(0,color=MUTED,lw=.85,ls=(0,(3,2)));ax.grid(axis='y');ax.set_axisbelow(True);ax.set_ylim(-.004,.10)
 ax.set_title(['(c) PEC minus control','(d) Audit PEC minus collapsed'][j],loc='left',fontweight='bold',fontsize=9,pad=8)
 ax.set_xticks(x,['Original','7','13','42','101','202']);ax.set_xlabel('Candidate-pool / tie-order seed',labelpad=6);ax.set_ylabel(r'$\Delta$ NDCG@10')
 for a in axes[:,j]:
  a.set_xlim(-.45,5.4);a.axvspan(-.45,.45,color='#F3F5F7',zorder=-3);a.axvline(.5,color=BORDER,lw=.65,ls=(0,(2,3)))
fig.subplots_adjust(left=.09,right=.99,bottom=.21,top=.91,wspace=.27,hspace=.47)
interval_key(fig,key,['Paired difference and 95% CI','No difference'])
save(fig,'pool_reselection')
