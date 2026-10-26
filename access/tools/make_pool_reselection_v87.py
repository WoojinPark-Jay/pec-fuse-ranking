"""V87 Figure 5: larger internal type, unchanged data and PDF page dimensions.

Run this file directly to regenerate pool_reselection.pdf and its SVG/PNG
companions.
"""
from pathlib import Path
import csv
import sys
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D
import numpy as np

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from figure_style import configure
configure()
ROOT = HERE.parent
(ROOT / 'figures').mkdir(parents=True, exist_ok=True)
INK = '#25313B'
BLUE = '#287595'
PALE = '#DDEEF6'
MUTED = '#333333'
PAGE_PT = (612.6372109375, 341.788)
plt.rcParams.update({
    'font.size': 11.4, 'axes.labelsize': 11.6,
    'xtick.labelsize': 11.4, 'ytick.labelsize': 11.4,
    'legend.fontsize': 11.4, 'text.color': INK,
    'axes.labelcolor': INK, 'xtick.color': INK, 'ytick.color': INK,
})

def rows(name):
    with (ROOT / 'data' / name).open(newline='', encoding='utf-8-sig') as handle:
        return list(csv.DictReader(handle))

metrics = rows('pool_metrics.csv')
intervals = rows('pool_paired_differences.csv')
seeds = ['original', '7', '13', '42', '101', '202']
labels = ['Original', '7', '13', '42', '101', '202']
x = np.arange(6)
fig = plt.figure(figsize=(PAGE_PT[0] / 72, PAGE_PT[1] / 72), facecolor='white')

def title(ax, label):
    ax.set_title(label, loc='left', fontsize=12.5, weight='bold', pad=10)

for j, (reference, pec, contrast, reference_label) in enumerate([
    ('headline_control', 'headline_pec', 'headline_pec-headline_control', 'Control'),
    ('collapsed', 'audit_pec', 'audit_pec-collapsed', 'Collapsed'),
]):
    left = [.088, .584][j]
    top = fig.add_axes([left, .635, .402, .255])
    bottom = fig.add_axes([left, .225, .402, .270], sharex=top)
    base = np.array([float(next(r for r in metrics
        if r['seed'] == seed and r['model'] == reference)['ndcg@10']) for seed in seeds])
    full = np.array([float(next(r for r in metrics
        if r['seed'] == seed and r['model'] == pec)['ndcg@10']) for seed in seeds])
    top.vlines(x, base, full, color=PALE, lw=3, zorder=2)
    top.plot(x, base, 's', ms=5.7, mfc='white', mec=MUTED, mew=1,
             label=reference_label, zorder=3)
    top.plot(x, full, 'o', ms=6.3, mfc=BLUE, mec='white', mew=.7,
             label='Complete PEC', zorder=4)
    top.set_ylim(.63, .825)
    top.set_yticks([.65, .70, .75, .80])
    top.set_ylabel('NDCG@10', labelpad=5)
    top.legend(loc='upper right', ncol=2, columnspacing=.55,
               handletextpad=.3, handlelength=.9, borderaxespad=.15)
    title(top, ['(a) Operational control', '(b) Collapsed fusion'][j])
    top.set_xticks(x, labels)
    # The lower panels supply shared pool labels, freeing room for larger type.
    top.tick_params(axis='x', labelbottom=False)
    for k, seed in enumerate(seeds):
        row = next(r for r in intervals if r['seed'] == seed
                   and r['comparison'] == contrast and r['metric'] == 'ndcg@10')
        delta, lo, hi = [float(row[key]) for key in ['delta', 'ci_low', 'ci_high']]
        bottom.plot([k, k], [lo, hi], color=PALE, lw=5.5, zorder=2,
                    solid_capstyle='butt')
        bottom.errorbar(k, delta, yerr=[[delta-lo], [hi-delta]], fmt='o',
                        ms=6.3, mfc=BLUE, mec='white', mew=.7, color=BLUE,
                        capsize=3, elinewidth=1.15, zorder=3)
        if j == 0 and k > 0:
            # Similar upper CI endpoints cancel alternating point offsets.
            # Use two clear rows below these intervals instead.
            bottom.text(k, .012 if k % 2 else .030, f'{delta:+.4f}',
                        ha='center', va='bottom', fontsize=11.2, color=INK)
        else:
            bottom.annotate(f'{delta:+.4f}', (k, hi), xytext=(0, 3 if k % 2 == 0 else 12),
                            textcoords='offset points', ha='center', va='bottom',
                            fontsize=11.2, color=INK)
    bottom.axhline(0, color=MUTED, lw=.85, ls=(0, (3, 3)))
    bottom.set_ylim(-.004, .108)
    bottom.set_yticks([0, .05, .10], ['0.00', '0.05', '0.10'])
    bottom.set_ylabel(r'$\Delta$ NDCG@10', labelpad=5)
    bottom.set_xticks(x, labels)
    title(bottom, ['(c) PEC minus control', '(d) PEC minus collapsed'][j])
    for ax in [top, bottom]:
        ax.set_xlim(-.48, 5.45)
        ax.grid(axis='y', lw=.45)
        ax.set_axisbelow(True)
        ax.axvline(.5, color='#C9C9C9', lw=.65, ls=(0, (2, 3)))
        ax.tick_params(pad=4)

fig.text(.535, .107, 'Candidate-pool / tie-order seed', ha='center',
         fontsize=11.6, color=INK)
key = Line2D([0], [0], color=BLUE, marker='o', mfc=BLUE, mec='white',
             markersize=6.3, lw=1.15)
zero = Line2D([0], [0], color=MUTED, lw=.85, ls=(0, (3, 3)))
fig.legend([key, zero], ['Paired difference and 95% CI', 'No difference'],
           loc='lower center', bbox_to_anchor=(.52, .008), ncol=2,
           handlelength=2, columnspacing=1.5, fontsize=11.4)
# No tight bounding box: preserve the existing external width AND height.
for ext in ['pdf', 'svg', 'png']:
    fig.savefig(ROOT / 'figures' / ('pool_reselection.' + ext), dpi=220, facecolor='white')
plt.close(fig)
