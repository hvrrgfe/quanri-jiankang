// ===== 知程 · 主应用 =====
// 循证驱动的规划工具:WOOP 目标 + if-then 实施意图 + 参照类别预测 + 番茄钟 + 复盘反馈

const Store = {
  get(k, d) { try { const v = localStorage.getItem('planwise:' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { localStorage.setItem('planwise:' + k, JSON.stringify(v)); },
  getSettings() { return this.get('settings', { targetDate: '', targetName: '', name: '同学' }); },
  setSettings(s) { this.set('settings', s); },
  getGoals() { return this.get('goals', []); },
  setGoals(g) { this.set('goals', g); },
  getTasks() { return this.get('tasks', []); },
  setTasks(t) { this.set('tasks', t); },
  getFocus() { return this.get('focus', []); },
  setFocus(f) { this.set('focus', f); },
};

const App = {
  _page: 'home',

  init() {
    setTimeout(() => {
      const sp = document.getElementById('splash-screen');
      if (sp) { sp.classList.add('fade-out'); setTimeout(() => sp.style.display = 'none', 400); }
      document.getElementById('app').classList.remove('hidden');
    }, 600);
    document.querySelectorAll('#app-nav a').forEach(a => {
      a.addEventListener('click', e => { e.preventDefault(); this.navigate(a.dataset.page); });
    });
    // 首次使用引导
    if (!Store.getSettings().targetDate && !Store.getGoals().length) {
      this.navigate('goal');
    } else {
      this.navigate('home');
    }
  },

  navigate(page) {
    this._page = page;
    document.querySelectorAll('#app-nav a').forEach(a => a.classList.toggle('active', a.dataset.page === page));
    const render = {
      home: () => HomeView.show(),
      goal: () => GoalView.show(),
      plan: () => PlanView.show(),
      focus: () => FocusView.show(),
      data: () => DataView.show(),
      more: () => MoreView.show(),
    };
    (render[page] || render.home)();
  },

  toast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => t.classList.add('hidden'), 2200);
  },

  todayStr() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  },

  daysUntil(dateStr) {
    if (!dateStr) return null;
    const t = new Date(dateStr + 'T00:00:00');
    const now = new Date(this.todayStr() + 'T00:00:00');
    return Math.round((t - now) / 86400000);
  },

  esc(s) { return String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); },

  // ---- 参照类别预测:估算同类任务历史耗时 ----
  referenceHours(title) {
    const t = title.toLowerCase();
    for (const r of REFERENCE_CLASSES) {
      if (t.includes(r.keyword)) return r;
    }
    return null;
  },
  // 同类任务历史实际均值(用户自己的数据)
  personalAvg(title) {
    const tasks = Store.getTasks().filter(x => x.actualHours && x.title.includes(title.slice(0, 2)));
    if (!tasks.length) return null;
    return tasks.reduce((s, x) => s + x.actualHours, 0) / tasks.length;
  },
};

