#!/usr/bin/env python3
"""生成知程 App 图标(科学蓝 + 靶心)"""
from PIL import Image, ImageDraw

BLUE = (76, 111, 255)   # #4C6FFF
DARK = (59, 86, 217)    # #3B56D9

def make_icon(size, filename):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    radius = int(size * 0.22)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=DARK)
    # 渐变模拟:叠加半透明蓝色层
    overlay = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=BLUE)
    mask = Image.new('L', (size, size), 0)
    md = ImageDraw.Draw(mask)
    md.rounded_rectangle([0, 0, size - 1, size - 1], radius=radius, fill=160)
    img = Image.composite(overlay, img, mask)
    d = ImageDraw.Draw(img)
    # 靶心:三个圆环 + 中心点
    cx = cy = size / 2
    lw = max(2, int(size * 0.045))
    d.ellipse([cx - size*0.34, cy - size*0.34, cx + size*0.34, cy + size*0.34], outline='white', width=lw)
    d.ellipse([cx - size*0.22, cy - size*0.22, cx + size*0.22, cy + size*0.22], outline='white', width=lw)
    d.ellipse([cx - size*0.09, cy - size*0.09, cx + size*0.09, cy + size*0.09], fill='white')
    img.save(filename, 'PNG')
    print(f'{filename} {size}x{size} OK')

make_icon(180, 'assets/app-icon-180.png')
make_icon(192, 'assets/app-icon-192.png')
make_icon(512, 'assets/app-icon-512.png')
