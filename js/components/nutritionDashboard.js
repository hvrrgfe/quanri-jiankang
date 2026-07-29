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
        totalCals += Helpers.num(nut.calories);
        totalProtein += Helpers.num(nut.protein);
        totalFat += Helpers.num(nut.fat);
        totalCarbs += Helpers.num(nut.carb);
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

    // 构建进度条
    const bars = [
      { label: '食材多样性', pct: Math.min(100, Math.round(allIngs.size/25*100)), val: allIngs.size+'/25种', color: 'var(--accent)' },
      { label: '深色蔬菜', pct: Math.min(100, darkRatio), val: darkRatio+'%/50%', color: '#3BA99E' },
      { label: '红肉控制', pct: Math.min(100, Math.round((1-redMeatG/500)*100)), val: redMeatG > 500 ? '超标'+(redMeatG-500)+'g' : (500-redMeatG)+'g余量', color: '#D4785C' },
      { label: '鱼虾次数', pct: Math.min(100, Math.round(fishCount/2*100)), val: fishCount+'/2次', color: '#7C5CFC' },
      { label: '日均热量', pct: Math.min(100, Math.round((1-Math.abs(avgCals-rec.energy)/rec.energy)*100)), val: avgCals+'/'+rec.energy+'kcal', color: '#D4A056' },
    ];
    var chartsHtml = '';
    for (var b = 0; b < bars.length; b++) {
      var item = bars[b];
      var fp = Math.max(0, Math.min(100, item.pct));
      var ok = fp >= 80;
      chartsHtml += '<div style="margin-bottom:10px">' +
        '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:3px">' +
        '<span>' + (ok ? '✅' : '⚠️') + ' ' + item.label + '</span>' +
        '<span style="color:var(--text-soft)">' + item.val + '</span></div>' +
        '<div style="height:8px;background:var(--line);border-radius:4px;overflow:hidden">' +
        '<div style="height:100%;width:' + fp + '%;background:' + item.color + ';border-radius:4px"></div></div></div>';
    }

    el.innerHTML = Icons.replace(`
      <div class="page-hdr">
        <h2>📊 本周营养报告</h2>
        <p>根据你的档案 · ${rec.energy}kcal/天</p>
      </div>

      <!-- 进度概览 -->
      <div class="note-card" style="margin-bottom:14px;padding:16px">
        <div style="font-size:14px;font-weight:600;margin-bottom:12px">📈 目标完成度</div>
        ${chartsHtml}
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
              <span style="font-size:12px;color:var(--text-hint)">🔥${Helpers.disp(dc)}kcal · 🥗${Helpers.disp(ding.size)}种食材</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:4px;font-size:12px;text-align:center">
              <div style="background:var(--accent-bg);border-radius:4px;padding:4px"><span style="font-weight:600">${Helpers.disp(dc)}kcal</span><br><span style="color:var(--text-soft)">热量</span></div>
              <div style="background:var(--accent-bg);border-radius:4px;padding:4px"><span style="font-weight:600">${Helpers.disp(dp)}g</span><br><span style="color:var(--text-soft)">蛋白质</span></div>
              <div style="background:var(--accent-bg);border-radius:4px;padding:4px"><span style="font-weight:600">${Helpers.disp(df)}g</span><br><span style="color:var(--text-soft)">脂肪</span></div>
              <div style="background:var(--accent-bg);border-radius:4px;padding:4px"><span style="font-weight:600">${Helpers.disp(dcar)}g</span><br><span style="color:var(--text-soft)">碳水</span></div>
            </div>
          </div>
        `;
      }).join('')}

      <!-- 运动建议 -->
      <div class="section-title">🏃 运动建议</div>
      <div class="note-card" style="font-size:13px;line-height:1.8">
        <div>🏃 每周至少5天中等强度运动，累计≥150分钟</div>
        <div>🚶 主动身体活动最好每天6000步</div>
        <div>💪 减少久坐，每小时起来动一动</div>
        <div style="margin-top:4px;color:var(--text-hint)">
          你目前每周运动${profile?.exerciseDays||0}天 · ${profile?.eatOutFreq > 3 ? '外食较多，注意控盐控油' : ''}
        </div>
      </div>

      <!-- 每日目标 -->
      <div class="section-title">🎯 每日营养目标</div>
      <div class="note-card" style="font-size:13px;line-height:1.8">
        <div>🔥 能量 ${rec.energy}kcal · 💪 蛋白质 ${rec.proteinRNI}g（DRIs 2023）</div>
        <div>🌾 谷薯类：${rec.targets.grain}g（全谷物${rec.targets.wholeGrain}g + 薯类${rec.targets.tuber}g）</div>
        <div>🥬 蔬菜≥${rec.targets.vegetable}g · 🍎 水果${rec.targets.fruit}g</div>
        <div>🥩 畜禽${rec.targets.meatPoultry}g · 🐟 水产${rec.targets.seafood}g · 🥚 蛋${rec.targets.egg}g</div>
        <div>🥛 奶${rec.targets.dairy}ml · 🧈 大豆${rec.targets.soy}g · 🥜 坚果${rec.targets.nut}g</div>
        <div>🫒 油≤${rec.targets.oil}g · 🧂 盐≤${rec.targets.salt}g · 💧 水${rec.water}ml</div>
      </div>

      <div style="text-align:center;margin-top:16px">
        <button class="btn btn-soft btn-sm" onclick="App.navigate('plan')">← 返回菜单</button>
      </div>
    `);
  },
};