// ============ 首页 ============
const HomeView = {
  show() {
    const s = Store.getSettings();
    const days = App.daysUntil(s.targetDate);
    const goals = Store.getGoals().filter(g => !g.done);
    const today = App.todayStr();
    const tasks = Store.getTasks().filter(t => t.date === today);
    const done = tasks.filter(t => t.done).length;
    const pct = tasks.length ? Math.round(done / tasks.length * 100) : 0;
    const focusToday = Store.getFocus().filter(f => f.date === today).reduce((s, f) => s + f.minutes, 0);

    document.getElementById('main-content').innerHTML = `
      <div class="hero">
        <div class="hero-top">
          <div class="hero-date">${today} · ${App.esc(s.name)}</div>
          <div class="hero-motto">循证规划 · 稳步抵达</div>
        </div>
        ${days !== null ? `
        <div class="hero-count">
          <span class="hero-num">${days < 0 ? '已过' + Math.abs(days) : days}</span>
          <span class="hero-unit">${days < 0 ? '天(目标日期已过)' : (s.targetName ? '天后 · ' + App.esc(s.targetName) : '天到目标日')}</span>
        </div>` : '<div class="hero-count"><span class="hero-num" style="font-size:26px">先去「目标」设一个</span></div>'}
        ${days !== null && days > 0 ? `<div class="hero-bar"><div class="hero-bar-fill" style="width:${Math.min(100, Math.max(8, 100 - days / 2))}%"></div></div>` : ''}
      </div>

      ${goals.length ? `<div class="card" onclick="App.navigate('goal')">
        <div class="card-title">目标 · 进行中的 WOOP <span class="more">共 ${goals.length} 个</span></div>
        ${goals.slice(0, 2).map(g => `
          <div class="woop-mini">
            <div class="woop-mini-wish">${App.esc(g.wish)}</div>
            <div class="woop-mini-line">障碍:「${App.esc(g.obstacle || '—')}」→ 计划:「${App.esc(g.plan || '—')}」</div>
          </div>`).join('')}
      </div>` : ''}

      <div class="focus-card" onclick="App.navigate('focus')">
        <div>
          <h3>开始一次专注</h3>
          <p>今日已专注 ${Math.floor(focusToday / 60)}h${focusToday % 60}m · 番茄钟计时</p>
        </div>
        <div class="focus-btn">开始</div>
      </div>

      <div class="card">
        <div class="card-title">今日任务 <span class="more">${done}/${tasks.length} · ${pct}%</span></div>
        ${tasks.length ? tasks.map(t => `
          <div class="todo-item">
            <div class="check ${t.done ? 'done' : ''}" onclick="TaskView.toggle('${t.id}')">${t.done ? '✓' : ''}</div>
            <div class="todo-body">
              <div class="todo-title ${t.done ? 'strike' : ''}">${App.esc(t.title)}</div>
              <div class="todo-sub">${App.esc(t.trigger)} → ${App.esc(t.action)}</div>
            </div>
            <span class="todo-hours">${t.estHours}h</span>
          </div>`).join('') : `
          <div class="empty">今天还没有任务。<a href="#" onclick="App.navigate('plan');return false">去计划页添加 →</a></div>`}
      </div>
    `;
  },
};

// ============ 目标页(WOOP) ============
const GoalView = {
  show() {
    const goals = Store.getGoals();
    document.getElementById('main-content').innerHTML = `
      <div class="page-hdr"><h2>WOOP 目标</h2><p>愿望 → 结果 → 障碍 → 计划(心理对照,比空想有效)</p></div>

      <div class="card">
        <div class="card-title">设定新目标 <span class="more" style="cursor:pointer" onclick="GoalView.toggleForm()">＋ 展开/收起</span></div>
        <div id="goal-form" class="goal-form">
          <div class="form-group">
            <label class="form-label">① 愿望 WISH —— 具体、可衡量、有挑战</label>
            <input class="form-input" id="g-wish" placeholder="例:3 个月内完成毕业论文初稿(1.2 万字)">
          </div>
          <div class="form-group">
            <label class="form-label">② 结果 OUTCOME —— 实现后的最好画面</label>
            <input class="form-input" id="g-outcome" placeholder="例:顺利答辩,导师认可,从容找实习">
          </div>
          <div class="form-group">
            <label class="form-label">③ 障碍 OBSTACLE —— 内心/外部最大阻碍(正视它)</label>
            <input class="form-input" id="g-obstacle" placeholder="例:写不下去时刷手机两小时">
          </div>
          <div class="form-group">
            <label class="form-label">④ 计划 PLAN —— 如果[障碍],那么[行动]</label>
            <input class="form-input" id="g-plan" placeholder="例:如果我想刷手机,那么我先起身喝水并打开写作页写 200 字">
          </div>
          <div class="form-group">
            <label class="form-label">目标日期</label>
            <input type="date" class="form-input" id="g-date">
          </div>
          <button class="btn btn-primary btn-block" onclick="GoalView.save()">保存目标</button>
        </div>
      </div>

      <div class="card">
        <div class="card-title">目标列表 <span class="more">${goals.length} 个</span></div>
        ${goals.length ? goals.map(g => `
          <div class="goal-item">
            <div class="goal-item-wish">${App.esc(g.wish)}</div>
            ${g.plan ? `<div class="goal-item-plan">if-then:${App.esc(g.plan)}</div>` : ''}
            <div class="goal-item-meta">
              ${g.date ? `<span>${g.date}</span>` : ''}
              <button class="btn-mini ${g.done ? 'green' : ''}" onclick="GoalView.toggle('${g.id}')">${g.done ? '已完成 ✓' : '标记完成'}</button>
              <button class="btn-mini danger" onclick="GoalView.del('${g.id}')">删除</button>
            </div>
          </div>`).join('') : '<div class="empty">还没有目标。用上面的 WOOP 四步设定第一个。</div>'}
      </div>

      <div class="card science">
        <div class="card-title">科学依据 <span class="more">研究引用</span></div>
        <p>${App.esc(STUDIES.find(s => s.id === 'woop').claim)}</p>
        <div class="science-src">${App.esc(STUDIES.find(s => s.id === 'woop').source)}</div>
      </div>
    `;
  },

  toggleForm() { document.getElementById('goal-form').classList.toggle('open'); },

  save() {
    const wish = document.getElementById('g-wish').value.trim();
    if (!wish) return App.toast('请填写愿望');
    const g = {
      id: 'g' + Date.now(),
      wish,
      outcome: document.getElementById('g-outcome').value.trim(),
      obstacle: document.getElementById('g-obstacle').value.trim(),
      plan: document.getElementById('g-plan').value.trim(),
      date: document.getElementById('g-date').value || '',
      done: false,
    };
    const goals = Store.getGoals();
    goals.unshift(g);
    Store.setGoals(goals);
    App.toast('目标已保存 · 记得每周复盘反馈 ✓');
    GoalView.show();
  },

  toggle(id) {
    const goals = Store.getGoals();
    const g = goals.find(x => x.id === id);
    if (g) { g.done = !g.done; Store.setGoals(goals); GoalView.show(); }
  },
  del(id) {
    Store.setGoals(Store.getGoals().filter(x => x.id !== id));
    App.toast('已删除');
    GoalView.show();
  },
};

