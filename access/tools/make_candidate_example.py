"""V87 synthetic example: larger internal type at the original PDF page size.

PDF, SVG, and PNG companions share one source.
"""
from pathlib import Path
from decimal import Decimal
import sys
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle

HERE=Path(__file__).resolve().parent
OUT=HERE.parent/'figures'
OUT.mkdir(parents=True, exist_ok=True)
sys.path.insert(0,str(HERE))
from figure_style import configure
configure()
plt.rcParams['svg.fonttype']='path'
INK='#25313B'; MUTED='#44515B'; BORDER='#B1BBC2'
def tint(hexcolor,alpha=.45):
    c=[int(hexcolor[i:i+2],16) for i in (1,3,5)]
    return '#'+''.join(f'{round(alpha*v+(1-alpha)*255):02x}' for v in c)
# Figure 1's candidate-matrix palette, with a uniform white tint for readability.
colors={'P':('#287595',tint('#B7E2F3')),'E':('#A76A30',tint('#FFDBAB')),
        'C':('#357C60',tint('#BAE8D0')),'Z':('#756B9A',tint('#DCD8F5')),
        'Products':('#566F89',tint('#CEDDEA'))}
fig=plt.figure(figsize=(17,13.4),facecolor='white')
ax=fig.add_axes([0,0,1,1]);ax.set_xlim(0,1700);ax.set_ylim(1340,0);ax.axis('off')
def txt(x,y,s,size=23,color=INK,bold=False,ha='left'):
    # Previously the smallest ordinary labels were 12.096 pt in this PDF.
    # Preserve the canvas while increasing them to 17.5 pt (about 6.6 pt
    # at the manuscript's existing 0.92-textwidth placement).
    points = 17.5 if size <= 21 else (19 if size <= 23 else (21 if size <= 25 else (22 if size <= 27 else 24)))
    ax.text(x,y,s,fontsize=points,color=color,fontweight='bold' if bold else 'normal',ha=ha,va='center',linespacing=1.05)
def rule(y,x1=38,x2=1662):ax.plot([x1,x2],[y,y],lw=.8,color=BORDER)
def box(x,y,w,h,fill='white',edge=BORDER):
    ax.add_patch(Rectangle((x,y),w,h,facecolor=fill,edgecolor=edge,lw=.75))

txt(38,37,'Candidate evidence and feature construction',30,bold=True)
txt(38,76,'Synthetic example for a single user-day query.',21,MUTED)
rule(102)
txt(38,133,'A. Candidate-level summary',25,bold=True)
txt(1662,133,r'One query $q=(u,t)$',23,MUTED,ha='right')

xs=[58,230,660,820,980,1150,1320,1530]
headers=['Candidate','Article topic','Profile P','Trace\nmember','Reciprocal\nrank','C mean','C\nattention','Record\ndetail']
for x,h in zip(xs,headers):txt(x,176,h,21,bold=True,ha='left' if x<300 else 'center')
rule(206)
rows=[('A','Climate-policy news','0.82','0','0','0.31','0.40','Full: Panel B'),
      ('B','Sports coverage','0.28','1','0.20','0.76','0.72','Selected: Panel C'),
      ('C','Science reporting','0.63','1','0.50','0.44','0.51','Not shown')]
for j,row in enumerate(rows):
    y=233+j*48
    for x,s in zip(xs,row):txt(x,y,s,22,bold=(j==0 and x==58),ha='left' if x<300 else 'center')
rule(356)
txt(38,389,'B. Complete feature record for candidate A',25,bold=True)
txt(38,426,'Source-grouped view; the estimator uses the order specified in the feature-schema table.',21,MUTED)

