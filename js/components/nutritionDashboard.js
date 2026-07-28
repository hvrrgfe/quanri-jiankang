// ===== 营养统计看板 =====
const NutritionDashboard = {
  show() {
    const plan = Store.getWeeklyPlan();
    const profile = Store.getProfile();
    if (!plan?.days?.length || !profile) {
      return Helpers.toast('请先生成菜单');
    }

    const rec = Nutrition.getDailyRecommendation(profile);
    const el = document.getElementById('main-content');

    // 汇总营养数据
    let totalCals = 0, totalProtein = 0, totalFat = 0, totalCarbs = 0;
    let allIngs = new Set();
    let darkVegCount = 0, vegCount = 0;
    let redMeatG = 0, fishCount = 0;
    const darkVegs = ['菠菜','西兰花','油麦菜','空心菜','芥蓝','茼蒿','苋菜','韭菜','胡萝卜','番茄','紫甘蓝'];

    plan.days.forEach(day => {
      ['breakfast','lunch','dinner'].forEach(mt => {
        const m = day.meals?.[mt];
        if (!m) return;
        const nut = Nutrition.estimateMealNutrition(m.ingredients || []);
        totalCals += nut.calories;
        totalProtein += nut.protein;
        totalFat += nut.fat;
        totalCarbs += nut.carb;
        (m.ingredients || []).forEach(ing => {
          if (ing.category !== 'condiment') allIngs.add(ing.name);
          if (ing.category === 'vegetable') {
            vegCount++;
            if (darkVegs.some(d => ing.name.includes(d))) darkVegCount++;
          }
          if (['猪肉','牛肉','羊肉','牛腩','排骨','五花肉'].some(r => ing.name.includes(r))) redMeatG += ing.amount || 100;
          if (['seafood'].includes(ing.category)) fishCount++;
        });
      });
    });

    const weekDays = plan.days.length;
    const avgCals = weekDays ? Math.round(totalCals / weekDays) : 0;
    const darkRatio = vegCount > 0 ? Math.round(darkVegCount/vegCount*100) : 0;

    el.innerHTML = `
      <div class="page-hdr">
        <h2>📊 本周营养报告</h2>
        <p>基于你的档案 · ${rec.energy}kcal/天</p>
      </div>

      <!-- 达标概览 -->
      <div class="note-card" style="margin-bottom:14px">
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;text-align:center">
          <div><div style="font-size:24px;font-weight:700;color:var(--accent)">${allIngs.size}</div><div style="font-size:12px;color:var(--text-soft)">食材种类</div></div>
          <div><div style="font-size:24px;font-weight:700;color:var(--accent)">${avgCals}</div><div style="font-size:12px;color:var(--text-soft)">日均热量(kcal)</div></div>
          <div><div style="font-size:24px;font-weight:700;color:var(--accent)">${darkRatio}%</div><div style="font-size:12px;color:var(--text-soft)">深色蔬菜占比</div></div>
        </div>
      </div>

      <!-- 膳食指南达标检查 -->
      <div class="section-title">✅ 膳食指南达标检查</div>
      <div class="note-card" style="margin-bottom:14px">
        ${[
          { label: '食材多样性', ok: allIngs.size >= 25, detail: `${allIngs.size}/25种` },
          { label: '深色蔬菜', ok: darkRatio >= 50, detail: `${darkRatio}%（需≥50%）` },
          { label: '红肉控制', ok: redMeatG <= 500, detail: `约${redMeatG}g（限≤500g/周）` },
          { label: '鱼虾次数', ok: fishCount >= 2, detail: `${fishCount}次（需≥2次/周）` },
          { label: '日均热量', ok: Math.abs(avgCals - rec.energy) < 200, detail: `${avgCals}kcal（目标${rec.energy}kcal）` },
        ].map(item => `
          <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px dashed var(--line-light)">
            <span>${item.ok ? '✅' : '⚠️'} ${item.label}</span>
            <span style="color:${item.ok ? 'var(--accent-mint)' : 'var(--accent)'}">${item.detail}</span>
          </div>
        `).join('')}
      </div>

      <!-- 每日营养详情 -->
      <div class="section-title">📅 每日详情</div>
      ${plan.days.map((day, idx) => {
        let dc = 0, dp = 0, df = 0, dcar = 0, ding = new Set();
        ['breakfast','lunch','dinner'].forEach(mt => {
          const m = day.meals?.[mt];
          if (!m) return;
          const n = Nutrition.estimateMealNutrition(m.ingredients || []);
          dc += n.calories; dp += n.protein; df += n.fat; dcar += n.carb;
          (m.ingredients || []).forEach(i => { if (i.category !== 'condiment') ding.add(i.name); });
        });
        const today = new Date(); const d = new Date(day.date);
        const isToday = d.toDateString() === today.toDateString();

        return `
          <div class="meal-card ${isToday ? 'today' : ''}" style="margin-bottom:8px">
            <div class="flex-between" style="margin-bottom:6px">
              <span style="font-weight:600;font-size:14px">${day.dayOfWeek} ${isToday ? '· 今天' : ''}</span>
              <span style="font-size:12px;color:var(--text-hint)">🔥${dc}kcal · 🥗${ding.size}种食材</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;font-size:12px;text-align:center">
              <div style="background:var(--accent-bg);border-radius:4px;padding:4px"><span style="font-weight:600">${dc}kcal</span><br><span style="color:var(--text-soft)">热量</span></div>
              <div style="background:var(--accent-bg);border-radius:4px;padding:4px"><span style="font-weight:600">${dp}g</span><br><span style="color:var(--text-soft)">蛋白质</span></div>
              <div style="background:var(--accent-bg);border-radius:4px;padding:4px"><span style="font-weight:600">${df}g</span><br><span style="color:var(--text-soft)">脂肪</span></div>
              <div style="background:var(--accent-bg);border-radius:4px;padding:4px"><span style="font-weight:600">${dcar}g</span><br><span style="color:var(--text-soft)">碳水</span></div>
            </div>
          </div>
        `;
      }).join('')}

      <!-- 膳食宝塔参考 -->
      <div class="section-title">🗼 膳食宝塔目标参考（每天）</div>
      <div class="note-card" style="font-size:13px;line-height:1.8">
        <div>🌾 谷薯类：${rec.targets.grain}g（全谷物${rec.targets.wholeGrain}g + 薯类${rec.targets.tuber}g）</div>
        <div>🥬 蔬菜：${rec.targets.vegetable}g · 🍎 水果：${rec.targets.fruit}g</div>
        <div>🥩 畜禽肉：${rec.targets.meatPoultry}g · 🐟 水产：${rec.targets.seafood}g · 🥚 蛋：${rec.targets.egg}g</div>
        <div>🥛 奶类：${rec.targets.dairy}ml · 🧈 大豆：${rec.targets.soy}g · 🥜 坚果：${rec.targets.nut}g</div>
        <div>🫒 油≤${rec.targets.oil}g · 🧂 盐≤${rec.targets.salt}g · 💧 水${rec.water}ml</div>
      </div>

      <div style="text-align:center;margin-top:16px">
        <button class="btn btn-soft btn-sm" onclick="App.navigate('plan')">← 返回菜单</button>
      </div>
    `;
  },
};