// ============ 计划页 ============
const TaskView = {
  toggle(id) {
    const tasks = Store.getTasks();
    const t = tasks.find(x => x.id === id);
    if (t) {
      t.done = !t.done;
      if (t.done && !t.actualHours && t.estHours) t.actualHours = t.estHours; // 完成时默认记录实际=预估,可在数据页修正
      Store.setTasks(tasks);
    }
    App.navigate(App._page === 'plan' ? 'plan' : 'home');
  },
};

const PlanView = {
  show() {
    const today = App.todayStr();
    const tasks = Store.getTasks().slice().sort((a, b) => (a.done - b.done) || a.date.localeCompare(b.date));
    document.getElementById('main-content').innerHTML = `
      <div class="page-hdr"><h2>计划</h2><p>if-then 实施意图 + 参照类别时间校准</p></div>

      <div class="card">
        <div class="card-title">添加任务</div>
        <div class="form-group">
          <label class="form-label">任务(标题尽量包含类型词,用于时间校准)</label>
          <input class="form-input" id="t-title" placeholder="例:写数学单元复习(3 小时)">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">日期</label>
            <input type="date" class="form-input" id="t-date" value="${today}">
          </div>
          <div class="form-group">
            <label class="form-label">预估时长(小时)</label>
            <input type="number" class="form-input" id="t-est" step="0.5" min="0.5" placeholder="2">
          </div>
        </div>
        <div id="calib-box"></div>
        <div class="form-group">
          <label class="form-label">触发情境(if-then:如果…那么…)</label>
          <input class="form-input" id="t-trigger" placeholder="例:如果下午 2 点午睡醒来,那么…">
        </div>
        <div class="form-group">
          <label class="form-label">具体行动(那么…)</label>
          <input class="form-input" id="t-action" placeholder="例:翻开数学书第 3 章,先做 2 道基础题热身">
        </div>
        <button class="btn btn-primary btn-block" onclick="PlanView.add()">＋ 添加任务</button>
      </div>

      <div class="card">
        <div class="card-title">全部任务 <span class="more">${tasks.length} 个</span></div>
        ${tasks.length ? tasks.map(t => `
          <div class="todo-item">
            <div class="check ${t.done ? 'done' : ''}" onclick="TaskView.toggle('${t.id}')">${t.done ? '✓' : ''}</div>
            <div class="todo-body">
              <div class="todo-title ${t.done ? 'strike' : ''}">${App.esc(t.title)}</div>
              <div class="todo-sub">${t.date} · ${App.esc(t.trigger)} → ${App.esc(t.action)} · 预估 ${t.estHours}h ${t.actualHours ? '· 实际 ' + t.actualHours + 'h' : ''}</div>
            </div>
            <button class="btn-mini danger" onclick="PlanView.del('${t.id}')">删</button>
          </div>`).join('') : '<div class="empty">还没有任务。</div>'}
      </div>

      <div class="card science">
        <div class="card-title">科学依据 <span class="more">两项研究</span></div>
        <p><b>if-then:</b>${App.esc(STUDIES.find(s => s.id === 'if-then').claim)}</p>
        <div class="science-src">${App.esc(STUDIES.find(s => s.id === 'if-then').source)}</div>
        <p style="margin-top:10px"><b>时间校准:</b>${App.esc(STUDIES.find(s => s.id === 'planning-fallacy').claim)}</p>
        <div class="science-src">${App.esc(STUDIES.find(s => s.id === 'planning-fallacy').source)}</div>
      </div>
    `;
    this._calib();
  },

  _calib() {
    const inp = document.getElementById('t-title');
    const box = document.getElementById('calib-box');
    if (!inp || !box) return;
    inp.addEventListener('input', () => {
      const title = inp.value.trim();
      const ref = App.referenceHours(title);
      const personal = App.personalAvg(title);
      let html = '';
      if (ref) html += `<div class="calib-tip">参照类别:「${App.esc(ref.keyword)}」类任务平均 <b>${ref.avgHours}h</b>(${App.esc(ref.note)});建议预估 <b>${Math.round(ref.avgHours * 1.5 * 2) / 2}h</b>(含缓冲)</div>`;
      if (personal) html += `<div class="calib-tip">你的同类历史实际平均 <b>${personal}h</b>,可作参考</div>`;
      if (!ref && !personal && title) html += `<div class="calib-tip">提示:没有同类数据,建议预估 ×1.5 留缓冲(对抗规划谬误)</div>`;
      box.innerHTML = html || '';
      const est = document.getElementById('t-est');
      if (est && ref && !est.value) est.value = Math.round(ref.avgHours * 1.5 * 2) / 2;
    });
  },

  add() {
    const title = document.getElementById('t-title').value.trim();
    if (!title) return App.toast('请填写任务');
    const t = {
      id: 't' + Date.now(),
      title,
      date: document.getElementById('t-date').value || App.todayStr(),
      estHours: parseFloat(document.getElementById('t-est').value) || 1,
      trigger: document.getElementById('t-trigger').value.trim() || '如果到了计划时间',
      action: document.getElementById('t-action').value.trim() || title,
      done: false,
      actualHours: null,
      createdAt: Date.now(),
    };
    const tasks = Store.getTasks();
    tasks.push(t);
    Store.setTasks(tasks);
    App.toast('已添加 · 触发条件已生效 ✓');
    PlanView.show();
  },

  del(id) {
    Store.setTasks(Store.getTasks().filter(x => x.id !== id));
    PlanView.show();
  },
};

