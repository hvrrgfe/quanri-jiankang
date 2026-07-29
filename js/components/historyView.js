// ===== 历史记录 =====
const HistoryView = {
  show() {
    const feedback = Store.getFeedback();
    const el = document.getElementById('main-content');

    // 按日期分组
    const byDate = {};
    feedback.forEach(f => {
      const d = f.date || new Date(f.timestamp).toISOString().split('T')[0];
      if (!byDate[d]) byDate[d] = [];
      byDate[d].push(f);
    });
    const sortedDates = Object.keys(byDate).sort().reverse();

    el.innerHTML = `
      <div class="page-hdr"><h2>📜 饮食历史</h2><p>反馈记录 · ${feedback.length}条</p></div>
      ${!feedback.length ? '<div class="empty"><span>📜</span><h3>还没有记录</h3><p>吃完饭后给菜品打分，记录会出现在这里</p></div>' : ''}
      ${sortedDates.map(date => `
        <div class="meal-card" style="margin-bottom:6px">
          <div style="font-weight:600;font-size:13px;margin-bottom:4px">${date}</div>
          ${byDate[date].map(f => `
            <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px;border-bottom:1px dashed var(--line-light)">
              <span>${f.recipeName||'未知'}</span>
              <span>${f.rating === 'good' ? '😋' : f.rating === 'ok' ? '😐' : '😣'} ${f.reasons?.length ? '· '+f.reasons.slice(0,2).join(' ') : ''}</span>
            </div>`).join('')}
        </div>`).join('')}
      <div style="text-align:center;margin-top:12px"><button class="btn btn-soft btn-sm" onclick="App.navigate('profile')">← 返回</button></div>
    `;
  },
};
