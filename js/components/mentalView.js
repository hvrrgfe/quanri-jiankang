// ===== 心理健康视图 =====

const MentalView = {
  show() {
    const p = Store.getProfile();
    if (!p) { Helpers.toast('请先设置档案'); return; }

    const el = document.getElementById('main-content');
    el.innerHTML = `
<div style="padding:0 4px">
  <div style="font-size:22px;font-weight:700;margin-bottom:16px">心理</div>

  <div style="display:grid;gap:8px;margin-bottom:16px">
    ${[
      { icon: 'heart', label: '今日意图', desc: '选一个词作为今天的指引', action: 'TimelineView._showIntention()', color: '#8EA9C4' },
      { icon: 'info', label: '呼吸练习', desc: '4-7-8呼吸法 · 快速平静', action: "BreathingGuide.show('B03')", color: '#B8A9C4' },
      { icon: 'star', label: '感恩三秒', desc: '在心里想一件好事', action: 'TimelineView._showGratitude()', color: '#C49A6C' },
      { icon: 'heart', label: '今日回顾', desc: '睡前花一分钟回顾一天', action: 'TimelineView._showReview()', color: '#7A9A6E' },
    ].map(c => `
    <div onclick="${c.action}" style="background:var(--card);border-radius:16px;padding:14px;border:1px solid var(--line-light);cursor:pointer;display:flex;align-items:center;gap:10px">
      <div style="width:4px;height:32px;border-radius:2px;background:${c.color};flex-shrink:0"></div>
      <div style="flex:1">
        <div style="font-size:14px;font-weight:500">${c.label}</div>
        <div style="font-size:12px;color:var(--text-soft);margin-top:1px">${c.desc}</div>
      </div>
    </div>`).join('')}
  </div>

  <!-- CBT 认知扭曲 -->
  <div style="font-size:14px;font-weight:600;margin-bottom:8px">认知小工具</div>
  <div style="background:var(--card);border-radius:16px;padding:14px;border:1px solid var(--line-light)">
    ${MentalHealthDB.cbtBasics.cognitiveDistortions.slice(0, 4).map(d => `
    <div style="padding:6px 0;border-bottom:1px solid var(--line-light);font-size:13px">
      <div style="font-weight:500">${d.name}</div>
      <div style="color:var(--text-soft);font-size:12px;margin-top:1px">${d.antidote}</div>
    </div>`).join('')}
  </div>

  <div style="margin-top:12px;font-size:12px;color:var(--text-hint);padding:8px;text-align:center">
    所有数据仅存本地 · 不分析不上传
  </div>
</div>`;
  },
};
