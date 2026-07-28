// ===== 导出与分享 =====
const ExportShare = {
  show() {
    const plan = Store.getWeeklyPlan();
    if (!plan?.days?.length) return Helpers.toast('还没有菜单可导出');

    const el = document.getElementById('main-content');
    el.innerHTML = `
      <div class="page-hdr">
        <h2>📤 导出分享</h2>
        <p>把你的周计划分享出去</p>
      </div>

      <div class="note-card" style="margin-bottom:14px">
        <strong>📋 文本导出</strong>
        <div style="margin-top:8px">
          <textarea id="export-text" style="width:100%;height:200px;font-size:13px;border:1px solid var(--line);border-radius:6px;padding:10px;font-family:monospace" readonly>${this._genText()}</textarea>
        </div>
        <button class="btn btn-primary btn-sm btn-block mt-8" onclick="ExportShare._copy()">📋 复制到剪贴板</button>
      </div>

      <div class="note-card" style="margin-bottom:14px">
        <strong>🛒 采购清单</strong>
        <div style="margin-top:8px">
          <textarea id="export-shopping" style="width:100%;height:120px;font-size:13px;border:1px solid var(--line);border-radius:6px;padding:10px;font-family:monospace" readonly>${this._genShoppingText()}</textarea>
        </div>
        <button class="btn btn-soft btn-sm btn-block mt-8" onclick="ExportShare._copyShopping()">📋 复制清单</button>
      </div>

      <div style="text-align:center;margin-top:8px">
        <button class="btn btn-outline btn-sm" onclick="App.navigate('plan')">← 返回菜单</button>
      </div>
    `;
  },

  _genText() {
    const plan = Store.getWeeklyPlan();
    if (!plan?.days) return '';
    const profile = Store.getProfile();
    const weekStart = plan.days[0]?.date || '';
    const weekEnd = plan.days[plan.days.length-1]?.date || '';
    const s = plan.weeklyStats || {};
    const lines = [
      '🥢 三餐指南 · 本周菜单',
      `📅 ${weekStart} ~ ${weekEnd}`,
      `👤 ${profile?.age || ''}岁 ${profile?.gender === 'male' ? '男' : '女' || ''}`,
      `📊 食材种类：${s.totalIngredientTypes || '—'}种 · 鱼虾${s.fishCount || 0}次`,
      '',
    ];
    plan.days.forEach(day => {
      lines.push(`── ${day.dayOfWeek} ${day.date} ──`);
      ['breakfast','lunch','dinner'].forEach(mt => {
        const m = day.meals?.[mt];
        if (m) lines.push(`  ${mt === 'breakfast' ? '🌅' : mt === 'lunch' ? '☀️' : '🌙'} ${m.name}（⏱${m.cookTime}min）`);
      });
      if (day.ingredientCount) lines.push(`  🥗 食材 ${day.ingredientCount}种`);
      lines.push('');
    });
    lines.push('由 🥢 三餐指南 生成 · 基于《中国居民膳食指南》');
    return lines.join('\n');
  },

  _genShoppingText() {
    const list = Store.getShoppingList();
    if (!list?.categories) return '';
    const lines = ['🛒 采购清单\n'];
    list.categories.forEach(cat => {
      lines.push(cat.name);
      cat.items.forEach(item => {
        lines.push(`  ${item.isPurchased ? '✅' : '⬜'} ${item.name} ${item.displayQty} ¥${item.estimatedPrice||'?'}`);
      });
      lines.push('');
    });
    lines.push(`共计约 ¥${list.totalEstimatedCost}`);
    return lines.join('\n');
  },

  async _copy() {
    const text = document.getElementById('export-text');
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text.value);
      Helpers.toast('已复制到剪贴板 ✓');
    } catch {
      text.select();
      document.execCommand('copy');
      Helpers.toast('已复制 ✓');
    }
  },

  async _copyShopping() {
    const text = document.getElementById('export-shopping');
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text.value);
      Helpers.toast('已复制 ✓');
    } catch {
      text.select();
      document.execCommand('copy');
      Helpers.toast('已复制 ✓');
    }
  },
};
