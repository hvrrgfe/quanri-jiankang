// ===== 时间线视图 =====
// 全日健康的核心UI：从早到晚的卡片流

const TimelineView = {
  show() {
    const profile = Store.getProfile();
    if (!profile) { Helpers.toast('请先设置档案'); return; }
    if (!profile.fullProfile) { Helpers.toast('请更新档案以使用完整功能'); App.startWizard(); return; }

    const cards = TimelineEngine.generate(profile);
    const progress = TimelineEngine.calculateProgress(cards);
    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? '🌅 早上好' : hour < 18 ? '🌤 下午好' : '🌙 晚上好';

    // 按时间段分组
    const sections = this._groupByTime(cards);
    const el = document.getElementById('main-content');

    el.innerHTML = `
      <div style="margin-bottom:16px">
        <div style="font-size:22px;font-weight:700;color:var(--text);margin-bottom:2px">${greeting}</div>
        <div style="font-size:13px;color:var(--text-soft)">今天 · ${Helpers.formatDate(new Date(), 'MM月DD日')} ${['周日','周一','周二','周三','周四','周五','周六'][new Date().getDay()]}</div>
        <div style="margin-top:8px;height:4px;background:var(--line);border-radius:2px;overflow:hidden">
          <div style="height:100%;width:${progress}%;background:var(--accent);border-radius:2px;transition:width 0.5s"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-hint);margin-top:2px">
          <span>今日完成度</span>
          <span>${progress}%</span>
        </div>
      </div>

      <div id="timeline-cards">
        ${sections.map(s => this._renderSection(s)).join('')}
      </div>
    `;
  },

  _groupByTime(cards) {
    const groups = [];
    let current = null;
    const labels = { morning: '🌅 早晨', morningWork: '💼 上午', noon: '🌤 中午', afternoonWork: '💼 下午', evening: '🌙 晚间', bedtime: '🛌 睡前' };
    const ranges = { morning: [5,8], morningWork: [8,12], noon: [12,13], afternoonWork: [13,18], evening: [18,21], bedtime: [21,5] };

    Object.entries(ranges).forEach(([key, [start, end]]) => {
      const sectionCards = cards.filter(c => {
        const h = parseInt(c.time.split(':')[0]);
        if (end > start) return h >= start && h < end;
        return h >= start || h < end; // 跨天（如睡前跨午夜）
      });
      if (sectionCards.length) {
        groups.push({ label: labels[key], cards: sectionCards });
      }
    });
    return groups;
  },

  _renderSection(section) {
    return `
      <div style="margin-bottom:4px">
        <div style="font-size:13px;font-weight:600;color:var(--text-soft);margin-bottom:6px;padding-left:4px">${section.label}</div>
        ${section.cards.map(c => this._renderCard(c)).join('')}
      </div>
    `;
  },

  _renderCard(card) {
    const moduleColors = {
      diet: 'var(--accent)', exercise: '#5A9E8F', posture: '#D4A056',
      sleep: '#7C5CFC', mental: '#E8663A', plan: '#4A90D9', base: 'var(--text-soft)',
    };
    const color = moduleColors[card.module] || 'var(--text-soft)';

    return `
      <div class="timeline-card ${card.done ? 'done' : ''}" style="display:flex;align-items:center;gap:10px;padding:8px 12px;margin-bottom:4px;background:var(--card);border-radius:10px;border:1px solid var(--line-light);cursor:${card.type !== 'info' ? 'pointer' : 'default'}" onclick="${card.type !== 'info' ? `TimelineView._doAction('${card.id}','${card.type}')` : ''}">
        <div style="width:4px;height:28px;border-radius:2px;background:${color};flex-shrink:0"></div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:500;color:var(--text)">${card.label}</div>
          ${card.desc ? `<div style="font-size:11px;color:var(--text-soft)">${card.desc}</div>` : ''}
        </div>
        <div style="font-size:11px;color:var(--text-hint);white-space:nowrap">${card.time}</div>
        <div style="font-size:14px">${card.done ? '✅' : '▶️'}</div>
      </div>
    `;
  },

  _doAction(id, type) {
    Helpers.toast(`${type}: ${id}（功能开发中）`);
  },
};
