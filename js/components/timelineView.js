// ===== 时间线视图 =====
// 全日健康核心UI

const TimelineView = {
  show() {
    const p = Store.getProfile();
    if (!p) { Helpers.toast('请先设置档案'); return; }
    if (!p.fullProfile) {
      // 自动开始完整设置
      App.startWizard();
      return;
    }

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
      morning:    { label: '早晨',   range: [5,9] },
      am:         { label: '上午',   range: [9,12] },
      noon:       { label: '中午',   range: [12,14] },
      pm:         { label: '下午',   range: [14,18] },
      evening:    { label: '晚间',   range: [18,21] },
      night:      { label: '睡前',   range: [21,5] },
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
    return `
<div onclick="TimelineView._action('${c.id}','${c.module}','${c.type}')" style="display:flex;align-items:center;gap:10px;padding:12px 14px;margin-bottom:6px;background:var(--card);border-radius:16px;border:1px solid var(--line-light);cursor:pointer">
  <div style="width:3px;height:32px;border-radius:2px;background:${co};flex-shrink:0"></div>
  <div style="flex:1;min-width:0">
    <div style="font-size:15px;font-weight:500;color:var(--text)">${c.label}</div>
    ${c.desc ? `<div style="font-size:12px;color:var(--text-soft);margin-top:1px">${c.desc}</div>` : ''}
  </div>
  <div style="font-size:12px;color:var(--text-hint);white-space:nowrap">${c.time}</div>
</div>`;
  },

  _action(id, module, type) {
    const handlers = {
      mental: { intention: () => this._showIntention(), breathing: () => this._showBreathing('B03'), gratitude: () => this._showGratitude(), review: () => this._showReview() },
      plan: { input: () => this._showPlan() },
      posture: { stretch: () => this._showStretch(), micro: () => this._showMicro() },
    };
    const h = handlers[module]?.[type];
    if (h) h();
    else Helpers.toast(module + ' · ' + type + '（开发中）');
  },

  // ---- 心理：今日意图 ----
  _showIntention() {
    const pool = MentalHealthDB.intentionPool;
    const html = pool.map(i => `<span class="chip" style="padding:6px 16px;font-size:14px;border-radius:20px;margin:3px" onclick="TimelineView._pickIntention('${i.text}')">${i.text}</span>`).join('');
    Helpers.openModal(`
      <div style="font-size:18px;font-weight:600;margin-bottom:4px">今天想成为一个怎样的人？</div>
      <div style="font-size:13px;color:var(--text-soft);margin-bottom:14px">选一个词作为今天的意图</div>
      <div style="display:flex;flex-wrap:wrap;gap:4px">${html}</div>
      <div style="margin-top:12px;text-align:center"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">算了</button></div>
    `);
  },
  _pickIntention(text) {
    Helpers.closeModal();
    Helpers.toast('今日意图：' + text + ' ✅');
  },

  // ---- 心理：呼吸 ----
  _showBreathing(id) {
    const ex = MentalHealthDB.breathingExercises.find(e => e.id === id) || MentalHealthDB.breathingExercises[0];
    Helpers.openModal(`
      <div style="font-size:18px;font-weight:600;margin-bottom:4px">${ex.name}</div>
      <div style="font-size:13px;color:var(--text-soft);margin-bottom:12px">${ex.desc}</div>
      <div style="background:var(--brand-bg);border-radius:12px;padding:14px;margin-bottom:10px;text-align:center">
        <div id="breath-display" style="font-size:32px;font-weight:700;color:var(--brand);margin-bottom:8px">准备</div>
        <div id="breath-count" style="font-size:14px;color:var(--text-soft)">${ex.rounds}轮</div>
        <div style="margin-top:10px"><button class="btn btn-primary btn-sm" onclick="TimelineView._startBreathing()">开始</button></div>
      </div>
      <div style="font-size:11px;color:var(--text-hint)">${ex.science}</div>
      <div style="text-align:center;margin-top:10px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">关闭</button></div>
    `);
  },
  _startBreathing() {
    Helpers.toast('呼吸练习开始（动画开发中）');
  },

  // ---- 心理：感恩三秒 ----
  _showGratitude() {
    Helpers.openModal(`
      <div style="font-size:18px;font-weight:600;margin-bottom:4px">感恩三秒</div>
      <div style="font-size:14px;color:var(--text-soft);line-height:1.7;margin-bottom:14px">
        花3秒在心里想一件<br>今天值得感恩的事。
      </div>
      <div style="font-size:12px;color:var(--text-hint);margin-bottom:12px;padding:10px;background:var(--brand-bg);border-radius:12px">
        可以是一件很小的事：<br>
        "今天的阳光很好"<br>
        "咖啡很好喝"<br>
        "刚才有人给我让座"
      </div>
      <div style="text-align:center">
        <button class="btn btn-primary btn-sm" onclick="Helpers.closeModal();Helpers.toast('🎉')">想好了 ✅</button>
      </div>
    `);
  },

  // ---- 心理：今日回顾 ----
  _showReview() {
    const d = new Date();
    const dayStr = d.getFullYear() + '年' + (d.getMonth()+1) + '月' + d.getDate() + '日';
    Helpers.openModal(`
      <div style="font-size:18px;font-weight:600;margin-bottom:4px">今日回顾</div>
      <div style="font-size:12px;color:var(--text-soft);margin-bottom:14px">${dayStr}</div>
      <div style="font-size:13px;color:var(--text);line-height:1.7;margin-bottom:14px">
        今天过得怎么样？<br>
        在心里过一遍就好。
      </div>
      <div style="text-align:center">
        <button class="btn btn-primary btn-sm" onclick="Helpers.closeModal();Helpers.toast('晚安')">好了 ✅</button>
      </div>
    `);
  },

  // ---- 计划：每日三件事 ----
  _showPlan() {
    Helpers.openModal(`
      <div style="font-size:18px;font-weight:600;margin-bottom:10px">今天的三件事</div>
      <div style="margin-bottom:10px">
        <input type="text" class="form-input" id="plan-1" placeholder="第一件事" style="margin-bottom:6px">
        <input type="text" class="form-input" id="plan-2" placeholder="第二件事" style="margin-bottom:6px">
        <input type="text" class="form-input" id="plan-3" placeholder="第三件事">
      </div>
      <button class="btn btn-primary btn-sm btn-block" onclick="var a=document.getElementById('plan-1').value;Helpers.closeModal();if(a)Helpers.toast('已记录 ✅')">确定</button>
    `);
  },

  // ---- 体态：拉伸 ----
  _showStretch() {
    const pool = ExerciseDB.stretch.slice(0, 4);
    const html = pool.map(s => `<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;margin-bottom:4px;background:var(--brand-bg);border-radius:8px;font-size:13px"><span style="font-weight:600">${s.name}</span><span style="color:var(--text-soft)">${s.duration}${s.unit}</span></div>`).join('');
    Helpers.openModal(`
      <div style="font-size:18px;font-weight:600;margin-bottom:8px">晨间拉伸</div>
      <div style="font-size:12px;color:var(--text-soft);margin-bottom:10px">每个动作保持15-30秒</div>
      ${html}
      <div style="text-align:center;margin-top:10px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">完成</button></div>
    `);
  },

  // ---- 体态：微运动 ----
  _showMicro() {
    const pool = ExerciseDB.micro.slice(0, 3);
    const html = pool.map(m => `<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;margin-bottom:4px;background:var(--brand-bg);border-radius:8px;font-size:13px"><span style="font-weight:600">${m.name}</span><span style="color:var(--text-soft)">${m.reps}${m.unit}</span></div>`).join('');
    Helpers.openModal(`
      <div style="font-size:18px;font-weight:600;margin-bottom:8px">微运动</div>
      ${html}
      <div style="text-align:center;margin-top:10px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">完成</button></div>
    `);
  },
};
