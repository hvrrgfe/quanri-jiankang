// ===== 运动计划视图 =====

const ExerciseView = {
  show() {
    const p = Store.getProfile();
    if (!p) { Helpers.toast('请先设置档案'); App.startWizard(); return; }

    const rx = ExerciseRx.generatePrescription(p);
    const hr = rx.hr;
    const el = document.getElementById('main-content');

    const planKey = p.exerciseWillingness || 'minimal';
    const plan = ExerciseDB.plans[planKey];

    // 尝试AI完整方案
    let aiPlan = null;
    if (Store.getApiKey()) {
      AIHealth.generate('exercise', p).then(result => {
        if (result && result.weekPlan) {
          const container = document.getElementById('ai-plan-container');
          if (container) {
            container.innerHTML = result.weekPlan.map(d =>
              '<div style="background:var(--card);border-radius:12px;padding:12px;margin-bottom:6px;border:1px solid var(--line-light)">' +
              '<div style="font-size:13px;font-weight:600;color:var(--brand);margin-bottom:4px">' + d.day + '</div>' +
              (d.items || []).map(i => '<div style="font-size:12px;color:var(--text-soft);padding:2px 0">' + i.name + ' ' + i.duration + 'min</div>').join('') +
              '</div>'
            ).join('');
          }
        }
      });
    }

    el.innerHTML = `
<div style="padding:0 4px">
  <div style="font-size:22px;font-weight:700;margin-bottom:2px">运动</div>
  <div style="font-size:13px;color:var(--text-soft);margin-bottom:12px">${rx.plans.aerobic ? rx.plans.aerobic.targetHR || '' : ''}</div>
  ${Store.getApiKey() ? '<div id="ai-plan-container"><div style="color:var(--text-soft);font-size:13px">AI 生成计划中...</div></div>' : ''}

  <!-- 心率分区 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light)">
    <div style="font-size:14px;font-weight:600;margin-bottom:8px">心率分区</div>
    ${['warmup','fatBurn','aerobic','anaerobic','vo2max'].map(k => {
      const z = hr.zones[k];
      return `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:12px;border-bottom:1px solid var(--line-light);font-size:12px">
        <span style="color:var(--text-soft)">${z.label}</span>
        <span>${z.low}-${z.high} <span style="color:var(--text-hint)">次/分</span></span>
        <span style="color:var(--text-hint)">RPE ${z.rpe}</span>
      </div>`;
    }).join('')}
  </div>

  <!-- 周计划 -->
  ${plan && plan.weekly ? `
  <div style="font-size:14px;font-weight:600;margin-bottom:8px">本周计划</div>
  ${plan.weekly.map(d => `
  <div style="background:var(--card);border-radius:12px;padding:12px;margin-bottom:6px;border:1px solid var(--line-light)">
    <div style="font-size:13px;font-weight:600;color:var(--brand);margin-bottom:4px">${d.day}</div>
    ${d.items.map(i => `<div style="font-size:12px;color:var(--text-soft);padding:2px 0">${this._itemLabel(i)}</div>`).join('')}
  </div>`).join('')}
  ` : `
  <div style="background:var(--brand-bg);border-radius:16px;padding:16px;text-align:center;font-size:13px;color:var(--text-soft)">
    没有固定计划<br>有灵感的时候随时动一下
  </div>`}

  <!-- 动作推荐 -->
  <div style="font-size:14px;font-weight:600;margin:12px 0 8px">快速开始</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
    ${[
      { label: '拉伸', icon: 'sun', action: 'stretch' },
      { label: '微运动', icon: 'clock', action: 'micro' },
      { label: '有氧', icon: 'heartRate', action: 'cardio' },
      { label: '力量', icon: 'heart', action: 'strength' },
    ].map(b => `
    <div onclick="ExerciseView._quick('${b.action}')" style="background:var(--card);border-radius:12px;padding:14px;text-align:center;border:1px solid var(--line-light);cursor:pointer;font-size:13px;font-weight:500">${b.label}</div>`).join('')}
  </div>
</div>`;
  },

  _itemLabel(i) {
    const map = { cardio: '有氧', strength: '力量', stretch: '拉伸', micro: '微运动' };
    return (map[i.type] || i.type) + ' ' + (i.duration ? i.duration + 'min' : (i.ids||[]).length + '组');
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
    const html = items.map(i =>
      '<div style="display:flex;justify-content:space-between;padding:8px 10px;margin-bottom:4px;background:var(--brand-bg);border-radius:8px;font-size:13px">' +
      '<span>' + i.name + '</span>' +
      '<span style="color:var(--text-soft)">' + (i.duration ? i.duration+i.unit : i.reps+i.unit) + '</span></div>'
    ).join('');
    Helpers.openModal(
      '<div style="font-size:18px;font-weight:600;margin-bottom:8px">' + {stretch:'拉伸',micro:'微运动',cardio:'有氧',strength:'力量'}[type] + '</div>' +
      html +
      '<div style="text-align:center;margin-top:8px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">完成</button></div>'
    );
  },
};
