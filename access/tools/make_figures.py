"""Standalone visual proposals; reads archived aggregates, changes no estimates."""
from pathlib import Path
import csv
import sys
import runpy
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D
from matplotlib.transforms import blended_transform_factory

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / 'figures'
OUT.mkdir(parents=True, exist_ok=True)
DATA = HERE.parent / 'data'
sys.path.insert(0, str(HERE))
from figure_style import configure
configure()
INK = '#25313B'
MUTED = '#333333'
BLUE = '#287595'
PALE = '#DDEEF6'
BORDER = '#292929'
plt.rcParams.update({'svg.fonttype': 'path', 'text.color': INK,
    'axes.labelcolor': INK, 'xtick.color': INK, 'ytick.color': INK,
    'grid.color': '#E8E8E8', 'font.size': 9})

def rows(name):
    with open(DATA / name, newline='', encoding='utf-8-sig') as f:
        return list(csv.DictReader(f))

def save(fig, name):
    for ext in ['pdf', 'svg', 'png']:
        fig.savefig(OUT / (name + '.' + ext), dpi=220,
                    bbox_inches='tight', pad_inches=.08, facecolor='white')
    plt.close(fig)

def panel_title(ax, title):
    ax.set_title(title, loc='left', weight='bold', size=10, pad=14)
    ax.plot([0, 1], [1.025, 1.025], transform=ax.transAxes,
            color=BORDER, lw=.6, clip_on=False)

def interval(ax, x, y, lo, hi, vertical=False):
    # The pale stroke and thin capped line have precisely the same endpoints.
    if vertical:
        ax.plot([x, x], [lo, hi], color=PALE, lw=5.5,
                solid_capstyle='butt', zorder=2)
        return ax.errorbar(x, y, yerr=[[y-lo], [hi-y]], fmt='o',
            ms=5.4, mfc=BLUE, mec='white', mew=.65, color=BLUE,
            capsize=3, elinewidth=1.1, zorder=3)
    ax.plot([lo, hi], [y, y], color=PALE, lw=5.5,
            solid_capstyle='butt', zorder=2)
    return ax.errorbar(x, y, xerr=[[x-lo], [hi-x]], fmt='o',
        ms=5.4, mfc=BLUE, mec='white', mew=.65, color=BLUE,
        capsize=3, elinewidth=1.1, zorder=3)

def legend(fig, handle, label='Mean difference and paired 95% CI'):
    zero = Line2D([0], [0], color=MUTED, lw=.8, ls=(0,(3,3)))
    fig.legend([handle, zero], [label, 'No difference'],
        loc='lower center', bbox_to_anchor=(.5,.005), ncol=2,
        handlelength=2.5, columnspacing=2.5, fontsize=8)

def forest(records, labels, name, limits, xlabel, left):
    fig, axes = plt.subplots(1,2,figsize=(8.6,2.8), sharex=True, sharey=True)
    for j, ax in enumerate(axes):
        panel_title(ax, ['(a) Recent-window','(b) Same-day'][j])
        ax.set_xlim(*limits)
        ax.set_ylim(-.45, 3.55)
        ax.set_yticks([3,2,1,0], labels)
        ax.tick_params(axis='y', length=0, pad=7)
        ax.spines['left'].set_visible(False)
        ax.grid(axis='x', lw=.45)
        ax.set_axisbelow(True)
        ax.axvline(0,color=MUTED,lw=.85,ls=(0,(3,3)),zorder=1)
        trans = blended_transform_factory(ax.transAxes, ax.transData)
        ax.text(1.07,1.06,r'$\Delta$',transform=ax.transAxes,
                ha='center',va='bottom',fontsize=9,color=INK)
        for k, (d, lo, hi) in enumerate(records[j]):
            yy = 3-k
            key = interval(ax,d,yy,lo,hi)
            ax.text(1.07, yy, f'{d:+.4f}', transform=trans,
                    ha='center',va='center',fontsize=8.1,color=INK)
        ax.set_xlabel(xlabel, labelpad=8, fontsize=8.5)
    fig.subplots_adjust(left=left,right=.935,bottom=.30,top=.81,wspace=.41)
    legend(fig,key)
    save(fig,name)

regimes = ['recent_window','popularity_matched']
fusion = rows('fusion_paired_intervals.csv')
records = []
for regime in regimes:
    rec = [next(r for r in fusion if r['regime']==regime
        and r['left']=='full_pec' and r['right']==f'fusion_{d}d'
        and r['metric']=='ndcg@10') for d in [1,2,4,5]]
    records.append([[float(r[k]) for k in ['delta','user_ci_low','user_ci_high']] for r in rec])
forest(records,['1-D fusion','2-D fusion','4-D fusion','5-D fusion'],
    'fusion_width',(-.005,.026),r'$\Delta$ NDCG@10: complete PEC $-$ fusion',.115)

core = rows('core_user_bootstrap.csv')
checks=['headline_full_vs_control','E0_full_vs_control',
        'pc_no_e_vs_control_no_e','matched_full_vs_no_e']
labels=['Complete PEC vs control',r'PEC vs control ($E=0$)',
        'No-E PEC vs no-E control','Complete PEC vs no-E PEC']
records=[]
for regime in regimes:
    rec=[next(r for r in core if r['candidate_regime']==regime
        and r['comparison']==check and r['metric']=='ndcg@10') for check in checks]
    records.append([[float(r[k]) for k in ['delta','ci_low','ci_high']] for r in rec])
forest(records,labels,'evidence_checks',(-.004,.175),
    r'$\Delta$ NDCG@10: first model $-$ second',.255)

runpy.run_path(str(HERE/'make_pool_reselection_v87.py'))

runpy.run_path(str(HERE/'make_protocol.py'))
runpy.run_path(str(HERE/'make_candidate_example.py'))