groups=[
('P','Profile alignment', [('P','0.82')]),
('E','Retained trace', [('Member','0'),('1 / rank','0'),(r'$E_x$','0')]),
('C','Consumption', [('Mean','0.31'),('Max','0.58'),('Top-3','0.45'),('Attn.','0.40')]),
('Z','Recorded controls', [('Pref.\ncat.','0.70'),('Pref.\npub.','0.20'),('Hist.\ncat.','0.10'),('Hist.\npub.','0.05'),
                           ('Log\nclicks','4.62'),('P\ncount','0.90'),('C\ncount','0.15'),('Pop.\nscore','0.42'),
                           ('Recency','0.25'),('Log\nlength','6.55'),('Breaking','0')]),
('Products','Interactions', [(r'$P E_x$','0'),(r'$C_{mean}E_x$','0'),(r'$P C_{mean}$','0.2542'),
                            (r'$C_{\mathrm{attn}}E_x$','0'),(r'$C_{max}E_x$','0'),(r'$P C_{\mathrm{attn}}$','0.3280')])]
for j,(key,label,fields) in enumerate(groups):
    y=453+j*78+(32 if key=='Products' else 0)
    accent,fill=colors[key]
    # No decorative left-side bars. Only value cells carry source-color fills.
    display=key if key!='Products' else r'$\psi$'
    txt(62,y+20,display,27,accent,True)
    txt(106,y+20,label,22,bold=True)
    txt(106,y+49,f'{len(fields)} field'+('s' if len(fields)!=1 else ''),20,MUTED)
    for k,(name,value) in enumerate(fields):
        x=370+k*117
        # Give wrapped control labels their own header area, preserving type size.
        box(x,y,112,94 if key=='Z' else 64,fill,BORDER)
        txt(x+56,y+(29 if key=='Z' else 18),name,16.8,INK,ha='center')
        txt(x+56,y+(72 if key=='Z' else 46),value,23,INK,False,ha='center')
    if key=='P':txt(509,y+32,'Profile-to-candidate cosine similarity.',21,MUTED)
    if key=='E':txt(748,y+32,'No retained-trace entry; not proof of non-exposure.',21,MUTED)
    if key=='C':txt(868,y+32,'Distinct summaries of prior consumption.',21,MUTED)
    if key=='Products':
        txt(1100,y+20,r'$P\times C_{mean}=0.82\times0.31=0.2542$',22,INK)
        txt(1100,y+49,'Derived input feature, not a predicted score.',20,MUTED)

rule(883)
txt(38,918,r'$1+3+4+11+6=25$ fields per candidate',25,bold=True)
txt(1662,918,'Number of candidates varies by query.',23,MUTED,ha='right')
rule(951)
txt(38,985,'C. Trace-dependent features: candidates A and B',25,bold=True)
txt(38,1023,'Selected fields only; both candidates use the same 25-field schema.',21,MUTED)
txt(58,1067,'Candidate',21,bold=True)
contrast_headers=['Trace member','Reciprocal rank','Combined trace\nscore $E_x$',
                  r'$P E_x$',r'$C_{mean}E_x$',r'$C_{\mathrm{attn}}E_x$']
for k,name in enumerate(contrast_headers):
    txt(445+k*220,1067,name,21,bold=True,ha='center')
rule(1092)
for j,row in enumerate(rows[:2]):
    y=1102+j*56
    p,member,rank,cmean,catt=map(Decimal,row[2:7])
    combined=member+rank
    values=[format(member,'.0f'),format(rank,'.2f'),format(combined,'.2f'),
            format(p*combined,'.3f'),format(cmean*combined,'.3f'),format(catt*combined,'.3f')]
    txt(58,y+24,'Candidate '+row[0],22,bold=True)
    for k,value in enumerate(values):
        x=340+k*220
        fill=colors['E' if k<3 else 'Products'][1]
        box(x,y,210,48,fill,BORDER)
        txt(x+105,y+24,value,23,ha='center')
rule(1218)
txt(38,1252,r'For candidate B: $E_x=1+0.20=1.20$ and $P E_x=0.28\times1.20=0.336$.',22)
txt(38,1286,r'Combined trace score $E_x$ is a feature value, not an exposure probability.',20,MUTED)
txt(38,1320,'Colors identify source blocks, not magnitude or importance. Values are illustrative and rounded.',20,MUTED)
for ext in ['pdf','svg','png']:
    fig.savefig(OUT/('candidate_record_example.'+ext),dpi=170,facecolor='white')
plt.close(fig)