// ============ 专注页(番茄钟) ============
const FocusView = {
  _running: false, _left: 25 * 60, _timer: null, _mode: 25,

  show() {
    const today = App.todayStr();
    const focusToday = Store.getFocus().filter(f => f.date === today).reduce((s, f) => s + f.minutes, 0);
    document.getElementById('main-content').innerHTML = `
      <div class="page-hdr"><h2>专注</h2><p>番茄钟执行 · 专注时长自动计入数据页</p></div>
      <div class="timer-box">
        <div class="timer-modes">
          <span class="tm ${this._mode === 25 ? 'active' : ''}" onclick="FocusView.setMode(25)">25 分</span>
          <span class="tm ${this._mode === 45 ? 'active' : ''}" onclick="FocusView.setMode(45)">45 分</span>
          <span class="tm ${this._mode === 60 ? 'active' : ''}" onclick="FocusView.setMode(60)">60 分</span>
        </div>
        <div class="timer-big" id="timer">${this._fmt(this._left)}</div>
        <div class="timer-task">
          <input class="form-input" id="focus-task" placeholder="正在做什么?(可留空)" value="">
        </div>
        <button class="timer-btn" id="timerBtn" onclick="FocusView.toggle()">开始专注</button>
        <div class="timer-note">专注结束自动记录 · 今日累计 ${Math.floor(focusToday / 60)}h${focusToday % 60}m</div>
      </div>
      <div class="card">
        <div class="card-title">科学依据 <span class="more">研究引用</span></div>
        <p>${App.esc(STUDIES.find(s => s.id === 'time-mgmt').claim)}</p>
        <div class="science-src">${App.esc(STUDIES.find(s => s.id === 'time-mgmt').source)}</div>
      </div>
    `;
  },

  _fmt(sec) {
    const m = Math.floor(sec / 60), s = sec % 60;
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  },

  setMode(m) {
    this._mode = m;
    if (!this._running) { this._left = m * 60; this.show(); }
  },

  toggle() {
    const btn = document.getElementById('timerBtn');
    if (!this._running) {
      this._running = true;
      btn.textContent = '专注中 · 点击结束';
      btn.classList.add('running');
      this._timer = setInterval(() => {
        this._left--;
        document.getElementById('timer').textContent = this._fmt(this._left);
        if (this._left <= 0) this._finish();
      }, 1000);
    } else {
      this._finish();
    }
  },

  _finish() {
    clearInterval(this._timer);
    this._running = false;
    const minutes = this._mode * 60 - this._left;
    const task = (document.getElementById('focus-task') || {}).value || '未命名任务';
    if (minutes > 0) {
      const focus = Store.getFocus();
      focus.push({ date: App.todayStr(), minutes, task, ts: Date.now() });
      Store.setFocus(focus);
      App.toast('✓ 完成一次专注 ' + Math.round(minutes) + ' 分钟');
    }
    this._left = this._mode * 60;
    this.show();
  },
};

