// ===== 运动体态（完整版）=====

const FitnessView = {
  show() {
    const p = Store.getProfile();
    if (!p) { Helpers.toast('请先设置档案'); return; }

    const hr = ExerciseRx.heartRateZones(p.age);
    const el = document.getElementById('main-content');

    // 尝试AI生成周计划
    let aiHtml = '';
    if (Store.getApiKey()) {
      aiHtml = '<div id="ai-plan-loading" style="text-align:center;padding:20px;color:var(--text-soft);font-size:13px">AI 生成中...</div>';
      AIHealth.generate('exercise', p).then(result => {
        const container = document.getElementById('ai-plan-container');
        if (container && result && result.weekPlan) {
          container.innerHTML = '<div style="font-size:14px;font-weight:600;margin-bottom:8px">AI 周计划</div>' +
            result.weekPlan.map(d => '<div style="background:var(--card);border-radius:12px;padding:10px;margin-bottom:4px;border:1px solid var(--line-light)">' +
              '<div style="font-size:13px;font-weight:600;color:var(--brand)">' + d.day + '</div>' +
              (d.items || []).map(i => '<div style="font-size:12px;color:var(--text-soft);padding:2px 0">' + i.name + ' ' + (i.duration || '') + 'min</div>').join('') +
              '</div>'
            ).join('');
        } else if (container) {
          container.innerHTML = '';
        }
      });
    }

    el.innerHTML = `
<div style="padding:0 4px">

  <!-- 心率区 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light)">
    <div style="font-size:15px;font-weight:600;margin-bottom:8px">心率参考</div>
    <div style="font-size:12px;color:var(--text-soft);margin-bottom:6px">最大 ${hr.maxHR} · 静息 ${hr.restingHR}</div>
    ${['warmup','fatBurn','aerobic','anaerobic','vo2max'].map(k => {
      const z = hr.zones[k];
      return '<div style="display:flex;justify-content:space-between;padding:2px 0;font-size:12px;color:var(--text-soft)">' +
        '<span>' + z.label + '</span><span>' + z.low + '-' + z.high + '</span></div>';
    }).join('')}
  </div>

  <!-- AI周计划 -->
  ${Store.getApiKey() ? '<div id="ai-plan-container">' + aiHtml + '</div>' : ''}

  <!-- 动作库 -->
  <div style="font-size:15px;font-weight:600;margin-bottom:8px">动作库</div>
  ${this._renderLibrary()}

  <!-- 久坐提醒 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light);margin-top:12px">
    <div style="font-size:15px;font-weight:600;margin-bottom:8px">久坐提醒</div>
    ${PostureDB.sedentaryAlerts.slice(0,5).map(a =>
      '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:13px;color:var(--text-soft)">' +
      '<span style="color:var(--brand);font-weight:500">' + a.afterMin + 'min</span>' + a.action + '</div>'
    ).join('')}
  </div>

  <!-- 坐姿 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;border:1px solid var(--line-light)">
    <div style="font-size:15px;font-weight:600;margin-bottom:8px">正确坐姿</div>
    ${PostureDB.sittingChecklist.map(c =>
      '<div style="padding:3px 0;font-size:13px;color:var(--text-soft)">' + c.item + '</div>'
    ).join('')}
  </div>
</div>`;
  },

  _renderLibrary() {
    const cats = [
      { label: '有氧', items: ExerciseDB.cardio, color: '#E88A6A' },
      { label: '上肢', items: ExerciseDB.upperBody, color: '#C49A6C' },
      { label: '下肢', items: ExerciseDB.lowerBody, color: '#7A9A6E' },
      { label: '核心', items: ExerciseDB.core, color: '#B8A9C4' },
      { label: '拉伸', items: ExerciseDB.stretch, color: '#8EA9C4' },
      { label: '微运动', items: ExerciseDB.micro, color: '#F0D67A' },
    ];

    return cats.map(c => `
<div style="margin-bottom:8px">
  <div onclick="FitnessView._toggleCat('${c.label}')" style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:${c.color};cursor:pointer;padding:4px 0">
    <span id="arrow-${c.label}" style="transition:transform 0.2s">&#9654;</span>
    ${c.label}（${c.items.length}种）
  </div>
  <div id="cat-${c.label}" style="display:none;margin-top:4px">
    ${c.items.slice(0,8).map(i =>
      '<div onclick="FitnessView._showDetail(\'' + c.label + '\',' + c.items.indexOf(i) + ')" style="padding:6px 10px;margin-bottom:2px;background:var(--card);border-radius:8px;border:1px solid var(--line-light);cursor:pointer;font-size:13px;display:flex;justify-content:space-between">' +
      '<span>' + i.name + '</span>' +
      '<span style="color:var(--text-soft)">' + (i.duration ? i.duration + i.unit : i.sets + '组x' + i.reps + i.unit) + '</span></div>'
    ).join('')}
  </div>
</div>`).join('');
  },

  _toggleCat(label) {
    const el = document.getElementById('cat-' + label);
    const arrow = document.getElementById('arrow-' + label);
    if (!el) return;
    const show = el.style.display !== 'block';
    el.style.display = show ? 'block' : 'none';
    if (arrow) arrow.style.transform = show ? 'rotate(90deg)' : '';
  },

  _showDetail(cat, idx) {
    const pools = { '有氧': ExerciseDB.cardio, '上肢': ExerciseDB.upperBody, '下肢': ExerciseDB.lowerBody, '核心': ExerciseDB.core, '拉伸': ExerciseDB.stretch, '微运动': ExerciseDB.micro };
    const items = pools[cat];
    const item = items && items[idx];
    if (!item) return;
    Helpers.openModal(
      '<div style="font-size:18px;font-weight:600;margin-bottom:4px">' + item.name + '</div>' +
      '<div style="font-size:13px;color:var(--text-soft);margin-bottom:10px">' + (item.desc || item.difficulty ? '难度' + (item.difficulty||'') : '') + '</div>' +
      '<div style="font-size:13px;line-height:1.7">' +
      (item.duration ? '时长：' + item.duration + item.unit + '<br>' : '') +
      (item.sets ? '组数：' + item.sets + '组 x ' + item.reps + item.unit + '<br>' : '') +
      (item.target ? '目标：' + item.target.join('/') + '<br>' : '') +
      (item.modifier ? '<br><span style="color:var(--green)">降阶：' + item.modifier + '</span><br>' : '') +
      (item.caution ? '<br><span style="color:var(--red)">注意：' + item.caution + '</span>' : '') +
      '</div>' +
      '<div style="text-align:center;margin-top:10px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">关闭</button></div>'
    );
  },
};
