// ===== 运动体态（合并视图）=====

const FitnessView = {
  show() {
    const p = Store.getProfile();
    if (!p) { Helpers.toast('请先设置档案'); return; }

    const rx = ExerciseRx.generatePrescription(p);
    const hr = rx.hr;
    const el = document.getElementById('main-content');

    el.innerHTML = `
<div style="padding:0 4px">
  <!-- 心率分区 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light)">
    <div style="font-size:15px;font-weight:600;margin-bottom:10px">心率分区</div>
    <div style="font-size:12px;color:var(--text-soft);margin-bottom:8px">最大心率 ${hr.maxHR} 次/分 · 静息 ${hr.restingHR}</div>
    ${['warmup','fatBurn','aerobic','anaerobic','vo2max'].map(k => {
      const z = hr.zones[k];
      return '<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:12px;border-bottom:1px solid var(--line-light)">' +
        '<span style="color:var(--text-soft)">' + z.label + '</span>' +
        '<span>' + z.low + '-' + z.high + '</span>' +
        '<span style="color:var(--text-hint)">RPE ' + z.rpe + '</span></div>';
    }).join('')}
  </div>

  <!-- 快速动作入口 -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
    ${[
      { label: '力量训练', action: 'strength', color: '#C49A6C' },
      { label: '有氧运动', action: 'cardio', color: '#E88A6A' },
      { label: '拉伸放松', action: 'stretch', color: '#7A9A6E' },
      { label: '微运动', action: 'micro', color: '#8EA9C4' },
    ].map(b => '<div onclick="FitnessView._quick(\'' + b.action + '\')" style="background:var(--card);border-radius:14px;padding:14px;text-align:center;border:1px solid var(--line-light);cursor:pointer;font-size:14px;font-weight:600;color:' + b.color + '">' + b.label + '</div>').join('')}
  </div>

  <!-- 体态提醒 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light)">
    <div style="font-size:15px;font-weight:600;margin-bottom:8px">久坐提醒</div>
    ${PostureDB.sedentaryAlerts.slice(0, 5).map(a =>
      '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;font-size:13px;border-bottom:1px solid var(--line-light)">' +
      '<span style="color:var(--brand)">' + a.afterMin + 'min</span>' +
      '<span style="color:var(--text-soft)">' + a.action + '</span></div>'
    ).join('')}
  </div>

  <!-- 坐姿检查 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;border:1px solid var(--line-light)">
    <div style="font-size:15px;font-weight:600;margin-bottom:8px">正确坐姿</div>
    ${PostureDB.sittingChecklist.map(c =>
      '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;font-size:13px;color:var(--text-soft)">' +
      '<span style="color:var(--green)">&check;</span>' + c.item + '</div>'
    ).join('')}
  </div>
</div>`;
  },

  _quick(type) {
    const pools = {
      strength: [...ExerciseDB.upperBody.slice(0,2), ...ExerciseDB.lowerBody.slice(0,2)],
      cardio: ExerciseDB.cardio.filter(c => c.duration <= 15).slice(0, 3),
      stretch: ExerciseDB.stretch.slice(0, 4),
      micro: ExerciseDB.micro.slice(0, 4),
    };
    const items = pools[type] || [];
    if (!items.length) { Helpers.toast('暂无推荐'); return; }
    const labels = { strength:'力量训练', cardio:'有氧运动', stretch:'拉伸放松', micro:'微运动' };
    Helpers.openModal(
      '<div style="font-size:18px;font-weight:600;margin-bottom:8px">' + labels[type] + '</div>' +
      items.map(i => '<div style="display:flex;justify-content:space-between;padding:8px 10px;margin-bottom:4px;background:var(--brand-bg);border-radius:8px;font-size:13px">' +
        '<span>' + i.name + '</span>' +
        '<span style="color:var(--text-soft)">' + (i.duration ? i.duration + i.unit : i.reps + i.unit) + '</span></div>'
      ).join('') +
      '<div style="text-align:center;margin-top:8px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">完成</button></div>'
    );
  },
};