// ============ 数据页 ============
const DataView = {
  show() {
    const tasks = Store.getTasks();
    const focus = Store.getFocus();
    const today = App.todayStr();
    // 7 日专注
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      const mins = focus.filter(f => f.date === ds).reduce((s, f) => s + f.minutes, 0);
      days.push({ date: ds, mins });
    }
    const maxMins = Math.max(...days.map(d => d.mins), 60);
    // 完成率
    const doneCount = tasks.filter(t => t.done).length;
    const total = tasks.length;
    const pct = total ? Math.round(doneCount / total * 100) : 0;
    // 预估 vs 实际(规划谬误检测)
    const paired = tasks.filter(t => t.done && t.actualHours && t.estHours);
    const bias = paired.length ? paired.reduce((s, t) => s + (t.actualHours - t.estHours), 0) / paired.length : 0;

    document.getElementById('main-content').innerHTML = `
      <div class="page-hdr"><h2>数据复盘</h2><p>反馈是目标理论的关键一环 · 每周看一次</p></div>

      <div class="stat-grid">
        <div class="stat"><div class="v">${pct}%</div><div class="l">任务完成率</div></div>
        <div class="stat"><div class="v">${focus.reduce((s, f) => s + f.minutes, 0)}m</div><div class="l">累计专注</div></div>
        <div class="stat"><div class="v">${paired.length}</div><div class="l">已校准任务</div></div>
      </div>

      <div class="card">
        <div class="card-title">近 7 日专注(分钟)</div>
        <div class="bars">
          ${days.map(d => `
            <div class="bar-col">
              <div class="bar-val">${d.mins ? Math.round(d.mins / 60 * 10) / 10 + 'h' : ''}</div>
              <div class="bar-fill" style="height:${Math.max(4, Math.round(d.mins / maxMins * 100))}%"></div>
              <div class="bar-label">${d.date.slice(5)}</div>
            </div>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-title">规划谬误检测 <span class="more">预估 vs 实际</span></div>
        ${paired.length ? `
          <p style="font-size:13px;color:var(--text);margin-bottom:8px">已完成任务平均偏差:<b style="color:${bias > 0 ? 'var(--red)' : 'var(--green)'}">${bias > 0 ? '+' : ''}${Math.round(bias * 10) / 10}h</b>
          ${bias > 0 ? '—— 你的预估普遍偏乐观,建议下次预估 ×' + (1.5).toFixed(1) + '~2 缓冲(参照类别预测)' : '—— 预估很准,继续保持!'}</p>
          <div style="max-height:180px;overflow-y:auto">
          ${paired.map(t => `<div class="bias-row"><span>${App.esc(t.title)}</span><span>预估 ${t.estHours}h / 实际 ${t.actualHours}h</span></div>`).join('')}
          </div>` : '<div class="empty">完成几个任务并记录实际时长后,这里会显示你的预估偏差(规划谬误警报)。</div>'}
      </div>

      <div class="card science">
        <div class="card-title">科学依据 <span class="more">研究引用</span></div>
        <p><b>反馈:</b>${App.esc(STUDIES.find(s => s.id === 'goal-setting').claim)}</p>
        <div class="science-src">${App.esc(STUDIES.find(s => s.id === 'goal-setting').source)}</div>
        <p style="margin-top:10px"><b>大脑机制:</b>${App.esc(STUDIES.find(s => s.id === 'neuroscience').claim)}</p>
        <div class="science-src">${App.esc(STUDIES.find(s => s.id === 'neuroscience').source)}</div>
      </div>
    `;
  },
};

// ============ 更多页 ============
const MoreView = {
  show() {
    const s = Store.getSettings();
    document.getElementById('main-content').innerHTML = `
      <div class="page-hdr"><h2>更多</h2></div>
      <div class="card">
        <div class="card-title">设置</div>
        <div class="form-group">
          <label class="form-label">我的称呼</label>
          <input class="form-input" id="m-name" value="${App.esc(s.name)}">
        </div>
        <div class="form-group">
          <label class="form-label">目标名称(如:考研 / 毕业设计 / 马拉松)</label>
          <input class="form-input" id="m-target" value="${App.esc(s.targetName)}">
        </div>
        <div class="form-group">
          <label class="form-label">目标日期</label>
          <input type="date" class="form-input" id="m-date" value="${App.esc(s.targetDate)}">
        </div>
        <button class="btn btn-primary btn-block" onclick="MoreView.save()">保存设置</button>
      </div>
      <div class="card">
        <div class="card-title">数据</div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-soft btn-block" onclick="MoreView.exportData()">导出 JSON</button>
          <button class="btn btn-soft btn-block" onclick="MoreView.importData()">导入 JSON</button>
        </div>
        <div style="margin-top:10px;font-size:11px;color:var(--text-hint)">数据 100% 存在本机浏览器(localStorage),无任何服务器。</div>
      </div>
      <div class="card science">
        <div class="card-title">前沿科学依据 · 全部功能溯源</div>
        ${STUDIES.map(st => `
          <div class="study-item">
            <div class="study-tag">${App.esc(st.tag)}</div>
            <div class="study-title">${App.esc(st.title)}</div>
            <p>${App.esc(st.claim)}</p>
            <div class="science-src">${App.esc(st.source)}</div>
          </div>`).join('')}
      </div>
      <div style="text-align:center;font-size:11px;color:var(--text-hint);padding:10px 0 24px">知程 v1.0 · 循证规划 · 纯前端 · MIT</div>
    `;
  },

  save() {
    const s = Store.getSettings();
    s.name = document.getElementById('m-name').value.trim() || '同学';
    s.targetName = document.getElementById('m-target').value.trim();
    s.targetDate = document.getElementById('m-date').value;
    Store.setSettings(s);
    App.toast('设置已保存 ✓');
    MoreView.show();
  },

  exportData() {
    const data = {
      settings: Store.getSettings(), goals: Store.getGoals(), tasks: Store.getTasks(), focus: Store.getFocus(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'planwise-backup-' + App.todayStr() + '.json';
    a.click();
    App.toast('已导出备份 ✓');
  },

  importData() {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.json';
    inp.onchange = () => {
      const f = inp.files[0];
      if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const d = JSON.parse(reader.result);
          if (d.settings) Store.setSettings(d.settings);
          if (d.goals) Store.setGoals(d.goals);
          if (d.tasks) Store.setTasks(d.tasks);
          if (d.focus) Store.setFocus(d.focus);
          App.toast('导入成功 ✓');
          App.navigate('home');
        } catch (e) { App.toast('导入失败:文件格式错误'); }
      };
      reader.readAsText(f);
    };
    inp.click();
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
