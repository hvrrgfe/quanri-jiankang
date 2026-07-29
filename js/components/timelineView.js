// ===== 时间线视图 =====
// 全日健康核心UI — 按设计规范重做

const TimelineView = {
  show() {
    const p = Store.getProfile();
    if (!p) { Helpers.toast('请先设置档案'); return; }

    const cards = TimelineEngine.generate(p);
    const progress = TimelineEngine.calculateProgress(cards);
    const h = new Date().getHours();
    const greet = h < 12 ? '早上好' : h < 18 ? '下午好' : '晚上好';
    const sections = this._group(cards);
    const el = document.getElementById('main-content');

    el.innerHTML = `
<div style="padding:0 4px">
  <!-- 头部 -->
  <div style="margin-bottom:20px">
    <div style="font-size:28px;font-weight:700;color:var(--text);margin-bottom:2px">${greet}</div>
    <div style="font-size:13px;color:var(--text-soft);margin-bottom:12px">
      今天 ${Helpers.formatDate(new Date(),'MM月DD日')} ${['周日','周一','周二','周三','周四','周五','周六'][new Date().getDay()]}
    </div>
    <!-- 进度条 -->
    <div style="height:4px;background:var(--line);border-radius:2px;overflow:hidden">
      <div style="height:100%;width:${progress}%;background:#7A9A6E;border-radius:2px;transition:width 0.5s"></div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-hint);margin-top:2px">
      <span>今日完成</span>
      <span>${progress}%</span>
    </div>
  </div>

  <!-- 卡片流 -->
  <div>${sections.map(s => this._sec(s)).join('')}</div>
</div>
    `;
  },

  _group(cards) {
    const r = [];
    const defs = {
      morning:    { label: '早晨', range: [5,9] },
      am:         { label: '上午', range: [9,12] },
      noon:       { label: '中午', range: [12,14] },
      pm:         { label: '下午', range: [14,18] },
      evening:    { label: '晚间', range: [18,21] },
      night:      { label: '睡前', range: [21,5] },
    };
    Object.entries(defs).forEach(([k, v]) => {
      const [s, e] = v.range;
      const cc = cards.filter(c => {
        const h = parseInt(c.time.split(':')[0]);
        return e > s ? (h >= s && h < e) : (h >= s || h < e);
      });
      if (cc.length) r.push({ label: v.label, cards: cc });
    });
    return r;
  },

  _sec(s) {
    return `
<div style="margin-bottom:16px">
  <div style="font-size:11px;font-weight:600;color:var(--text-hint);letter-spacing:0.5px;margin-bottom:6px;padding-left:2px">${s.label}</div>
  ${s.cards.map(c => this._card(c)).join('')}
</div>`;
  },

  _card(c) {
    const colors = { diet:'#C49A6C', exercise:'#E88A6A', posture:'#D4A056', sleep:'#B8A9C4', mental:'#8EA9C4', plan:'#7A9A6E', base:'#B0B0B0' };
    const co = colors[c.module] || colors.base;
    return `
<div onclick="TimelineView._do('${c.id}')" style="display:flex;align-items:center;gap:10px;padding:12px 14px;margin-bottom:6px;background:#FFFCF8;border-radius:16px;border:1px solid #EFE8E0;cursor:pointer;transition:all 0.15s">
  <div style="width:3px;height:32px;border-radius:2px;background:${co};flex-shrink:0"></div>
  <div style="flex:1;min-width:0">
    <div style="font-size:15px;font-weight:500;color:#3D352C">${c.label}</div>
    ${c.desc ? `<div style="font-size:12px;color:#7A6F64;margin-top:1px">${c.desc}</div>` : ''}
  </div>
  <div style="font-size:12px;color:#B0A69B;white-space:nowrap">${c.time}</div>
</div>`;
  },

  _do(id) {
    Helpers.toast('功能开发中: ' + id);
  },
};
