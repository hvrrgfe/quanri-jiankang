// ===== 本周菜单 =====
const WeeklyPlan = {
  _plan: null,

  refresh() {
    this._plan = Store.getWeeklyPlan();
    this._eaten = Store.get('eatenMeals', {});
    if (!this._plan?.days?.length) { this._empty(); return; }
    // 检查日期是否在当前周
    const planStart = new Date(this._plan.days[0].date);
    const currentWeek = Helpers.getWeekStart();
    const diff = Math.abs(planStart.getTime() - currentWeek.getTime());
    if (diff > 7 * 24 * 60 * 60 * 1000) {
      this._empty();
      return;
    }
    this._render();
  },

  _render() {
    const plan = this._plan;
    const days = plan.days;
    const s = plan.weeklyStats || {};

    const el = document.getElementById('main-content');
    el.innerHTML = `
      <div class="flex-between" style="margin-bottom:12px">
        <div class="page-hdr" style="margin-bottom:0">
          <h2>📋 本周菜单</h2>
          <p>${days[0]?.date || ''} ~ ${days[days.length-1]?.date || ''}</p>
        </div>
        <button class="btn btn-soft btn-sm" onclick="WeeklyPlan._regen()">🔄 换一批</button>
      </div>

      ${plan._llmError ? `
      <div class="note-card" style="background:var(--red-bg);margin-bottom:12px">
        <strong>⚠️ AI 调用未成功</strong><br>
        <span style="font-size:12px">${plan._llmError}</span><br>
        <span style="font-size:11px;color:var(--text-hint)">已使用本地引擎生成菜单</span>
      </div>` : ''}

      ${plan.validation ? `
      <div class="note-card" style="margin-bottom:12px">
        <strong>✅ 膳食指南合规检查</strong><br>
        <div style="font-size:12px;margin-top:4px;line-height:1.8">
          ${plan.validation.passed && !plan.validation.warnings.length ? '🎉 全部达标！' : '⚠️ 部分未达标'}
          ${plan.validation.errors.map(e => `<div>❌ ${e}</div>`).join('')}
          ${plan.validation.warnings.map(w => `<div>⚠️ ${w}</div>`).join('')}
          ${plan.validation.stats ? `
            <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:4px">
              <span>🥗 食材 ${plan.validation.stats.weekDiversity?.count || 0}种/周 ${plan.validation.stats.weekDiversity?.passed ? '✅' : '⚠️'}</span>
              <span>🥬 深色蔬菜 ${plan.validation.stats.darkVegetable?.ratioText || '—'} ${plan.validation.stats.darkVegetable?.passed ? '✅' : '⚠️'}</span>
              <span>🥩 红肉 ${plan.validation.stats.redMeat?.total || 0}g/周 ${plan.validation.stats.redMeat?.passed ? '✅' : '⚠️'}</span>
              <span>🐟 鱼虾 ${plan.validation.stats.fish?.count || 0}次/周 ${plan.validation.stats.fish?.passed ? '✅' : '⚠️'}</span>
            </div>` : ''}
        </div>
      </div>` : ''}

      ${s.totalIngredientTypes ? `
      <div class="note-card">
        <strong>📊 本周概览</strong><br>
        食材种类 ${s.totalIngredientTypes}种 · 深色蔬菜 ${s.darkVegetablePercent || '—'} · 鱼虾 ${s.fishCount || 0}次
        ${s.notes ? '<br>💡 ' + s.notes : ''}
      </div>` : ''}

      <div id="plan-list">
        ${days.map((d, i) => this._day(d, i)).join('')}
      </div>
    `;
  },

  _day(day, idx) {
    const today = new Date();
    const d = new Date(day.date);
    const isToday = d.toDateString() === today.toDateString();
    const meals = day.meals || {};

    return `
      <div class="meal-card ${isToday ? 'today' : ''}">
        <div class="meal-card-header" onclick="WeeklyPlan._toggle(${idx})">
          <div>
            <div class="meal-day">${day.dayOfWeek} ${isToday ? '· 今天' : ''}</div>
            <div class="meal-date">${day.date}</div>
          </div>
          <div class="meal-stats">
            ⏱ ${day.totalCookTime || 0}min
            <span id="plan-arrow-${idx}" style="margin-left:4px;font-size:10px">▾</span>
          </div>
        </div>
        <div id="plan-body-${idx}">
          ${['breakfast', 'lunch', 'dinner'].filter(mt => meals[mt]).map(mt => {
            const m = meals[mt];
            const labels = { breakfast: '早餐', lunch: '午餐', dinner: '晚餐' };
            const icons = { breakfast: '🍳', lunch: '🥗', dinner: '🍲' };
            // 找出该餐的配菜
            const sides = Object.keys(meals).filter(k => k.startsWith(mt + '_side')).map(k => meals[k]);
            return `
              <div class="meal-entry">
                <span class="meal-icon">${icons[mt] || '🍽️'}</span>
                <div class="meal-body">
                  <div style="font-size:11px;color:var(--text-hint);font-weight:600;margin-bottom:1px">${labels[mt]||mt}</div>
                  <div class="meal-name">
                    <a onclick="RecipeCard.show(${idx},'${mt}')">${m.name}</a>
                  </div>
                  <div class="meal-extra">⏱ ${m.cookTime || '?'}分钟 · ${(m.ingredients || []).length}种食材${m._score ? ` · 🏆 ${m._score}分` : ''}</div>
                  ${sides.length ? sides.map(s => `
                    <div style="display:flex;align-items:center;gap:4px;font-size:12px;color:var(--text-soft);padding:2px 0">
                      <span style="font-size:10px">🥬</span>
                      <span>+ ${s.name}</span>
                      <span style="font-size:10px;color:var(--text-hint)">${s.cookTime}min</span>
                    </div>`).join('') : ''}
                  <div class="meal-actions">
                    <button class="meal-action" onclick="event.stopPropagation();WeeklyPlan._eat('${day.date}','${mt}')" style="${this._eaten?.[day.date]?.[mt] ? 'color:var(--mint);font-weight:600' : ''}">${this._eaten?.[day.date]?.[mt] ? '✅ 已吃' : '✅ 标记已吃'}</button>
                    <button class="meal-action" onclick="event.stopPropagation();WeeklyPlan._replace(${idx},'${mt}')">🔄 换一个</button>
                    <button class="meal-action" onclick="event.stopPropagation();RecipeCard.show(${idx},'${mt}')">👁️ 看做法</button>
                  </div>
                </div>
              </div>
            `;
          }).join('')}

          ${day.ingredientCount != null ? `
          <div class="ingredient-bar">
            <span>今日食材</span>
            <div style="display:flex;align-items:center;gap:8px">
              <span class="count">${Helpers.disp(day.ingredientCount, 0)}/12 ${day.ingredientCount >= 12 ? '✅' : '⚠️'}</span>
              <div class="bar"><div class="bar-fill" style="width:${Math.min(100, Helpers.num(day.ingredientCount, 0)/12*100)}%"></div></div>
            </div>
          </div>` : ''}
        </div>
      </div>
    `;
  },

  _empty() {
    const el = document.getElementById('main-content');
    el.innerHTML = `
      <div class="empty">
        <span>📋</span>
        <h3>还没安排菜单</h3>
        <p>先设置你的饮食档案，帮你搭配一周的饭</p>
        <button class="btn btn-primary" onclick="App.generatePlan()">开始安排 →</button>
      </div>
    `;
  },

  _toggle(idx) {
    const body = document.getElementById('plan-body-' + idx);
    const arrow = document.getElementById('plan-arrow-' + idx);
    if (!body) return;
    const hidden = body.style.display === 'none';
    body.style.display = hidden ? 'block' : 'none';
    if (arrow) arrow.style.transform = hidden ? 'rotate(0)' : 'rotate(-90deg)';
  },

  async _regen() {
    Helpers.stopTipTimer();
    document.getElementById('main-content').innerHTML = Helpers.loadingHTML();
    Helpers.startTipTimer();
    const minShow = new Promise(r => setTimeout(r, 2000));
    try {
      const profile = await Store.getProfile();
      if (!profile) { Helpers.toast('请先填写档案'); return; }
      const plan = await MealPlanner.generateWeeklyPlan(profile);
      await minShow;
      Store.setWeeklyPlan(plan);
      const sl = MealPlanner.generateShoppingList(plan, profile);
      Store.setShoppingList(sl);
      this._plan = plan;
      this._render();
    } catch (e) {
      await minShow;
      Helpers.toast('没成功: ' + e.message);
    }
  },

  _eat(date, mealType) {
    const eaten = Store.get('eatenMeals', {});
    if (!eaten[date]) eaten[date] = {};
    // 切换状态：如果已吃则取消，否则标记
    if (eaten[date][mealType]) {
      delete eaten[date][mealType];
      Store.set('eatenMeals', eaten);
      this._eaten = eaten;
      this._render();
      Helpers.toast('已取消标记');
    } else {
      eaten[date][mealType] = true;
      Store.set('eatenMeals', eaten);
      this._eaten = eaten;
      this._render();
      Helpers.toast('已标记 ✅');
    }
  },

  async _replace(dayIdx, mealType) {
    const profile = await Store.getProfile();
    const plan = Store.getWeeklyPlan();
    if (!plan || !profile) return;
    Helpers.toast('换个菜...');
    try {
      const updated = await MealPlanner.replaceMeal(plan, dayIdx, mealType, profile);
      Store.setWeeklyPlan(updated);
      this._plan = updated;
      this._render();
      Helpers.toast('换好了 ✓');
    } catch (e) {
      Helpers.toast('没换成');
    }
  },
};
