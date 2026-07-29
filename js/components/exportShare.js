// ===== 导出与分享 =====
const ExportShare = {
  show() {
    const plan = Store.getWeeklyPlan();
    if (!plan?.days?.length) return Helpers.toast('还没有菜单可导出');

    const el = document.getElementById('main-content');
    el.innerHTML = Icons.replace(`
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

      <div class="note-card" style="margin-bottom:14px">
        <strong>📄 导出 PDF</strong>
        <div style="margin-top:8px;font-size:13px;color:var(--text-soft)">
          将本周菜单和采购清单导出为 PDF 文件，方便打印或分享。
        </div>
        <button class="btn btn-primary btn-sm btn-block mt-8" onclick="ExportShare._printPDF()">📄 导出 PDF</button>
      </div>

      <div class="note-card" style="margin-bottom:14px">
        <strong>🔗 分享链接</strong>
        <div style="margin-top:8px;font-size:13px;color:var(--text-soft)">
          生成一个包含本周菜单的独立网页，下载后可发给任何人，无需安装即可查看。
        </div>
        <button class="btn btn-primary btn-sm btn-block mt-8" onclick="ExportShare._exportHTML()">🔗 生成分享页面</button>
      </div>

      <div style="text-align:center;margin-top:8px">
        <button class="btn btn-outline btn-sm" onclick="App.navigate('plan')">← 返回菜单</button>
      </div>
    `);
  },

  _genText() {
    const plan = Store.getWeeklyPlan();
    if (!plan?.days) return '';
    const profile = Store.getProfile();
    const weekStart = plan.days[0]?.date || '';
    const weekEnd = plan.days[plan.days.length-1]?.date || '';
    const s = plan.weeklyStats || {};
    const lines = [
      ' 全日健康 · 本周菜单',
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
    lines.push('由  全日健康 生成 · 基于《中国居民膳食指南》');
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

  _exportHTML() {
    const plan = Store.getWeeklyPlan();
    if (!plan?.days?.length) return Helpers.toast('还没有菜单');
    const profile = Store.getProfile();
    const list = Store.getShoppingList();
    const s = plan.weeklyStats || {};
    const v = plan.validation;

    const mealLabel = { breakfast: '🍳 早餐', lunch: '🥗 午餐', dinner: '🍲 晚餐' };

    // 构建每个日期行
    let daysHTML = '';
    plan.days.forEach(day => {
      daysHTML += `<div class="day"><div class="day-hdr">${day.dayOfWeek} · ${day.date}${day.ingredientCount ? ` <span class="count">🥗 ${day.ingredientCount}种</span>` : ''}</div>`;
      ['breakfast','lunch','dinner'].forEach(mt => {
        const m = day.meals?.[mt];
        if (!m) return;
        daysHTML += `<div class="meal"><span class="mic">${mealLabel[mt]?.slice(0,2) || '🍽️'}</span><span class="mn">${m.name}</span><span class="mt">${m.cookTime}min</span></div>`;
        Object.keys(day.meals||{}).filter(k => k.startsWith(mt + '_side')).forEach(k => {
          daysHTML += `<div class="side">🥬 ${day.meals[k].name} · ${day.meals[k].cookTime}min</div>`;
        });
      });
      daysHTML += '</div>';
    });

    // 采购清单
    let shopHTML = '';
    if (list?.categories?.length) {
      shopHTML = '<div class="sec"><h2>🛒 采购清单</h2>';
      list.categories.forEach(cat => {
        if (!cat.items.length) return;
        shopHTML += `<div class="sc"><div class="sct">${cat.name}</div>`;
        cat.items.forEach(item => {
          shopHTML += `<div class="si"><span>${item.name}</span><span class="sq">${item.displayQty || item.quantity+(item.unit||'g')}</span><span class="sp">¥${item.estimatedPrice||'?'}</span></div>`;
        });
        shopHTML += '</div>';
      });
      shopHTML += `<div class="st">合计约 ¥${list.totalEstimatedCost}</div></div>`;
    }

    // 合规检查
    let checkHTML = '';
    if (v?.stats) {
      const labels = { weekDiversity: '食材种类', darkVegetable: '深色蔬菜', redMeat: '红肉总量', fish: '鱼虾次数' };
      checkHTML = '<div class="checks">';
      Object.entries(v.stats).forEach(([k, st]) => {
        if (!st) return;
        const val = k === 'darkVegetable' ? st.ratioText : (st.count || st.total || '—');
        checkHTML += `<span class="ck ${st.passed !== false ? 'ok' : 'no'}">${labels[k]||k}：${val}</span>`;
      });
      checkHTML += '</div>';
    }

    const fullHTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>全日健康 - 本周菜单</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,"Microsoft YaHei","PingFang SC",sans-serif;background:#F7F3F0;color:#333;padding:20px;max-width:800px;margin:0 auto}
.hdr{text-align:center;padding:30px 0 20px}
.hdr h1{font-size:26px;color:#D4785C;margin-bottom:4px}
.hdr .sub{font-size:13px;color:#999}
.checks{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin:16px 0}
.ck{padding:4px 14px;border-radius:20px;font-size:12px}
.ck.ok{background:#E8F5E9;color:#2E7D32}
.ck.no{background:#FFF3E0;color:#E65100}
.day{background:#fff;border-radius:12px;padding:14px 18px;margin-bottom:12px;box-shadow:0 1px 4px rgba(0,0,0,0.06)}
.day-hdr{font-size:15px;font-weight:600;color:#D4785C;margin-bottom:8px;display:flex;justify-content:space-between}
.count{font-weight:400;font-size:12px;color:#888}
.meal{display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid #f0f0f0;font-size:14px}
.meal:last-child{border-bottom:none}
.mic{width:22px;text-align:center}
.mn{flex:1}
.mt{color:#999;font-size:12px;white-space:nowrap}
.side{font-size:13px;color:#3BA99E;padding:2px 0 2px 30px}
.sec{background:#fff;border-radius:12px;padding:14px 18px;margin-top:16px;box-shadow:0 1px 4px rgba(0,0,0,0.06)}
.sec h2{font-size:16px;color:#D4785C;margin-bottom:10px}
.sc{margin-bottom:10px}
.sct{font-size:13px;font-weight:600;color:#666;margin-bottom:4px}
.si{display:flex;padding:3px 0;font-size:13px;border-bottom:1px dashed #f0f0f0}
.si span:first-child{flex:1}
.sq{color:#888;min-width:60px;text-align:right}
.sp{color:#888;min-width:40px;text-align:right}
.st{font-size:15px;font-weight:600;color:#D4785C;margin-top:8px;text-align:right}
.ftr{text-align:center;padding:20px;font-size:12px;color:#bbb}
.ftr a{color:#D4785C;text-decoration:none}
.badge{display:inline-block;background:#D4785C;color:#fff;padding:2px 12px;border-radius:10px;font-size:11px;margin-top:4px}
@media(prefers-color-scheme:dark){body{background:#1A1A1A;color:#eee}.day,.sec{background:#2D2D2D}.day-hdr{color:#FFB89A}.sct{color:#aaa}.st{color:#FFB89A}.side{color:#5CC4B8}td,th{border-color:#444}}
</style></head>
<body>
<div class="hdr">
  <h1> 全日健康</h1>
  <div class="sub">${plan.days[0]?.date||''} ~ ${plan.days[plan.days.length-1]?.date||''}${profile ? ' · '+profile.age+'岁' : ''}</div>
  <div class="badge">基于《中国居民膳食指南》</div>
</div>
${checkHTML}
${daysHTML}
${shopHTML}
<div class="ftr">
  由 全日健康 生成 · <a href="https://hvrrgfe.github.io/three-meals-app" target="_blank">hvrrgfe.github.io/three-meals-app</a><br>
  打开即用 · 免费 · 无需注册
</div>
</body></html>`;

    // 下载 HTML 文件
    const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `全日健康_${plan.days[0]?.date || '本周'}_菜单.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    Helpers.toast('分享页面已生成 ✓');
  },

  _printPDF() {
    const plan = Store.getWeeklyPlan();
    if (!plan?.days?.length) return Helpers.toast('还没有菜单');
    const profile = Store.getProfile();
    const list = Store.getShoppingList();
    const s = plan.weeklyStats || {};

    let html = `<!DOCTYPE html><html><head><meta charset="utf-8">
    <title>全日健康 - 本周菜单</title>
    <style>
      @page { margin: 1.5cm; size: A4; }
      body { font-family: "Microsoft YaHei", "PingFang SC", sans-serif; color: #333; font-size: 12px; line-height: 1.6; }
      h1 { font-size: 22px; color: #D4785C; margin-bottom: 4px; }
      .meta { color: #888; font-size: 12px; margin-bottom: 20px; }
      .day { background: #FFF5F0; border-radius: 8px; padding: 12px 16px; margin-bottom: 10px; page-break-inside: avoid; }
      .day h2 { font-size: 15px; color: #D4785C; margin: 0 0 6px; }
      .meal { display: flex; gap: 8px; padding: 4px 0; border-bottom: 1px dashed #eee; font-size: 13px; }
      .meal:last-child { border-bottom: none; }
      .meal-icon { width: 20px; text-align: center; }
      .meal-name { flex: 1; }
      .meal-time { color: #999; font-size: 11px; white-space: nowrap; }
      .side { font-size: 12px; color: #3BA99E; padding-left: 28px; }
      .tag { display: inline-block; font-size: 11px; padding: 1px 8px; border-radius: 10px; margin: 2px; }
      .tag-ok { background: #E8F5E9; color: #2E7D32; }
      .tag-warn { background: #FFF3E0; color: #E65100; }
      .stats { display: flex; gap: 12px; flex-wrap: wrap; margin: 12px 0; font-size: 12px; }
      .stats span { background: #F5F5F5; padding: 4px 12px; border-radius: 12px; }
      .shop { margin-top: 24px; page-break-inside: avoid; }
      .shop h3 { font-size: 16px; color: #D4785C; margin-bottom: 8px; }
      .shop-cat { margin-bottom: 10px; }
      .shop-cat-title { font-weight: 600; font-size: 13px; margin-bottom: 4px; color: #555; }
      .shop-item { display: flex; gap: 8px; padding: 2px 0; font-size: 12px; }
      .shop-name { flex: 1; }
      .shop-qty { color: #888; }
      .shop-price { color: #888; min-width: 36px; text-align: right; }
      .total { font-size: 14px; font-weight: 600; color: #D4785C; margin-top: 8px; }
      .footer { margin-top: 24px; font-size: 11px; color: #aaa; text-align: center; border-top: 1px solid #eee; padding-top: 12px; }
      @media print { .no-print { display: none; } }
    </style></head><body>
    <h1> 全日健康</h1>
    <div class="meta">
      ${plan.days[0]?.date || ''} ~ ${plan.days[plan.days.length-1]?.date || ''}
      ${profile ? ' · ' + profile.age + '岁' + (profile.gender === 'male' ? '男' : '女') : ''}
    </div>`;

    // 合规检查摘要
    if (plan.validation) {
      const v = plan.validation;
      const labels = { weekDiversity: '食材种类', darkVegetable: '深色蔬菜', redMeat: '红肉总量', fish: '鱼虾次数' };
      html += '<div class="stats">';
      Object.entries(v.stats || {}).forEach(([k, st]) => {
        if (!st) return;
        const val = k === 'darkVegetable' ? st.ratioText : (st.count || st.total || '—');
        const ok = st.passed !== false;
        html += `<span class="tag ${ok ? 'tag-ok' : 'tag-warn'}">${labels[k] || k}：${val}${ok ? ' ✅' : ' ⚠️'}</span>`;
      });
      html += '</div>';
    }

    // 每日菜单
    plan.days.forEach(day => {
      const date = new Date(day.date);
      const dayLabel = day.dayOfWeek + ' ' + day.date;
      html += `<div class="day"><h2>${dayLabel} ${day.ingredientCount ? '🥗 ' + day.ingredientCount + '种' : ''}</h2>`;
      ['breakfast', 'lunch', 'dinner'].forEach(mt => {
        const m = day.meals?.[mt];
        if (!m) return;
        const labels = { breakfast: '🌅 早餐', lunch: '☀️ 午餐', dinner: '🌙 晚餐' };
        html += `<div class="meal"><span class="meal-icon">${labels[mt]?.slice(0,2) || '🍽️'}</span>`;
        html += `<span class="meal-name">${m.name}</span>`;
        html += `<span class="meal-time">${m.cookTime}min</span></div>`;
        // 配菜
        Object.keys(day.meals||{}).filter(k => k.startsWith(mt + '_side')).forEach(k => {
          const side = day.meals[k];
          html += `<div class="side">🥬 + ${side.name} ${side.cookTime}min</div>`;
        });
      });
      html += '</div>';
    });

    // 采购清单
    if (list?.categories?.length) {
      html += '<div class="shop"><h3>🛒 采购清单</h3>';
      list.categories.forEach(cat => {
        if (!cat.items.length) return;
        html += `<div class="shop-cat"><div class="shop-cat-title">${cat.name}</div>`;
        cat.items.forEach(item => {
          html += `<div class="shop-item"><span class="shop-name">${item.name}</span><span class="shop-qty">${item.displayQty || item.quantity + (item.unit||'g')}</span><span class="shop-price">¥${item.estimatedPrice||'?'}</span></div>`;
        });
        html += '</div>';
      });
      html += `<div class="total">合计约 ¥${list.totalEstimatedCost}</div></div>`;
    }

    html += `<div class="footer">由 全日健康 生成 · hvrrgfe.github.io/three-meals-app · 基于《中国居民膳食指南》</div>`;
    html += '</body></html>';

    // 在新窗口打开并打印
    const win = window.open('', '_blank');
    if (!win) { Helpers.toast('请允许弹出窗口'); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
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
