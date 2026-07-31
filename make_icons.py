#!/usr/bin/env python3
"""生成全日健康 App 图标 PNG(米色圆角 + 白线条健康符号)"""
from PIL import Image, ImageDraw

BRAND = (196, 154, 108)  # #C49A6C

def make_icon(size, filename):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    radius = int(size * 0.22)
    # 圆角矩形背景
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=BRAND)
    # 白色线条:两个竖线 + 两个斜线(健康/生机符号)
    lw = max(2, int(size * 0.045))
    pad = size * 0.21
    top = size * 0.20
    bot = size * 0.80
    cx1 = size * 0.38
    cx2 = size * 0.62
    # 竖线
    d.line([cx1, top, cx1, bot], fill='white', width=lw)
    d.line([cx2, top, cx2, bot], fill='white', width=lw)
    # 上斜线(叶片)
    d.line([cx1 - size*0.06, top + size*0.14, cx1 + size*0.10, top - size*0.04], fill='white', width=lw)
    d.line([cx2 - size*0.10, top - size*0.04, cx2 + size*0.06, top + size*0.14], fill='white', width=lw)
    # 下斜线(根)
    d.line([cx1 - size*0.06, bot - size*0.14, cx1 + size*0.10, bot + size*0.04], fill='white', width=lw)
    d.line([cx2 - size*0.10, bot + size*0.04, cx2 + size*0.06, bot - size*0.14], fill='white', width=lw)
    img.save(filename, 'PNG')
    print(f'{filename} {size}x{size} OK')

make_icon(180, 'assets/app-icon-180.png')
make_icon(192, 'assets/app-icon-192.png')
make_icon(512, 'assets/app-icon-512.png')
