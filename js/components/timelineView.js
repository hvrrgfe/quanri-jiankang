// ===== 时间线视图 =====
// 全日健康核心UI — 零emoji版本

const TimelineView = {
  show() {
    const p = Store.getProfile();
    if (!p) { Helpers.toast('请先设置档案'); return; }
    if (!p.fullProfile) { App.startWizard(); return; }

    this._cards = TimelineEngine.generate(p);
    this._progress = TimelineEngine.calculateProgress(this._cards);
    this._render();
  },

  _render() {
    const h = new Date().getHours();
    const greet = h < 12 ? '早上好' : h < 18 ? '下午好' : '晚上好';
    const sections = this._group(this._cards);
    const el = document.getElementById('main-content');

    el.innerHTML = `
<div style="padding:0 4px">
  <div style="margin-bottom:20px">
    <div style="font-size:24px;font-weight:700;color:var(--text)">${greet}</div>
    <div style="font-size:13px;color:var(--text-soft);margin-bottom:12px">
      今天 ${Helpers.formatDate(new Date(),'MM月DD日')} ${['周日','周一','周二','周三','周四','周五','周六'][new Date().getDay()]}
    </div>
    <div style="height:4px;background:var(--line);border-radius:2px;overflow:hidden">
      <div style="height:100%;width:${this._progress}%;background:var(--green);border-radius:2px;transition:width 0.5s"></div>
    </div>
    <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-hint);margin-top:2px">
      <span>今日完成</span>
      <span>${this._progress}%</span>
    </div>
  </div>
  <div>${sections.map(s => this._sec(s)).join('')}</div>
</div>`;
  },

  _group(cards) {
    const defs = {
      morning: { label: '早晨', range: [5,9] },
      am:      { label: '上午', range: [9,12] },
      noon:    { label: '中午', range: [12,14] },
      pm:      { label: '下午', range: [14,18] },
      evening: { label: '晚间', range: [18,21] },
      night:   { label: '睡前', range: [21,5] },
    };
    const r = [];
    Object.entries(defs).forEach(([k, v]) => {
      const [s, e] = v.range;
      const cc = cards.filter(c => {
        const h = parseInt(c.time.split(':')[0]);
        return e > s ? (h >= s && h < e) : (h >= s || h < e);
      });
      if (cc.length) r.push({ label: v.label, cards: cc });
    });
    return r;
  },

  _sec(s) {
    return `
<div style="margin-bottom:16px">
  <div style="font-size:11px;font-weight:600;color:var(--text-hint);letter-spacing:0.5px;margin-bottom:6px;padding-left:2px">${s.label}</div>
  ${s.cards.map(c => this._card(c)).join('')}
</div>`;
  },

  colors: { diet:'#C49A6C', exercise:'#E88A6A', posture:'#F0D67A', sleep:'#B8A9C4', mental:'#8EA9C4', plan:'#7A9A6E', base:'#B0B0B0' },

  _card(c) {
    const co = this.colors[c.module] || this.colors.base;
    const iconMap = {
      wakeup: 'sun', stretch: 'sun', intention: 'heart', plan: 'menu',
      breakfast: 'breakfast', lunch: 'lunch', dinner: 'dinner',
      sit1: 'clock', sit2: 'clock', sit3: 'clock',
      breath1: 'info', breath2: 'info',
      micro1: 'clock', micro2: 'clock',
      gratitude: 'star', review: 'star',
      walk: 'walk', eye_break: 'search',
      exercise: 'heartRate', sleep_prep: 'moon', sleep: 'moon',
      posture_check: 'user', plan_check: 'check',
    };
    const icon = Icons._(iconMap[c.id] || 'clock');

    return `
<div onclick="TimelineView._action('${c.id}','${c.module}','${c.type}')" style="display:flex;align-items:center;gap:10px;padding:12px 14px;margin-bottom:6px;background:var(--card);border-radius:16px;border:1px solid var(--line-light);cursor:pointer">
  <div style="width:3px;height:32px;border-radius:2px;background:${co};flex-shrink:0"></div>
  <div style="flex:1;min-width:0">
    <div style="font-size:15px;font-weight:500;color:var(--text)">${c.label}</div>
    ${c.desc ? '<div style="font-size:12px;color:var(--text-soft);margin-top:1px">' + c.desc + '</div>' : ''}
  </div>
  <div style="display:flex;align-items:center;gap:6px">
    ${icon}
    <span style="font-size:12px;color:var(--text-hint)">${c.time}</span>
  </div>
</div>`;
  },

  _action(id, module, type) {
    if (id === 'breath1' || id === 'breath2') return BreathingGuide.show('B03');
    if (id === 'sleep_prep') return SleepChecklist.show();
    if (module === 'mental' && type === 'intention') return this._showIntention();
    if (module === 'plan' && type === 'input') return this._showPlan();
    if (module === 'posture' && (type === 'action' || id === 'stretch')) return this._showStretch();
    if (module === 'mental' && (type === 'action' || type === 'reflection')) return this._showBreathing();
    Helpers.toast('开发中');
  },

  _showIntention() {
    const pool = MentalHealthDB.intentionPool;
    const chips = pool.map(i => `<span class="chip" style="padding:6px 16px;border-radius:20px;margin:3px" onclick="TimelineView._pick('${i.text}')">${i.text}</span>`).join('');
    Helpers.openModal(
      '<div style="font-size:18px;font-weight:600;margin-bottom:4px">今日意图</div>' +
      '<div style="font-size:13px;color:var(--text-soft);margin-bottom:14px">今天想成为一个怎样的人？选一个词</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:4px">' + chips + '</div>' +
      '<div style="margin-top:12px;text-align:center"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">算了</button></div>'
    );
  },
  _pick(text) { Helpers.closeModal(); Helpers.toast('今日意图 ' + text); },

  _showBreathing() {
    const ex = MentalHealthDB.breathingExercises[0];
    Helpers.openModal(
      '<div style="font-size:18px;font-weight:600;margin-bottom:4px">' + ex.name + '</div>' +
      '<div style="font-size:13px;color:var(--text-soft);margin-bottom:12px">' + ex.desc + '</div>' +
      '<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px">' +
        ex.steps.map(s => '<div style="font-size:13px;padding:6px 10px;background:var(--brand-bg);border-radius:6px">' + s + '</div>').join('') +
      '</div>' +
      '<div style="text-align:center"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">关闭</button></div>'
    );
  },

  _showPlan() {
    Helpers.openModal(
      '<div style="font-size:18px;font-weight:600;margin-bottom:10px">今天的三件事</div>' +
      '<input type="text" class="form-input" id="p1" placeholder="第一件事" style="margin-bottom:6px">' +
      '<input type="text" class="form-input" id="p2" placeholder="第二件事" style="margin-bottom:6px">' +
      '<input type="text" class="form-input" id="p3" placeholder="第三件事">' +
      '<div style="margin-top:10px"><button class="btn btn-primary btn-sm btn-block" onclick="Helpers.closeModal();Helpers.toast(\'已记录\')">确定</button></div>'
    );
  },

  _showStretch() {
    const items = ExerciseDB.stretch.slice(0, 4).map(s =>
      '<div style="display:flex;justify-content:space-between;padding:6px 10px;font-size:13px;background:var(--brand-bg);border-radius:6px;margin-bottom:4px">' +
      '<span>' + s.name + '</span><span style="color:var(--text-soft)">' + s.duration + s.unit + '</span></div>'
    ).join('');
    Helpers.openModal(
      '<div style="font-size:18px;font-weight:600;margin-bottom:8px">拉伸</div>' +
      items +
      '<div style="text-align:center;margin-top:10px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">完成</button></div>'
    );
  },
};
