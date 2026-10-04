"""Temporal evaluation and candidate-construction schematic for Figure 2.

Blue is a structural accent, not a separate code for labels or evidence sources.
All categories are identified in text. Exports the manuscript protocol figure.
"""
from pathlib import Path
import sys
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Polygon

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / 'figures'
sys.path.insert(0, str(HERE))
from figure_style import configure
configure()
plt.rcParams['svg.fonttype'] = 'path'

INK = '#25313B'
MUTED = '#44515B'
BORDER = '#B1BBC2'
BLUE = '#287595'
PALE_BLUE = '#E8F3F9'
PALE_GRAY = '#E8F3F9'

fig = plt.figure(figsize=(18, 7.9), facecolor='white')
ax = fig.add_axes([0, 0, 1, 1])
ax.set_xlim(0, 1800)
ax.set_ylim(830, 0)
ax.axis('off')

def text(x, y, label, size=23, color=INK, weight='normal', ha='left', va='center'):
    size = {21:22, 23:22, 25:24, 27:26, 29:28, 39:36}.get(size,size)
    ax.text(x, y, label, fontsize=size * .72, color=color,
            fontweight=weight, ha=ha, va=va, linespacing=1.35)

def line(x1, y1, x2, y2, color=BORDER, width=.85, style='-'):
    ax.plot([x1, x2], [y1, y2], color=color, lw=width, ls=style,
            solid_capstyle='butt', zorder=1)

def rect(x, y, w, h, fill='white', edge=BORDER, lw=.85):
    ax.add_patch(Rectangle((x,y),w,h,facecolor=fill,edgecolor=edge,lw=lw))

def arrow(x1, x2, y):
    # A short hollow arrow, matching Figure 1's stage connectors.
    p=[(x1,y-3.7),(x2-11,y-3.7),(x2-11,y-9),
       (x2,y),(x2-11,y+9),(x2-11,y+3.7),(x1,y+3.7)]
    ax.add_patch(Polygon(p,closed=True,facecolor='white',edgecolor='#465D6C',lw=1.1))

def title(x,y,s):
    text(x,y,s,size=29,weight='bold')

# A. Aligned six-month timeline, with phase-specific cutoff annotations.
title(36,35,'A. Temporal evaluation')
text(1764,35,'January–June 2026',size=22,color=MUTED,ha='right')
line(36,61,1764,61)
start=286
step=174
for k,month in enumerate(['January','February','March','April','May','June']):
    text(start+(k+.5)*step,93,month,size=23,ha='center',color=INK)
for x in [start+3*step,start+4*step]:
    line(x,114,x,279,color='#C6D1DA',width=.8,style=(0,(3,4)))

text(36,156,'Model selection',size=24,weight='bold')
text(36,243,'Final evaluation',size=24,weight='bold')

rect(start,128,3*step,56,PALE_BLUE,BLUE)
rect(start+3*step,128,step,56,'#D8EBF5',BLUE)
text(start+1.5*step,156,'Fit candidate configurations',size=24,ha='center')
text(start+3.5*step,156,'Validate',size=24,ha='center',weight='bold')
text(start+5*step,156,'Not used for selection',size=21,ha='center',color=MUTED)

rect(start,215,4*step,56,PALE_BLUE,BLUE)
rect(start+4*step,215,2*step,56,'#D8EBF5',BLUE)
text(start+2*step,243,'Refit selected configuration',size=24,ha='center')
text(start+5*step,243,'Test',size=24,ha='center',weight='bold')

line(1380,119,1380,280,color='#D3DCE2')
text(1410,91,'POPULARITY CUTOFF',size=18,color=MUTED,weight='bold')
text(1410,143,'March 31',size=26,weight='bold')
text(1410,174,'For model selection',size=22,color=MUTED)
text(1410,230,'April 30',size=26,weight='bold')
text(1410,261,'For final test scoring',size=22,color=MUTED)

