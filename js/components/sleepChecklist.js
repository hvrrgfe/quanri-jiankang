// ===== 睡前准备清单 =====

const SleepChecklist = {
  show() {
    const items = SleepDB.hygieneChecklist;
    const allItems = [...items.evening, ...items.environment];
    const saved = Store.get('sleepChecklist', {});
    const today = Helpers.formatDate(new Date(), 'YYYY-MM-DD');
    const doneSet = new Set(saved[today] || []);

    const html = allItems.map(item => {
      const checked = doneSet.has(item.item);
      return `
<div onclick="SleepChecklist._toggle('${item.item.replace(/'/g, "\\'")}')" style="display:flex;align-items:center;gap:10px;padding:10px 12px;margin-bottom:4px;background:var(--card);border-radius:12px;border:1px solid var(--line-light);cursor:pointer">
  <div style="width:20px;height:20px;border-radius:50%;border:2px solid ${checked ? 'var(--green)' : 'var(--line)'};background:${checked ? 'var(--green)' : 'transparent'};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px;color:white">${checked ? '&#10003;' : ''}</div>
  <div style="flex:1">
    <div style="font-size:14px;color:${checked ? 'var(--text-soft)' : 'var(--text)'}">${item.item}</div>
    <div style="font-size:11px;color:var(--text-hint);margin-top:1px">${item.why || ''}</div>
  </div>
</div>`;
    }).join('');

    const doneCount = doneSet.size;
    const total = allItems.length;
    const pct = Math.round(doneCount / total * 100);

    Helpers.openModal(`
<div style="width:300px">
  <div style="font-size:18px;font-weight:600;margin-bottom:2px">睡前准备</div>
  <div style="font-size:12px;color:var(--text-soft);margin-bottom:12px">${doneCount}/${total} · ${pct}%</div>
  <div style="margin-bottom:12px">
    <div style="height:4px;background:var(--line);border-radius:2px;overflow:hidden">
      <div style="height:100%;width:${pct}%;background:var(--purple);border-radius:2px;transition:width 0.5s"></div>
    </div>
  </div>
  ${html}
  <div style="text-align:center;margin-top:12px">
    <button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">关闭</button>
  </div>
</div>
    `);
  },

  _toggle(item) {
    const saved = Store.get('sleepChecklist', {});
    const today = Helpers.formatDate(new Date(), 'YYYY-MM-DD');
    if (!saved[today]) saved[today] = [];
    const idx = saved[today].indexOf(item);
    if (idx >= 0) saved[today].splice(idx, 1);
    else saved[today].push(item);
    Store.set('sleepChecklist', saved);
    this.show();
  },
};
