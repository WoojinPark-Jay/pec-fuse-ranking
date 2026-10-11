"""Figure 1-aligned typography and neutral comparison palette.
Helvetica is read from local system fonts; proprietary font files are not distributed.
"""
from pathlib import Path
import tempfile
import matplotlib.pyplot as plt
from matplotlib import font_manager as fm
INK='#25313B'; MUTED='#56626B'; BLUE='#566F89'; GRAY='#8C969F'; BORDER='#B1BBC2'
P='#287595'; E='#A76A30'; C='#357C60'; Z='#756B9A'
_CACHE=None
def configure():
 global _CACHE
 font=Path('/System/Library/Fonts/Helvetica.ttc')
 if font.exists() and _CACHE is None:
  from fontTools.ttLib import TTCollection
  _CACHE=tempfile.TemporaryDirectory(prefix='pec-helvetica-')
  for i,face in enumerate(TTCollection(font).fonts):
   p=Path(_CACHE.name)/f'Helvetica-{i}.ttf';face.save(p);fm.fontManager.addfont(str(p))
 plt.rcParams.update({'font.family':'sans-serif','font.sans-serif':['Helvetica','Arial','Liberation Sans','DejaVu Sans'],
  'mathtext.fontset':'stix','font.size':9,'axes.titlesize':10,'axes.labelsize':8.5,
  'xtick.labelsize':8,'ytick.labelsize':8.5,'pdf.fonttype':42,'ps.fonttype':42,
  'axes.spines.top':False,'axes.spines.right':False,'axes.edgecolor':'#292929',
  'axes.linewidth':.65,'grid.color':'#E8E8E8','grid.linewidth':.55,
  'text.color':INK,'axes.labelcolor':INK,'xtick.color':MUTED,'ytick.color':MUTED,
  'savefig.facecolor':'white','legend.fontsize':8,'legend.frameon':False})
