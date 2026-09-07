"""Wrap the original FLAME bitmap cells in a browser-native outline font."""
import json
from pathlib import Path
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont
root=Path(__file__).resolve().parents[2]
patterns=json.loads((Path(__file__).parent/'flm1-glyphs.json').read_text())
names={ch:'uni%04X'%ord(ch) for ch in patterns}
order=['.notdef','space']+list(names.values())
glyphs={};metrics={}
for name in ['.notdef','space']:
    glyphs[name]=TTGlyphPen(None).glyph();metrics[name]=(375,0)
for ch,rows in patterns.items():
    pen=TTGlyphPen(None)
    for row,line in enumerate(rows):
        for col,cell in enumerate(line):
            if cell!='1':continue
            x=col*125;y=(6-row)*125
            pen.moveTo((x,y));pen.lineTo((x,y+125));pen.lineTo((x+125,y+125));pen.lineTo((x+125,y));pen.closePath()
    name=names[ch];glyphs[name]=pen.glyph();metrics[name]=(750,0)
cmap={ord(ch):name for ch,name in names.items()};cmap[32]='space';cmap[160]='space'
for ch in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ':cmap[ord(ch.lower())]=names[ch]
for code,ch in {8211:'-',8212:'-',8216:"'",8217:"'",8220:'"',8221:'"'}.items():cmap[code]=names[ch]
fb=FontBuilder(1000,isTTF=True);fb.setupGlyphOrder(order);fb.setupCharacterMap(cmap);fb.setupGlyf(glyphs);fb.setupHorizontalMetrics(metrics);fb.setupHorizontalHeader(ascent=875,descent=-125)
fb.setupNameTable({'familyName':'FLM1 Pixel 5x7','styleName':'Regular','uniqueFontIdentifier':'FLM1Pixel5x7-Joe-Web-1','fullName':'FLM1 Pixel 5x7','psName':'FLM1Pixel5x7','version':'Version 1.0'})
fb.setupOS2(sTypoAscender=875,sTypoDescender=-125,sTypoLineGap=0,usWinAscent=875,usWinDescent=125);fb.setupPost();fb.setupMaxp()
output=root/'public/fonts/flm1/FLM1Pixel5x7.woff2';fb.font.flavor='woff2';fb.save(output)
font=TTFont(output)
assert all(font.getBestCmap()[ord(c)]==names[c.upper()] for c in 'Joe')
assert len(font.getGlyphOrder())==len(patterns)+2
for ch,rows in patterns.items():
    assert font['glyf'][names[ch]].numberOfContours==sum(row.count('1') for row in rows)
print(f'Verified {len(patterns)} original glyphs and {len(cmap)} character routes: {output.stat().st_size} bytes')
