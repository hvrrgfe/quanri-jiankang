// ===== 生涯规划（框框 / 取景框看世界）=====

const CareerView = {
  show() {
    const el = document.getElementById('main-content');
    const cp = PlanDB.careerPlanning;
    const gm = PlanDB.goalManagement;

    el.innerHTML = `
<div style="padding:0 4px">
  <div style="font-size:22px;font-weight:700;margin-bottom:4px">生涯规划</div>
  <div style="font-size:12px;color:var(--text-soft);margin-bottom:16px">从目标到行动 · 框框的B站大学</div>

  <!-- 核心理念 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light)">
    <div style="font-size:14px;font-weight:600;margin-bottom:6px">迷茫的原因</div>
    <div style="font-size:13px;color:var(--text-soft);line-height:1.7">${cp.whyNoGoal}</div>
  </div>

  <!-- 信息渠道 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light)">
    <div style="font-size:14px;font-weight:600;margin-bottom:8px">打破信息差</div>
    ${cp.infoChannels.map(c => `
    <div style="display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-bottom:1px solid var(--line-light)">
      <div style="width:20px;height:20px;border-radius:50%;background:var(--brand-bg);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;color:var(--brand);flex-shrink:0">${c.rank}</div>
      <div style="flex:1">
        <div style="font-size:13px;font-weight:500">${c.method}</div>
        <div style="font-size:11px;color:var(--text-hint)">${c.desc}</div>
      </div>
    </div>`).join('')}
  </div>

  <!-- 核心方法 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light)">
    <div style="font-size:14px;font-weight:600;margin-bottom:6px">规划原则</div>
    <div style="font-size:13px;color:var(--text-soft);line-height:1.7">${cp.principle}</div>
  </div>

  <!-- 校园活动性价比 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light)">
    <div style="font-size:14px;font-weight:600;margin-bottom:8px">校园活动性价比</div>
    ${cp.campusActivities.map(a => `
    <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--line-light);font-size:13px">
      <span>${a.name}</span>
      <span style="color:${a.importance === '最重要' ? 'var(--green)' : 'var(--text-soft)'}">${a.importance}</span>
    </div>
    <div style="font-size:11px;color:var(--text-hint);padding:0 0 4px 0">${a.note}</div>`).join('')}
  </div>

  <!-- 心态 -->
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light)">
    <div style="font-size:14px;font-weight:600;margin-bottom:8px">心态建议</div>
    ${cp.mindset.map(m => `<div style="font-size:13px;color:var(--text-soft);padding:3px 0">· ${m}</div>`).join('')}
  </div>

  <!-- 目标管理 -->
  <div style="font-size:14px;font-weight:600;margin-bottom:8px">目标管理</div>
  <div style="background:var(--card);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light)">
    <div style="font-size:13px;line-height:1.8">
      <div style="margin-bottom:6px"><strong>OKR：</strong>${gm.okr}</div>
      <div style="margin-bottom:6px"><strong>WBS：</strong>${gm.wbs}</div>
      <div style="margin-bottom:6px"><strong>关键路径：</strong>${gm.criticalPath}</div>
      <div><strong>反馈闭环：</strong>${gm.feedbackLoop}</div>
    </div>
  </div>

  <!-- 行动建议 -->
  <div style="background:var(--brand-bg);border-radius:16px;padding:14px;margin-bottom:12px;border:1px solid var(--line-light)">
    <div style="font-size:13px;font-weight:600;margin-bottom:4px">现在就做</div>
    <div style="font-size:12px;color:var(--text-soft)">选一个方向 → 找该行业3个人做信息访谈 → 设定1个OKR → 拆成WBS → 开始执行</div>
  </div>
</div>`;
  },
};
