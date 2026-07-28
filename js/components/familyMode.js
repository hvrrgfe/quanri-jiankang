// ===== 家庭模式 + 备菜模式完整版 =====
const FamilyMode = {
  show() {
    const members = Store.get('familyMembers', []);
    const mode = Store.getProfile()?.mode || 'personal';
    const el = document.getElementById('main-content');

    if (mode === 'mealprep') { this._prepOverview(); return; }

    el.innerHTML = `
      <div class="page-hdr"><h2>👨‍👩‍👧‍👧 家庭成员</h2><p>为每位成员设置饮食档案</p></div>
      ${members.map((m, i) => `
        <div class="meal-card" style="margin-bottom:6px">
          <div class="flex-between">
            <div><strong>${m.name}</strong> ${m.age}岁 · ${m.gender==='male'?'男':'女'} · ${(m.restrictions||[]).join('、')||'无忌口'}</div>
            <button class="btn btn-soft btn-sm" onclick="FamilyMode._edit(${i})">编辑</button>
          </div>
        </div>`).join('') || '<div style="font-size:13px;color:var(--text-hint);margin-bottom:8px">还没有添加家庭成员</div>'}
      <button class="btn btn-outline btn-block btn-sm" onclick="FamilyMode._add()">+ 添加成员</button>
      <div style="text-align:center;margin-top:12px"><button class="btn btn-soft btn-sm" onclick="App.navigate('home')">← 返回</button></div>
    `;
  },

  _form(idx) {
    const members = Store.get('familyMembers', []);
    const m = idx != null ? members[idx] : {};
    Helpers.openModal(`
      <h3 style="font-size:18px;font-weight:600;margin-bottom:12px">${idx!=null?'编辑':'添加'}成员</h3>
      <div class="form-group"><label class="form-label">称呼</label><input class="form-input" id="fm-name" value="${m.name||''}"></div>
      <div style="display:flex;gap:8px">
        <div class="form-group" style="flex:1"><label class="form-label">年龄</label><input type="number" class="form-input" id="fm-age" value="${m.age||18}"></div>
        <div class="form-group" style="flex:1"><label class="form-label">性别</label>
          <select class="form-select" id="fm-gender"><option value="male" ${m.gender==='male'?'selected':''}>男</option><option value="female" ${m.gender==='female'?'selected':''}>女</option></select></div>
      </div>
      <div class="form-group"><label class="form-label">忌口/偏好（逗号分隔）</label><input class="form-input" id="fm-rest" value="${(m.restrictions||[]).join('、')}"></div>
      <button class="btn btn-primary btn-block" onclick="FamilyMode._save(${idx})">保存</button>
    `);
  },
  _add() { this._form(); },
  _edit(i) { this._form(i); },

  _save(idx) {
    const name = document.getElementById('fm-name')?.value.trim();
    if (!name) return Helpers.toast('请输入称呼');
    const member = {
      name, age: parseInt(document.getElementById('fm-age')?.value)||18,
      gender: document.getElementById('fm-gender')?.value||'female',
      restrictions: (document.getElementById('fm-rest')?.value||'').split(/[,，、]/).map(s=>s.trim()).filter(Boolean),
    };
    const members = Store.get('familyMembers', []);
    if (idx != null) members[idx] = member; else members.push(member);
    Store.set('familyMembers', members);
    Helpers.closeModal();
    Helpers.toast('已保存 ✓');
    this.show();
  },

  // ===== 备菜模式完整版（三级界面）=====

  _prepOverview() {
    const plan = Store.getWeeklyPlan();
    if (!plan?.days?.length) {
      document.getElementById('main-content').innerHTML = `
        <div class="empty"><span>📦</span><h3>请先生成菜单</h3><p>有了一周菜单才能规划备菜</p>
        <button class="btn btn-primary" onclick="App.generatePlan()">先去安排菜单</button></div>`;
      return;
    }

    const el = document.getElementById('main-content');
    // 分析适合备菜的菜品
    const prepRecipes = [];
    const dayRecipes = [];
    const icons = { breakfast:'🍳', lunch:'🥗', dinner:'🍲' };

    plan.days.forEach((day, idx) => {
      ['breakfast','lunch','dinner'].forEach(mt => {
        const m = day.meals?.[mt];
        if (!m) return;
        const canPrep = (m.tags||[]).some(t => ['适合带饭','下饭','快手'].includes(t)) || (m.cookTime||0) > 30;
        const r = { ...m, date: day.date, dayOfWeek: day.dayOfWeek, mealType: mt, idx, canPrep, icon: icons[mt]||'🍽️' };
        if (canPrep) prepRecipes.push(r);
        dayRecipes.push(r);
      });
    });

    el.innerHTML = `
      <div class="page-hdr"><h2>📦 备菜模式</h2><p>一次备好一周的菜</p></div>

      <div class="note-card" style="margin-bottom:12px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span><strong>🛒 备菜日：周日</strong></span>
          <span style="font-size:13px;color:var(--text-soft)">${prepRecipes.length}道可提前准备</span>
        </div>
        <div style="font-size:12px;color:var(--text-hint);margin-top:4px">预计用时约${Math.round(prepRecipes.length * 12)}分钟</div>
      </div>

      <!-- 备菜流程清单 -->
      <div class="note-card" style="margin-bottom:12px">
        <div style="font-weight:600;margin-bottom:8px">🧾 备菜流程（按顺序执行）</div>
        ${prepRecipes.slice(0,6).map((r, i) => `
          <div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px dashed var(--line-light);font-size:13px">
            <span style="color:var(--accent);font-weight:600">${i+1}</span>
            <span>${r.icon}</span>
            <span style="flex:1">${r.name}</span>
            <span style="color:var(--text-hint);font-size:12px">⏱${r.cookTime}min</span>
            <span style="color:var(--mint);font-size:11px">📦 ${r.cookTime>30?'冷冻':'冷藏'}</span>
          </div>`).join('')}
        ${prepRecipes.length > 6 ? `<div style="font-size:12px;color:var(--text-hint);padding:4px">...还有${prepRecipes.length-6}道</div>` : ''}
      </div>

      <!-- 容器清单 -->
      <div class="note-card" style="background:var(--warm-bg);margin-bottom:12px">
        <strong>📦 需要准备的容器</strong>
        <div style="font-size:13px;margin-top:4px">保鲜盒${Math.ceil(prepRecipes.length*0.6)}个 · 密封袋${Math.ceil(prepRecipes.length*0.3)}个 · 标签纸</div>
      </div>

      <!-- 工作日执行卡 -->
      <div style="font-weight:600;font-size:14px;margin-bottom:8px">📅 工作日执行卡</div>
      ${plan.days.map(day => {
        const dayMeals = ['breakfast','lunch','dinner'].filter(mt => day.meals?.[mt]);
        if (!dayMeals.length) return '';
        const isWeekend = ['周六','周日'].includes(day.dayOfWeek);
        if (isWeekend) return '';
        return `
          <div class="meal-card" style="margin-bottom:6px">
            <div style="font-weight:600;font-size:14px;margin-bottom:4px">${day.dayOfWeek} ${day.date}</div>
            ${dayMeals.map(mt => {
              const m = day.meals[mt];
              const ic = {breakfast:'🍳',lunch:'🥗',dinner:'🍲'};
              return `<div style="display:flex;justify-content:space-between;padding:4px 0;font-size:13px">
                <span>${ic[mt]} ${m.name}</span>
                <span style="color:var(--text-hint)">⏱${m.cookTime}min ${(m.tags||[]).includes('适合带饭')?'📦':''}</span>
              </div>`;
            }).join('')}
          </div>`;
      }).join('')}

      <div style="text-align:center;margin-top:12px">
        <button class="btn btn-soft btn-sm" onclick="App.navigate('plan')">← 查看完整菜单</button>
      </div>
    `;
  },
};