# B. Source blocks use the same restrained visual grammar as Figure 1.
title(36,329,'B. Query-level candidate construction')
text(1764,329,r'One user-day query: $q=(u,t)$',size=24,color=MUTED,ha='right')
line(36,355,1764,355)

y=379
h=200
def source(x,w,heading,symbol,fill,accent):
    rect(x,y,w,h)
    rect(x,y,w,42,fill,fill,lw=0)
    text(x+17,y+22,heading,size=25,weight='bold',color=accent)
    text(x+w/2,y+88,symbol,size=39,ha='center')

source(36,280,'Clicked positives',r'$Y^{+}_{u,t}$',PALE_BLUE,INK)
text(176,518,'Observed on',size=22,ha='center')
text(176,548,r'query day $t$',size=22,ha='center',color=MUTED)

source(356,340,'Retained non-clicks',r'$R^{-}_{u,t}$',PALE_BLUE,INK)
text(526,518,'From the retained trace',size=23,ha='center')
text(526,548,'Up to 24 articles',size=23,ha='center',color=MUTED)

source(736,380,'Introduced candidates',r'$N_{u,t}$',PALE_BLUE,INK)
text(926,512,r'Up to $\min(24,\max(4,4n_q^{+}))$',size=24,ha='center')
text(926,545,'Exclude positive / retained items',size=20,ha='center',color=MUTED)

for x in [336,716]:
    text(x,469,r'$\cup$',size=32,ha='center',color=BLUE)

arrow(1141,1199,469)
rect(1224,y,246,h)
rect(1224,y,246,42,PALE_GRAY,PALE_GRAY,lw=0)
text(1347,401,'Candidate pool',size=25,weight='bold',ha='center')
text(1347,467,r'$\mathcal{A}_{u,t}$',size=39,ha='center')
text(1347,518,'Deduplicate',size=22,ha='center')
text(1347,548,'query–item pairs',size=23,ha='center',color=MUTED)

arrow(1495,1547,469)
rect(1572,y,192,h)
rect(1572,y,192,42,PALE_GRAY,PALE_GRAY,lw=0)
text(1668,401,'Score & rank',size=24,weight='bold',ha='center')
for i,yy in enumerate([449,482],1):
    text(1595,yy,str(i),size=22,color=MUTED)
    text(1658,yy,rf'$i_{{({i})}}$',size=28,ha='center')
text(1658,517,r'$\vdots$',size=25,ha='center',color=MUTED)
text(1668,551,'Within query',size=21,ha='center',color=MUTED)

# Explicitly distinguish the two introduced-item rules, not just their windows.
text(36,616,r'Introduced-set rules: $N_{u,t}$',size=24,weight='bold')
text(1116,616,r'$n_q^{+}$: number of observed positives',size=21,ha='right',color=MUTED)

rect(36,642,516,137,'white')
text(54,668,'Recent-window',size=24,weight='bold')
for k,day in enumerate([r'$t-3$',r'$t-2$',r'$t-1$',r'$t$']):
    x=54+k*75
    rect(x,703,69,44,PALE_BLUE,'#B4C5D3',lw=.65)
    text(x+34.5,726,day,size=25,ha='center')
arrow(363,392,725)
text(412,713,'Random',size=22)
text(412,743,'sample',size=22)

rect(576,642,540,137,'white')
text(594,668,'Same-day',size=24,weight='bold')
rect(594,703,69,44,PALE_BLUE,'#B4C5D3',lw=.65)
text(628.5,726,r'$t$',size=25,ha='center')
arrow(684,713,725)
text(735,711,'Frozen click-count order',size=22)
text(735,742,'Source-file order for ties',size=22,color=MUTED)

line(1224,642,1764,642)
text(1224,668,'Selection is not ranking',size=24,weight='bold')
text(1224,710,'The rule determines which items enter.',size=22,color=MUTED)
text(1224,746,'The model determines their final order.',size=22,color=MUTED)

for ext in ['pdf','svg','png']:
    fig.savefig(OUT / ('protocol.'+ext),dpi=170,facecolor='white')
plt.close(fig)
