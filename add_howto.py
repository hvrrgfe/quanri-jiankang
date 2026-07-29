#!/usr/bin/env python3
import re

with open('js/data/exercises.js', 'r', encoding='utf-8') as f:
    content = f.read()

howto_map = {
    'C01': ['抬头挺胸，肩膀后沉，自然摆臂', '步伐比散步稍快，保持稳定节奏', '感觉微喘但能完整说话', '持续至少10分钟为一次有效运动'],
    'C02': ['上半身前倾，肩膀放松，手臂前后摆动', '采用轻松跑速，能说短句即可', '落地轻缓，全脚掌或中脚掌着地', '从5分钟开始，每周增加1-2分钟'],
    'C03': ['站直，像行军一样抬腿', '膝盖抬高到腰部高度，配合摆臂', '保持节奏稳定，每分钟约120步'],
    'C04': ['站直，双脚并拢，双手垂于身体两侧', '跳起时双脚分开略宽于肩，双手过头拍掌', '落地时膝盖微屈缓冲', '回到起始姿势为一次，连续完成'],
    'U01': ['双手撑地略宽于肩，手指向前', '身体从头到脚跟成一条直线，收紧核心', '下降时胸部贴近地面，肘部与身体呈45度', '推起时呼气，下降时吸气'],
    'U02': ['双膝跪地，双手撑地，身体从膝盖到肩成直线', '下降至胸部贴近地面', '推起时呼气', '膝盖下可垫软垫增加舒适度'],
    'U06': ['前臂和脚尖支撑，手肘在肩正下方', '身体从头到脚跟成一条直线', '收紧核心，不要塌腰或撅臀', '保持30秒，自然呼吸'],
    'L01': ['双脚与肩同宽，脚尖微微向外', '臀部后坐，像要坐在椅子上', '下蹲至大腿与地面平行或略低', '膝盖不超过脚尖，保持胸部挺起', '起身时收紧臀部'],
    'L03': ['仰卧，双膝弯曲，双脚平放与肩同宽', '手臂放身体两侧，掌心向下', '收紧臀部和核心，将臀部向上顶起', '至身体从肩到膝成直线，保持2秒', '缓慢放下回到起始位置'],
    'L05': ['背靠墙站立，双脚前移约一步距离', '沿墙滑下至大腿与地面平行', '膝盖不超过脚尖，背部贴墙', '保持30秒，自然呼吸'],
    'A01': ['仰卧，双膝弯曲，双脚平放', '双手放胸前或轻触耳侧', '用腹肌抬起上背部，下背部始终贴地', '在顶部稍作停顿，缓慢放下'],
    'A03': ['四足跪姿，双手在肩正下方，双膝在髋正下方', '收紧核心保持背部平直', '同时伸展右臂和左腿，与身体成直线', '保持2秒后缓慢收回', '换左臂和右腿重复'],
    'S03': ['四足跪姿，双手在肩正下方', '吸气时抬头塌腰（牛式）', '呼气时低头弓背（猫式）', '动作配合呼吸，缓慢流畅', '重复5-8次'],
    'S01': ['坐姿或站姿，肩膀放松下沉', '右手放头左侧，轻轻拉向右侧肩膀', '保持15-30秒，感受左侧颈部拉伸', '换另一侧重复'],
    'M01': ['坐姿，双肩放松', '双肩用力上耸至耳部高度', '保持2秒，感受斜方肌收缩', '缓慢放下完全放松'],
    'M04': ['坐姿，腰背挺直', '双手扶膝盖或椅子扶手', '身体缓慢转向左侧，看向左后方', '保持5秒后回正，换右侧'],
}

# Add howTo to each exercise
for ex_id, steps in howto_map.items():
    # Find the exercise pattern: id: 'C01', ... },
    # Look for the closing }, of this exercise
    pattern = f"id: '{ex_id}'"
    idx = content.find(pattern)
    if idx < 0:
        print(f"NOT FOUND: {ex_id}")
        continue

    # Find the closing }, of this exercise object
    # The object ends with  }, (followed by newline or next entry)
    close_idx = content.find('\n    },', idx)
    if close_idx < 0:
        print(f"NO CLOSING for: {ex_id}")
        continue

    # Check if howTo already exists
    if 'howTo' in content[idx:close_idx]:
        print(f"SKIP (already has howTo): {ex_id}")
        continue

    # Format the steps as a JS array
    steps_js = ",\n      howTo: [" + ", ".join(f"'{s}'" for s in steps) + "]"

    # Insert before the closing },
    content = content[:close_idx] + steps_js + content[close_idx:]
    print(f"ADDED howTo: {ex_id}")

with open('js/data/exercises.js', 'w', encoding='utf-8') as f:
    f.write(content)
print(f"\nDone! Modified {len(howto_map)} exercises")
