// ===== 运动体态（完整版）=====

const FitnessView = {
  show() {
    const p = Store.getProfile();
    if (!p) { Helpers.toast('请先设置档案'); return; }

    const hr = ExerciseRx.heartRateZones(p.age);
    const el = document.getElementById('main-content');

    // AI周计划（手动生成，有缓存时直接显示）
    let aiHtml = '';
    if (Store.getApiKey()) {
      const today = Helpers.formatDate(new Date(), 'YYYY-MM-DD');
      const cached = Store.get('aiExercisePlan', {});
      if (cached.date === today && cached.weekPlan) {
        aiHtml = this._renderAIPlan(cached.weekPlan, cached.planName, cached.planReason) +
          '<div style="margin-top:6px;text-align:right"><button class="btn btn-soft btn-sm" onclick="FitnessView._regenAI()" style="font-size:11px">重新生成</button></div>';
      } else {
        aiHtml = '<div style="text-align:center;padding:20px"><button class="btn btn-primary btn-sm" onclick="FitnessView._generatePlan()">生成AI运动计划</button></div>';
      }
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
  ${Store.getApiKey() ? '<div id="ai-plan-container">' + aiHtml + '</div><div style="margin-bottom:8px;text-align:right"><button class="btn btn-soft btn-sm" onclick="FitnessView._regenAI()" style="font-size:11px">重新生成</button></div>' : ''}

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

  <!-- 快速开始 -->
  <div style="margin-top:16px">
    <div style="font-size:15px;font-weight:600;margin-bottom:8px">快速开始</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
      ${[
        { label: '拉伸', action: 'stretch' },
        { label: '微运动', action: 'micro' },
        { label: '有氧', action: 'cardio' },
        { label: '力量', action: 'strength' },
      ].map(b => `
      <div onclick="FitnessView._quick('${b.action}')" style="background:var(--card);border-radius:12px;padding:14px;text-align:center;border:1px solid var(--line-light);cursor:pointer;font-size:13px;font-weight:500">${b.label}</div>`).join('')}
    </div>
  </div>
</div>`;
  },

  _renderAIPlan(weekPlan, planName, planReason) {
    const nameHtml = (planName || planReason) ? '<div style="display:flex;align-items:center;gap:4px;margin-bottom:4px">' +
      (planName ? '<span style="font-size:15px;font-weight:700">' + planName + '</span>' : '') +
      (planReason ? '<span style="font-size:12px;color:var(--text-soft)"> · ' + planReason + '</span>' : '') +
    '</div>' : '';
    return nameHtml +
      '<div style="font-size:14px;font-weight:600;margin-bottom:8px">AI 周计划</div>' +
      weekPlan.map(d => '<div style="background:var(--card);border-radius:12px;padding:10px;margin-bottom:4px;border:1px solid var(--line-light)">' +
        '<div style="font-size:13px;font-weight:600;color:var(--brand);margin-bottom:4px">' + d.day +
        (d.focus ? ' <span style="font-size:11px;color:var(--text-soft);font-weight:400">' + d.focus + '</span>' : '') +
        '</div>' +
        (d.items || []).map(i => '<div style="font-size:12px;color:var(--text-soft);padding:2px 0">' +
          '<span style="font-weight:500;color:var(--text)">' + i.name + '</span>' +
          (i.sets ? ' ' + i.sets + '×' + (i.reps || '') : '') +
          (i.duration ? ' ' + i.duration + 'min' : '') +
          (i.rpe ? ' RPE' + i.rpe : '') +
          (i.rest ? ' 休' + i.rest + 's' : '') +
          (i.note ? ' · ' + i.note : '') +
          '</div>'
        ).join('') +
        '</div>'
      ).join('');
  },

  _generatePlan() {
    const p = Store.getProfile();
    if (!p) return;
    const container = document.getElementById('ai-plan-container');
    if (container) container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-soft);font-size:13px">AI 生成中...</div>';
    const today = Helpers.formatDate(new Date(), 'YYYY-MM-DD');
    AIHealth.generate('exercise', p).then(result => {
      const c = document.getElementById('ai-plan-container');
      if (c && result && result.weekPlan) {
        Store.set('aiExercisePlan', { date: today, weekPlan: result.weekPlan, planName: result.planName, planReason: result.planReason });
        c.innerHTML = this._renderAIPlan(result.weekPlan, result.planName, result.planReason) +
          '<div style="margin-top:6px;text-align:right"><button class="btn btn-soft btn-sm" onclick="FitnessView._regenAI()" style="font-size:11px">重新生成</button></div>';
      } else if (c) {
        c.innerHTML = '<div style="text-align:center;padding:20px"><button class="btn btn-primary btn-sm" onclick="FitnessView._generatePlan()">生成AI运动计划</button></div>';
      }
    });
  },

  _regenAI() {
    Store.remove('aiExercisePlan');
    this._generatePlan();
  },

  _quick(type) {
    const pools = {
      stretch: ExerciseDB.stretch.slice(0, 3),
      micro: ExerciseDB.micro.slice(0, 3),
      cardio: ExerciseDB.cardio.filter(c => c.duration <= 15).slice(0, 3),
      strength: [...ExerciseDB.upperBody.slice(0,2), ...ExerciseDB.lowerBody.slice(0,2)],
    };
    const items = pools[type] || [];
    if (!items.length) { Helpers.toast('暂无推荐'); return; }
    const labels = { stretch:'拉伸', micro:'微运动', cardio:'有氧', strength:'力量' };
    const html = items.map(i =>
      '<div style="display:flex;justify-content:space-between;padding:8px 10px;margin-bottom:4px;background:var(--brand-bg);border-radius:8px;font-size:13px">' +
      '<span>' + i.name + '</span>' +
      '<span style="color:var(--text-soft)">' + (i.duration ? i.duration+i.unit : (i.reps||'')+i.unit) + '</span></div>'
    ).join('');
    Helpers.openModal(
      '<div style="font-size:18px;font-weight:600;margin-bottom:8px">' + (labels[type]||type) + '</div>' +
      html +
      '<div style="text-align:center;margin-top:8px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">完成</button></div>'
    );
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
