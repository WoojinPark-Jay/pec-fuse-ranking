"""Compact protocol figure; schematic, not additional experimental data."""
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle,FancyArrowPatch
OUT=Path(__file__).resolve().parents[1]/'figures'
import sys
sys.path.insert(0,str(Path(__file__).resolve().parent))
from figure_style import configure,INK,MUTED,BLUE,BORDER
configure()
ink=INK;blue=BLUE;teal='#465D6C';gray=BORDER
fig=plt.figure(figsize=(7.5,2.32));ax=fig.add_axes([.01,.025,.98,.95])
ax.set_xlim(0,100);ax.set_ylim(0,100);ax.axis('off')
ax.text(0,99,'(a) Temporal evaluation',fontsize=10,fontweight='bold',va='top')
left=26;step=12
for x,label in [(44,'January–March'),(68,'April'),(86,'May–June')]:
 ax.text(x,89,label,ha='center',va='center',fontsize=8.5)
def band(y,x,w,label,edge,fill):
 ax.add_patch(Rectangle((x,y),w,7,facecolor=fill,edgecolor=edge,lw=.7))
 ax.text(x+w/2,y+3.5,label,ha='center',va='center',fontsize=8.1)
ax.text(0,77.5,'Selection',va='center',fontsize=9)
ax.text(0,64.5,'Final model',va='center',fontsize=9)
band(74,26,36,'Fit',blue,'#F1F5F8');band(74,62,12,'Validate',gray,'#F6F5F2')
band(61,26,48,'Refit selected configuration',blue,'#F1F5F8');band(61,74,24,'Test',teal,'#EDF2F5')
ax.text(26,52,'Popularity cutoff: Mar 31 for selection; Apr 30 for final scoring',fontsize=7.7,va='center',color='#596B76')
ax.plot([0,100],[44,44],color='#D6DDE1',lw=.55)
ax.text(0,39,'(b) Query-level candidate assembly',fontsize=10,fontweight='bold',va='top')
items=[(9,r'$Y^+_{u,t}$','Clicked positives'),(31,r'$R^-_{u,t}$','Retained non-clicks'),(54,r'$N_{u,t}$','Introduced items')]
for x,math,label in items:
 ax.text(x,24,math,ha='center',va='center',fontsize=13)
 ax.text(x,13,label,ha='center',va='center',fontsize=8.1)
for x in [20,43]:ax.text(x,24,r'$\cup$',ha='center',va='center',fontsize=12,color=gray)
ax.add_patch(FancyArrowPatch((64,24),(70,24),arrowstyle='-|>',mutation_scale=9,lw=.85,color=ink))
ax.text(77,24,r'$\mathcal{A}_{u,t}$',ha='center',va='center',fontsize=13)
ax.text(77,13,'Unique pairs',ha='center',va='center',fontsize=8.1)
ax.add_patch(FancyArrowPatch((84,24),(89,24),arrowstyle='-|>',mutation_scale=9,lw=.85,color=ink))
ax.text(95,24,'Score',ha='center',va='center',fontsize=9)
ax.text(95,13,'then rank',ha='center',va='center',fontsize=8.1)
ax.text(31,3,'Up to 24',ha='center',va='center',fontsize=7.5,color='#596B76')
ax.text(54,3,r'Recent: $t-3{:}t$  /  Same-day: $t$',ha='center',va='center',fontsize=7.5,color='#596B76')
for ext in ['pdf','svg','png']:
 fig.savefig(OUT/('protocol.'+ext),bbox_inches='tight',pad_inches=.045,dpi=220)
plt.close(fig)
