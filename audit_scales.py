#!/usr/bin/env python3
"""全日健康 · 心理量表评分全面审计
检查:选项/分数对齐、反向题范围、维度定义、极端回答的总分边界
"""
import re, json

src = open('/var/minis/shared/quanri/js/data/assessments.js', encoding='utf-8').read()

# 提取所有量表对象(粗解析:按顶层 key 分隔)
issues = []
checked = 0

# 用 node 求值更可靠:在浏览器侧跑。这里先做静态检查
# 静态检查1:options 与 scores 长度
for m in re.finditer(r"(\w+):\s*\{[^{}]*?(?:options:\s*(\[[^\]]*\]))?[^{}]*?(?:scores:\s*(\[[^\]]*\]))?[^{}]*?\}", src):
    pass  # 太粗糙,改用 node

print("用 node 做动态审计...")
