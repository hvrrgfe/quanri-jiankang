// ===== 计划模块 =====
// AI全面规划今日计划 + 问卷补充

const PlanView = {
  _tasks: [],
  _note: '',

  show() {
    const p = Store.getProfile();
    if (!p) { Helpers.toast('请先设置档案'); return; }

    // 加载今日计划
    const today = Helpers.formatDate(new Date(), 'YYYY-MM-DD');
    const saved = Store.get('dailyTasks', {});
    this._tasks = saved[today] || [];
    this._note = saved[today + '_note'] || '';

    // 如果没有计划且用户有API Key，尝试AI生成
    if (this._tasks.length === 0 && Store.getApiKey()) {
      this._generateWithAI(p);
    } else {
      this._render();
    }
  },

  async _generateWithAI(profile) {
    const el = document.getElementById('main-content');
    el.innerHTML = Icons.replace(`
<div style="padding:0 4px;text-align:center">
  <div style="padding:60px 20px">
    <div style="font-size:14px;color:var(--text-soft)">AI 正在生成今日计划...</div>
  </div>
</div>`);

    try {
      const result = await AIHealth.generate('plan', profile);
      if (result && result.tasks) {
        this._tasks = result.tasks.map(t => ({ text: t, done: false }));
        this._note = result.note || '';
        const today = Helpers.formatDate(new Date(), 'YYYY-MM-DD');
        const saved = Store.get('dailyTasks', {});
        saved[today] = this._tasks;
        saved[today + '_note'] = this._note;
        Store.set('dailyTasks', saved);
      }
    } catch (e) {
      console.warn('AI plan failed:', e);
    }
    this._render();
  },

  _render() {
    const el = document.getElementById('main-content');
    const today = Helpers.formatDate(new Date(), 'YYYY-MM-DD');
    const done = this._tasks.filter(t => t.done).length;
    const total = this._tasks.length;
    const pct = total > 0 ? Math.round(done / total * 100) : 0;

    el.innerHTML = Icons.replace(`
<div style="padding:0 4px">
  <div style="font-size:22px;font-weight:700;margin-bottom:2px">今日计划</div>
  <div style="font-size:13px;color:var(--text-soft);margin-bottom:16px">${Helpers.formatDate(new Date(), 'MM月DD日')} ${['周日','周一','周二','周三','周四','周五','周六'][new Date().getDay()]}</div>

  <!-- 进度 -->
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
    <div style="flex:1;height:4px;background:var(--line);border-radius:2px;overflow:hidden">
      <div style="height:100%;width:${pct}%;background:var(--green);border-radius:2px;transition:width 0.5s"></div>
    </div>
    <span style="font-size:13px;color:var(--text-soft)">${done}/${total}</span>
  </div>

  <!-- 任务列表 -->
  <div style="margin-bottom:16px">
    ${this._tasks.length === 0 ? `
    <div style="text-align:center;padding:30px;color:var(--text-soft);font-size:13px">
      今天还没有计划<br>
      <button class="btn btn-primary btn-sm" onclick="PlanView._addTask()" style="margin-top:10px">添加第一件事</button>
      ${Store.getApiKey() ? '<br><button class="btn btn-soft btn-sm" onclick="PlanView.show()" style="margin-top:6px">AI 生成</button>' : ''}
    </div>` : this._tasks.map((t, i) => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;margin-bottom:4px;background:var(--card);border-radius:14px;border:1px solid var(--line-light)">
      <div onclick="PlanView._toggle(${i})" style="width:22px;height:22px;border-radius:50%;border:2px solid ${t.done ? 'var(--green)' : 'var(--line)'};background:${t.done ? 'var(--green)' : 'transparent'};cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0">
        ${t.done ? '<span style="color:white;font-size:12px">&#10003;</span>' : ''}
      </div>
      <span style="flex:1;font-size:15px;${t.done ? 'text-decoration:line-through;color:var(--text-hint)' : 'color:var(--text)'}">${t.text}</span>
      <span onclick="PlanView._delete(${i})" style="color:var(--text-hint);cursor:pointer;font-size:13px">&#10005;</span>
    </div>`).join('')}
  </div>

  ${this._note ? '<div style="font-size:13px;color:var(--text-soft);margin-bottom:12px;padding:10px;background:var(--brand-bg);border-radius:12px">' + this._note + '</div>' : ''}

  <!-- 操作栏 -->
  <div style="display:flex;gap:6px">
    <button class="btn btn-primary btn-sm flex-1" onclick="PlanView._addTask()">+ 添加</button>
    ${Store.getApiKey() ? '<button class="btn btn-soft btn-sm flex-1" onclick="PlanView._regen()">AI 重新规划</button>' : ''}
    ${this._tasks.length > 0 ? '<button class="btn btn-outline btn-sm" onclick="PlanView._clear()">清空</button>' : ''}
  </div>

  <!-- 问卷入口 -->
  <div style="margin-top:16px;padding:12px;background:var(--card);border-radius:14px;border:1px solid var(--line-light)">
    <div style="font-size:14px;font-weight:600;margin-bottom:4px">健康问卷</div>
    <div style="font-size:12px;color:var(--text-soft);margin-bottom:8px">完成健康评估，AI 能给出更贴合你的计划</div>
    <button class="btn btn-outline btn-sm btn-block" onclick="PlanView._startSurvey()">开始评估</button>
  </div>
</div>`);
  },

  _toggle(i) {
    if (this._tasks[i]) this._tasks[i].done = !this._tasks[i].done;
    this._save();
    this._render();
  },

  _delete(i) {
    this._tasks.splice(i, 1);
    this._save();
    this._render();
  },

  _addTask() {
    Helpers.openModal(
      '<div style="font-size:18px;font-weight:600;margin-bottom:10px">添加任务</div>' +
      '<input class="form-input" id="new-task-input" placeholder="输入任务" style="margin-bottom:10px" onkeydown="if(event.key===\'Enter\')PlanView._saveNew()">' +
      '<button class="btn btn-primary btn-sm btn-block" onclick="PlanView._saveNew()">添加</button>'
    );
    setTimeout(() => document.getElementById('new-task-input')?.focus(), 100);
  },

  _saveNew() {
    const input = document.getElementById('new-task-input');
    if (!input || !input.value.trim()) return;
    this._tasks.push({ text: input.value.trim(), done: false });
    this._save();
    this._render();
    Helpers.closeModal();
  },

  _regen() {
    const p = Store.getProfile();
    if (p) this._generateWithAI(p);
  },

  _clear() {
    this._tasks = [];
    this._note = '';
    this._save();
    this._render();
  },

  _startSurvey() {
    App.navigate('survey');
  },

  _save() {
    const today = Helpers.formatDate(new Date(), 'YYYY-MM-DD');
    const saved = Store.get('dailyTasks', {});
    saved[today] = this._tasks;
    saved[today + '_note'] = this._note;
    Store.set('dailyTasks', saved);
  },
};
