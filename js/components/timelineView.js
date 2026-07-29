// ===== 时间线视图 =====
// 全日健康核心UI — 按设计规范重新实现

const TimelineView = {
  show() {
    const p = Store.getProfile();
    if (!p) { Helpers.toast('请先设置档案'); return; }

    this._cards = TimelineEngine.generate(p);
    this._progress = TimelineEngine.calculateProgress(this._cards);
    this._profile = p;
    this._render();
  },

  _render() {
    const h = new Date().getHours();
    const greet = h < 12 ? '早上好' : h < 18 ? '下午好' : '晚上好';
    const today = Helpers.formatDate(new Date(), 'MM月DD日');
    const day = ['周日','周一','周二','周三','周四','周五','周六'][new Date().getDay()];
    const sections = this._group(this._cards);
    const streak = this._getStreak(this._progress);
    const el = document.getElementById('main-content');

    el.innerHTML = `
<div style="padding:0">
  <div style="margin-bottom:24px">
    <div style="font-size:28px;font-weight:700;color:var(--text);margin-bottom:2px;letter-spacing:-0.3px">${greet}</div>
    <div style="font-size:13px;color:var(--text-soft);margin-bottom:16px">${today} ${day}</div>

    <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
      <div style="flex:1;height:6px;background:var(--line);border-radius:3px;overflow:hidden">
        <div style="height:100%;width:${this._progress}%;background:var(--green);border-radius:3px;transition:width 1s ease"></div>
      </div>
      <span style="font-size:13px;font-weight:600;color:${this._progress >= 80 ? 'var(--green)' : this._progress >= 50 ? 'var(--brand)' : 'var(--text-soft)'}">${this._progress}%</span>
    </div>

    <div style="display:flex;gap:8px;font-size:12px;color:var(--text-soft)">
      <span>${streak.msg}</span>
      ${streak.count > 0 ? `<span style="color:var(--brand);font-weight:600">${streak.count}天</span>` : ''}
    </div>
  </div>

  <!-- 时间线 -->
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
  <div style="font-size:12px;font-weight:600;color:var(--text-hint);letter-spacing:0.5px;margin-bottom:8px;padding-left:2px">${s.label}</div>
  ${s.cards.map(c => this._card(c)).join('')}
</div>`;
  },

  _card(c) {
    const colors = { diet:'#C49A6C', exercise:'#E88A6A', posture:'#F0D67A', sleep:'#B8A9C4', mental:'#8EA9C4', plan:'#7A9A6E', base:'#B0B0B0' };
    const co = colors[c.module] || colors.base;
    const iconMap = {
      wakeup:'sun', stretch:'sun', intention:'star', plan:'menu',
      breakfast:'breakfast', lunch:'lunch', dinner:'dinner',
      sit1:'clock', sit2:'clock', sit3:'clock',
      breath1:'info', breath2:'info',
      micro1:'clock', micro2:'clock',
      gratitude:'star', review:'star',
      walk:'walk', eye_break:'search',
      exercise:'sun', sleep_prep:'moon', sleep:'moon',
      posture_check:'user', plan_check:'check',
    };
    const icon = Icons._(iconMap[c.id] || 'clock');
    return `
<div onclick="TimelineView._action('${c.id}','${c.module}','${c.type}')" style="display:flex;align-items:center;gap:10px;padding:12px 16px;margin-bottom:6px;background:var(--card);border-radius:16px;border:1px solid var(--line-light);cursor:pointer;transition:all 0.15s">
  <div style="width:3px;height:36px;border-radius:2px;background:${co};flex-shrink:0"></div>
  <div style="flex:1;min-width:0">
    <div style="font-size:15px;font-weight:500;color:var(--text)">${c.label}</div>
    ${c.desc ? '<div style="font-size:12px;color:var(--text-soft);margin-top:1px">' + c.desc + '</div>' : ''}
  </div>
  <div style="display:flex;align-items:center;gap:6px">
    <span style="font-size:12px;color:var(--text-hint)">${c.time}</span>
  </div>
</div>`;
  },

  _getStreak(progress) {
    const today = Helpers.formatDate(new Date(), 'YYYY-MM-DD');
    const saved = Store.get('dailyProgress', {});
    saved[today] = progress;
    Store.set('dailyProgress', saved);
    const dates = Object.keys(saved).sort().reverse();
    let count = 0;
    const todayDone = progress >= 50;
    if (!todayDone) return { count: 0, msg: '完成50%达标' };
    for (let i = 0; i < dates.length; i++) {
      const d = dates[i];
      if (i === 0 && d !== today) break;
      if (i > 0) {
        const prev = new Date(dates[i-1]), curr = new Date(d);
        if ((prev - curr) / (1000*60*60*24) > 1.5) break;
      }
      if (saved[d] >= 50) count++;
    }
    const msgs = [
      [0,'还未开始'],[30,'好的开始'],[50,'完成一半'],[70,'继续加油'],[90,'就差一点'],[100,'全部完成']
    ];
    let msg = '';
    for (const [t, text] of msgs) if (progress >= t) msg = text;
    if (count >= 3) msg += ' · ' + count + '天';
    return { count, msg };
  },

  _action(id, module, type) {
    if (id === 'breath1' || id === 'breath2') return BreathingGuide.show('B03');
    if (id === 'sleep_prep') return SleepChecklist.show();
    if (id === 'walk') {
      Helpers.openModal(
        '<div style="font-size:18px;font-weight:600;margin-bottom:6px">饭后散步</div>' +
        '<div style="font-size:13px;color:var(--text-soft);margin-bottom:12px">餐后散步10分钟有助控血糖</div>' +
        '<div style="background:var(--brand-bg);border-radius:16px;padding:24px;text-align:center;margin-bottom:12px">' +
        '<div style="font-size:40px;font-weight:700;color:var(--brand)">10</div>' +
        '<div style="font-size:14px;color:var(--text-soft)">分钟</div></div>' +
        '<button class="btn btn-outline btn-sm btn-block" onclick="Helpers.closeModal()">完成</button>'
      ); return;
    }
    if (id === 'eye_break') {
      Helpers.openModal(
        '<div style="font-size:18px;font-weight:600;margin-bottom:6px">眼部放松</div>' +
        '<div style="font-size:13px;color:var(--text-soft);margin-bottom:10px">20-20-20法则</div>' +
        '<div style="font-size:13px;line-height:1.8;margin-bottom:12px">1. 看远处6米外20秒<br>2. 用力闭眼再睁开 x3<br>3. 搓热手掌敷眼30秒</div>' +
        '<button class="btn btn-outline btn-sm btn-block" onclick="Helpers.closeModal()">好了</button>'
      ); return;
    }
    if (module === 'mental' && type === 'intention') return this._showIntention();
    if (module === 'plan' && type === 'input') return this._showPlan();
    if (module === 'posture' && type === 'alert') {
      Helpers.openModal(
        '<div style="font-size:18px;font-weight:600;margin-bottom:6px">该活动一下</div>' +
        '<div style="font-size:14px;color:var(--text-soft);margin-bottom:14px">长时间保持同一姿势增加肌肉疲劳和脊柱压力</div>' +
        '<button class="btn btn-primary btn-sm btn-block" onclick="Helpers.closeModal()">好</button>'
      ); return;
    }
    Helpers.toast('开发中');
  },

  _showIntention() {
    const pool = MentalHealthDB.intentionPool;
    const chips = pool.map(i => `<span class="chip" style="padding:6px 16px;border-radius:20px;margin:3px;font-size:14px" onclick="TimelineView._pick('${i.text}')">${i.text}</span>`).join('');
    Helpers.openModal(
      '<div style="font-size:20px;font-weight:600;margin-bottom:4px">今日意图</div>' +
      '<div style="font-size:14px;color:var(--text-soft);margin-bottom:16px">想成为一个怎样的人？</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:4px">' + chips + '</div>' +
      '<div style="margin-top:16px;text-align:center"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">算了</button></div>'
    );
  },
  _pick(text) { Helpers.closeModal(); Helpers.toast('今日意图：' + text); },

  _showPlan() {
    Helpers.openModal(
      '<div style="font-size:20px;font-weight:600;margin-bottom:12px">今天的三件事</div>' +
      '<input class="form-input" id="tp1" placeholder="第一件事" style="margin-bottom:8px">' +
      '<input class="form-input" id="tp2" placeholder="第二件事" style="margin-bottom:8px">' +
      '<input class="form-input" id="tp3" placeholder="第三件事">' +
      '<div style="margin-top:12px"><button class="btn btn-primary btn-sm btn-block" onclick="Helpers.closeModal();Helpers.toast(\'已记录\')">确定</button></div>'
    );
  },
};
