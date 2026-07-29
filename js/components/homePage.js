// ===== 首页 =====
const HomePage = {
  _dateTimer: null,

  show() {
    const profile = Store.getProfile();
    const plan = Store.getWeeklyPlan();

    if (!profile) { this._intro(); return; }

    // 完整版用户显示时间线
    if (profile.fullProfile) {
      TimelineView.show();
      return;
    }

    if (!plan?.days?.length) { this._noPlan(profile); return; }

    // 检查日期是否在当前周
    const planStart = Helpers.parseDate(plan.days[0].date);
    const currentWeek = Helpers.getWeekStart();
    const diff = Math.abs(planStart.getTime() - currentWeek.getTime());
    if (diff > 6 * 24 * 60 * 60 * 1000) {
      this._stalePlan(profile, plan);
      return;
    }

    this._home(profile, plan);
  },

  _intro() {
    const el = document.getElementById('main-content');
    el.innerHTML = `
      <div class="intro-page" style="padding:0">
        <div class="intro-icon">🥢</div>
        <div class="intro-title">三餐指南</div>
        <div class="intro-sub">今天吃什么？已经帮你安排好了。</div>
        <div class="intro-btns">
          <button class="intro-btn" onclick="App.startWizard()">
            <span class="intro-btn-icon">👤</span>
            <span>
              <span class="intro-btn-label">第一次来</span>
              <span class="intro-btn-desc">填一下你的情况，帮你搭配一周的饭</span>
            </span>
          </button>
          <button class="intro-btn" onclick="App.startWizard()">
            <span class="intro-btn-icon">📝</span>
            <span>
              <span class="intro-btn-label">已用过</span>
              <span class="intro-btn-desc">更新你的饮食档案</span>
            </span>
          </button>
        </div>
        <div class="intro-footnote">🔒 所有数据存在你本地，不上传</div>
      </div>
    `;
  },

  _stalePlan(profile) {
    const el = document.getElementById('main-content');
    el.innerHTML = `
      <div class="page-hdr">
        <h2>📅 这周还没安排</h2>
        <p>上个月的菜单已经过期了，重新帮你搭配。</p>
      </div>
      <button class="btn btn-primary btn-lg btn-block" onclick="App.generatePlan()">
        生成这周的菜单 →
      </button>
    `;
  },

  _noPlan(profile) {
    const rec = Nutrition.getDailyRecommendation(profile);
    const el = document.getElementById('main-content');
    el.innerHTML = `
      <div class="page-hdr">
        <h2>👋 回来啦</h2>
        <p>这周的菜单还没安排，要现在弄吗？</p>
      </div>

      <div style="margin-bottom:16px">
        <button class="btn btn-primary btn-lg btn-block" onclick="App.generatePlan()">
          看看这周吃什么 →
        </button>
      </div>

      <div class="section">
        <div class="section-title">📊 你的每日参考</div>
        <div class="stat-row">
          <div class="stat-box">
            <div class="stat-num">${rec.energy}</div>
            <div class="stat-lbl">每日能量(kcal)</div>
          </div>
          <div class="stat-box">
            <div class="stat-num">${rec.targets.vegetable}</div>
            <div class="stat-lbl">蔬菜(g)</div>
          </div>
          <div class="stat-box">
            <div class="stat-num">${rec.targets.meatPoultry + rec.targets.seafood + rec.targets.egg}</div>
            <div class="stat-lbl">肉蛋水产(g)</div>
          </div>
        </div>
      </div>
    `;
  },

  _home(profile, plan) {
    if (this._dateTimer) clearInterval(this._dateTimer);
    this._renderHome(profile, plan);
    // 每分钟刷新"今天"高亮
    this._dateTimer = setInterval(() => {
      if (!document.getElementById('main-content')?.querySelector('.week-strip')) {
        clearInterval(this._dateTimer);
        return;
      }
      this._renderHome(profile, plan);
    }, 60000);
  },

  _renderHome(profile, plan) {
    const today = new Date();
    const todayStr = Helpers.formatDate(today, 'YYYY-MM-DD');
    const todayPlan = plan.days.find(d => d.date === todayStr) || plan.days[0];
    const weekStart = plan.days[0];

    const el = document.getElementById('main-content');
    el.innerHTML = `
      <div class="page-hdr">
        <h2>🥢 这周吃什么</h2>
        <p>已经帮你安排好了</p>
      </div>

      <!-- 今日预览 -->
      <div class="meal-card today" onclick="App.navigate('plan')" style="cursor:pointer">
        <div class="meal-card-header" style="margin-bottom:8px">
          <div>
            <div class="meal-day">📌 今天 · ${todayPlan.dayOfWeek}</div>
            <div class="meal-date">${todayPlan.date}</div>
          </div>
          <div class="meal-stats">🥗 ${todayPlan.ingredientCount || '?'}种食材</div>
        </div>
        ${['breakfast', 'lunch', 'dinner'].filter(mt => todayPlan.meals?.[mt]).map(mt => {
          const m = todayPlan.meals[mt];
          const sides = Object.keys(todayPlan.meals).filter(k => k.startsWith(mt + '_side')).map(k => todayPlan.meals[k]);
          return `
          <div class="meal-entry">
            <span class="meal-icon">${mt === 'breakfast' ? '🍳' : mt === 'lunch' ? '🥗' : '🍲'}</span>
            <div class="meal-body">
              <div class="meal-name">${m.name}</div>
              <div class="meal-extra">⏱ ${m.cookTime}分钟</div>
              ${sides.length ? sides.map(s => `
                <div style="display:flex;align-items:center;gap:4px;font-size:11px;color:var(--text-soft)">🥬 + ${s.name}</div>
              `).join('') : ''}
            </div>
          </div>`;
        }).join('')}
      </div>

      <!-- 快捷入口 -->
      <div class="section">
        <div class="section-title">快捷入口</div>
        <div class="quick-grid">
          <a class="quick-link" onclick="App.navigate('plan')">
            <span>📋</span> 完整菜单
          </a>
          <a class="quick-link" onclick="App.navigate('shopping')">
            <span>🛒</span> 采购清单
          </a>
          <a class="quick-link" onclick="App.navigate('nutrition')">
            <span>📊</span> 营养报告
          </a>
          <a class="quick-link" onclick="App.navigate('recipes')">
            <span>📝</span> 自定义菜谱
          </a>
        </div>
      </div>

      <!-- 本周一览 -->
      <div class="section">
        <div class="section-title">📅 本周一览</div>
        <div class="week-strip">
          ${plan.days.map((day, i) => {
            const d = new Date(day.date);
            const isToday = Helpers.formatDate(d, 'YYYY-MM-DD') === Helpers.formatDate(today, 'YYYY-MM-DD');
            const ok = day.ingredientCount >= 12;
            return `
              <div class="week-strip-day ${isToday ? 'today' : ''}">
                <div>${day.dayOfWeek?.replace('周', '')}</div>
                <div style="font-size:10px;color:var(--text-hint)">${d.getDate()}</div>
                <div class="dot">${ok ? '✅' : day.ingredientCount > 0 ? '⚠️' : '❌'}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },
};
