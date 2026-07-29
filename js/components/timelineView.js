// ===== 时间线视图 =====
// 全日健康核心UI — 零emoji版本

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
    const sections = this._group(this._cards);
    const el = document.getElementById('main-content');

    const isFull = this._profile && this._profile.fullProfile;
    const streak = this._getStreak(this._progress);

    el.innerHTML = `
<div style="padding:0 4px">
  ${!isFull ? `
  <div style="background:var(--brand-bg);border-radius:12px;padding:10px 14px;margin-bottom:12px;display:flex;align-items:center;gap:8px;font-size:13px">
    <span style="flex:1">完善档案可使用全部功能</span>
    <span onclick="App.startWizard()" style="color:var(--brand);font-weight:600;cursor:pointer">去设置</span>
  </div>` : ''}
  <div style="margin-bottom:20px">
    <div style="font-size:24px;font-weight:700;color:var(--text)">${greet}</div>
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <div style="font-size:13px;color:var(--text-soft)">${Helpers.formatDate(new Date(),'MM月DD日')} ${['周日','周一','周二','周三','周四','周五','周六'][new Date().getDay()]}</div>
      ${streak.count > 0 ? `<div style="font-size:12px;color:var(--brand);font-weight:600">${streak.count} 天连续</div>` : ''}
    </div>
    <div style="display:flex;align-items:center;gap:12px">
      <div style="flex:1">
        <div style="height:4px;background:var(--line);border-radius:2px;overflow:hidden">
          <div style="height:100%;width:${this._progress}%;background:var(--green);border-radius:2px;transition:width 1s ease"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-hint);margin-top:2px">
          <span>${streak.msg}</span>
          <span>${this._progress}%</span>
        </div>
      </div>
    </div>
  </div>

  <!-- 模块快捷入口 -->
  <div style="display:flex;gap:6px;margin-bottom:16px">
    ${[
      { label: '饮食', page: 'plan', color: '#C49A6C' },
      { label: '运动', page: 'exercise', color: '#E88A6A' },
      { label: '睡眠', page: 'sleep', color: '#B8A9C4' },
      { label: '心理', page: 'mental', color: '#8EA9C4' },
      { label: '设置', page: 'profile', color: '#B0B0B0' },
    ].map(m => `
    <div onclick="App.navigate('${m.page}')" style="flex:1;background:var(--card);border-radius:12px;padding:10px;text-align:center;border:1px solid var(--line-light);cursor:pointer">
      <div style="font-size:12px;font-weight:500;color:${m.color}">${m.label}</div>
    </div>`).join('')}
  </div>

  <div>${sections.map(s => this._sec(s)).join('')}</div>
</div>`;
  },

  _getStreak(progress) {
    const today = Helpers.formatDate(new Date(), 'YYYY-MM-DD');
    const saved = Store.get('dailyProgress', {});
    // 保存今天进度
    saved[today] = progress;
    Store.set('dailyProgress', saved);

    // 计算连续天数
    const dates = Object.keys(saved).sort().reverse();
    let count = 0;
    const todayDone = progress >= 50;
    if (!todayDone) return { count: 0, msg: '完成 50% 算达标' };

    // 从今天往前数连续天数
    for (let i = 0; i < dates.length; i++) {
      const d = dates[i];
      if (i === 0 && d !== today) break; // 今天没记录
      if (i > 0) {
        const prev = new Date(dates[i-1]);
        const curr = new Date(d);
        const diff = (prev - curr) / (1000*60*60*24);
        if (diff > 1.5) break; // 断了一天
      }
      if (saved[d] >= 50) count++;
    }

    const msgs = [
      [0, '今天还没完成任何项目'],
      [30, '好的开始，继续加油'],
      [50, '完成一半了，不错'],
      [70, '超过一半，继续保持'],
      [90, '就差一点了'],
      [100, '今天全完成了！'],
    ];
    let msg = '';
    for (const [threshold, text] of msgs) {
      if (progress >= threshold) msg = text;
    }
    if (count >= 3) msg += ' 连续' + count + '天 ';

    return { count, msg };
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
    if (module === 'posture' && type === 'alert') {
      Helpers.openModal(
        '<div style="font-size:18px;font-weight:600;margin-bottom:6px">该活动一下了</div>' +
        '<div style="font-size:14px;color:var(--text-soft);line-height:1.7;margin-bottom:12px">' +
        '长时间保持同一姿势会增加肌肉疲劳和脊柱压力。<br>站起来活动2分钟就能显著改善循环。</div>' +
        '<button class="btn btn-primary btn-sm btn-block" onclick="Helpers.closeModal()">好，站起来</button>'
      ); return;
    }
    if (module === 'posture' && type === 'action') return this._showStretch();
    if (module === 'posture' && type === 'check') {
      Helpers.openModal(
        '<div style="font-size:18px;font-weight:600;margin-bottom:6px">坐姿检查</div>' +
        PostureDB.sittingChecklist.map(function(c){
          return '<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;margin-bottom:4px;background:var(--brand-bg);border-radius:8px;font-size:13px">' +
            '<span style="color:var(--green)">&#10003;</span>' + c.item + '</div>';
        }).join('') +
        '<button class="btn btn-outline btn-sm btn-block" onclick="Helpers.closeModal()" style="margin-top:8px">检查好了</button>'
      ); return;
    }
    if (module === 'mental' && type === 'reflection') return this._showBreathing();
    if (id === 'walk') {
      Helpers.openModal(
        '<div style="font-size:18px;font-weight:600;margin-bottom:6px">饭后散步</div>' +
        '<div style="font-size:13px;color:var(--text-soft);margin-bottom:10px">饭后散步10分钟有助于控制餐后血糖</div>' +
        '<div style="background:var(--brand-bg);border-radius:12px;padding:20px;text-align:center">' +
        '<div style="font-size:36px;font-weight:700;color:var(--brand)">10</div>' +
        '<div style="font-size:13px;color:var(--text-soft)">分钟</div></div>' +
        '<button class="btn btn-outline btn-sm btn-block" onclick="Helpers.closeModal()" style="margin-top:8px">走好了</button>'
      ); return;
    }
    if (id === 'eye_break') {
      Helpers.openModal(
        '<div style="font-size:18px;font-weight:600;margin-bottom:6px">眼部放松</div>' +
        '<div style="font-size:13px;color:var(--text-soft);margin-bottom:10px">20-20-20法则：每20分钟看20英尺外20秒</div>' +
        '<div style="font-size:13px;line-height:1.7">' +
        '1. 看远处（6米外）20秒<br>' +
        '2. 用力闭眼再睁开，重复3次<br>' +
        '3. 搓热手掌轻敷眼部30秒</div>' +
        '<button class="btn btn-outline btn-sm btn-block" onclick="Helpers.closeModal()" style="margin-top:8px">好了</button>'
      ); return;
    }
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
