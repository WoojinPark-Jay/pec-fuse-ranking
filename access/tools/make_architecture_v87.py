"""Remove four obsolete SVG glyph instances; export Figure 1 as native vectors.

architecture_native_v86.svg is the unchanged source snapshot. The four exact
instance coordinates below distinguish obsolete parentheses from the visible
last-row labels and from the intact argsort formula. No glyph definition, other
instance, diagram path, formula, or data is redrawn or masked.

Dependencies: svglib, reportlab. PNG companions can be rendered from the SVG.
"""
from pathlib import Path
import re

from svglib.svglib import svg2rlg
from reportlab.graphics import renderPDF

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / 'tools' / 'architecture_native_v86.svg'
raw = SOURCE.read_text(encoding='utf-8')
REMOVED = [
    ('#glyph-48-1', '1411.09731', '463.365677'),
    ('#glyph-48-2', '1424.344508', '463.365677'),
    ('#glyph-48-1', '1557.337763', '463.365677'),
    ('#glyph-48-2', '1570.584962', '463.365677'),
]
for glyph, x, y in REMOVED:
    pattern = (r'<use\b(?=[^>]*xlink:href="' + re.escape(glyph)
               + r'")(?=[^>]*\bx="' + re.escape(x)
               + r'")(?=[^>]*\by="' + re.escape(y) + r'")[^>]*/>')
    raw, count = re.subn(pattern, '', raw)
    if count != 1:
        raise ValueError(f'Expected one exact obsolete glyph instance: {(glyph, x, y)}; got {count}')

# Preserve the existing 710.4 x 203.28 pt PDF framing. The native source has
# a narrower aspect ratio: center it with horizontal whitespace, never stretch
# the scientific diagram. Expanding the viewBox changes no diagram coordinates.
native_w, native_h = 1664.88, 503.03998
page_w, page_h = 710.4, 203.28
framed_w = native_h * page_w / page_h
left = -(framed_w - native_w) / 2
for old, new in [
    ('width="1664.88pt"', 'width="710.4pt"'),
    ('height="503.03998pt"', 'height="203.28pt"'),
    ('viewBox="0 0 1664.88 503.03998"',
     f'viewBox="{left:.10f} 0 {framed_w:.10f} 503.03998"'),
]:
    if old not in raw:
        raise ValueError(f'Unexpected native SVG framing: {old}')
    raw = raw.replace(old, new, 1)

(ROOT / 'figures').mkdir(parents=True, exist_ok=True)
svg = ROOT / 'figures' / 'architecture.svg'
svg.write_text(raw, encoding='utf-8')
drawing = svg2rlg(str(svg))
renderPDF.drawToFile(drawing, str(ROOT / 'figures' / 'architecture.pdf'))

