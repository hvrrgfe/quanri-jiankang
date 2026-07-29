// ===== 时间线视图 =====
// 全日健康核心UI — 按设计规范重新实现

const TimelineView = {
  show() {
    const p = Store.getProfile();
    if (!p) { Helpers.toast('请先设置档案'); return; }

    this._cards = TimelineEngine.generate(p);
    this._profile = p;
    this._aiTips = null;
    this._aiSchedule = [];
    // 基于真实数据计算进度
    this._progress = TimelineEngine.calculateProgress(this._cards);
    this._loadTasks();
    this._render();
  },

  _loadTasks() {
    const today = Helpers.formatDate(new Date(), 'YYYY-MM-DD');
    const saved = Store.get('dailyTasks', {});
    this._tasks = saved[today] || [];
    this._taskNote = saved[today + '_note'] || '';
    this._aiSchedule = saved[today + '_schedule'] || [];
    this._aiTips = saved[today + '_tips'] || null;
    // AI生成每日作息（如果没有已保存的日程）
    if (this._aiSchedule.length === 0 && Store.getApiKey() && this._profile) {
      const el = document.getElementById('main-content');
      Helpers.showLoading(el, '正在生成今日安排...', '基于你的档案定制每日作息', 'plan');
      Helpers.setProgress('分析时型和作息习惯...');
      setTimeout(() => Helpers.setProgress('规划时间块...'), 600);
      setTimeout(() => Helpers.setProgress('生成饮食运动建议...'), 1200);
      AIHealth.generate('plan', this._profile).then(result => {
        if (!result) { this._render(); return; }
        this._aiSchedule = result.schedule || [];
        // 兼容新旧格式：新格式nutritionTips数组，旧格式nutritionTip字符串
        var nutTips = result.nutritionTips || (result.nutritionTip ? [result.nutritionTip] : []);
        this._aiTips = {
          nutrition: nutTips.join(' · '),
          exercise: result.exerciseTip || '',
          mental: result.mentalTip || '',
          reminders: result.postureReminders || [],
        };
        this._tasks = [];
        this._taskNote = result.summary || result.note || '';
        this._saveTasks();
        this._render();
      });
    }
  },

  _saveTasks() {
    const today = Helpers.formatDate(new Date(), 'YYYY-MM-DD');
    const saved = Store.get('dailyTasks', {});
    saved[today] = [];
    saved[today + '_note'] = this._taskNote;
    saved[today + '_schedule'] = this._aiSchedule || [];
    saved[today + '_tips'] = this._aiTips || {};
    Store.set('dailyTasks', saved);
  },

  _render() {
    const h = new Date().getHours();
    const greet = h < 12 ? '早上好' : h < 18 ? '下午好' : '晚上好';
    const today = Helpers.formatDate(new Date(), 'MM月DD日');
    const day = ['周日','周一','周二','周三','周四','周五','周六'][new Date().getDay()];
    const streak = this._getStreak(this._progress);

    // 昨晚睡眠摘要
    const yesterday = Helpers.formatDate(new Date(Date.now() - 86400000), 'YYYY-MM-DD');
    const sleepLog = Store.get('sleepLog', {});
    const lastSleep = sleepLog[yesterday] || sleepLog[Helpers.formatDate(new Date(), 'YYYY-MM-DD')] || {};
    const sleepSummary = lastSleep.bedTime ? '<div style="font-size:11px;color:var(--text-hint)">睡眠 ' + lastSleep.bedTime + '→' + lastSleep.wakeTime + (lastSleep.quality ? ' · ' + '★'.repeat(lastSleep.quality) + '☆'.repeat(5 - lastSleep.quality) : '') + '</div>' : '';

    const el = document.getElementById('main-content');
    Helpers.stopTipTimer();
    el.innerHTML = `
<div style="padding:0">
  <div style="margin-bottom:24px">
    <div style="font-size:28px;font-weight:700;color:var(--text);margin-bottom:2px;letter-spacing:-0.3px">${greet}</div>
    <div style="font-size:13px;color:var(--text-soft);margin-bottom:8px">${today} ${day}</div>
    ${sleepSummary}

    ${Store.getApiKey() ? '<div style="display:flex;gap:4px;margin:6px 0 10px;flex-wrap:wrap">' +
      '<button class="btn btn-soft btn-sm" onclick="TimelineView._genSchedule()">AI作息规划</button>' +
      '<button class="btn btn-soft btn-sm" onclick="TimelineView._healthAssessment()">AI健康评估</button></div>' : ''}

    <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;margin-top:8px">
      <div style="flex:1;height:6px;background:var(--line);border-radius:3px;overflow:hidden">
        <div style="height:100%;width:${this._progress}%;background:var(--green);border-radius:3px;transition:width 1s ease"></div>
      </div>
      <span style="font-size:13px;font-weight:600;color:${this._progress >= 80 ? 'var(--green)' : this._progress >= 50 ? 'var(--brand)' : 'var(--text-soft)'}">${this._progress}%</span>
    </div>

    <div style="display:flex;gap:8px;font-size:12px;color:var(--text-soft)">
      <span>${streak.msg}</span>
      ${streak.count > 0 ? '<span style="color:var(--brand);font-weight:600">' + streak.count + '天</span>' : ''}
    </div>

    ${(this._aiTips && (this._aiTips.nutrition || this._aiTips.exercise || this._aiTips.mental)) ? `
    <div style="display:flex;flex-wrap:wrap;gap:4px;margin:8px 0 12px">
      ${this._aiTips.nutrition ? '<span style="font-size:11px;padding:3px 10px;border-radius:12px;background:var(--brand-bg);color:var(--text-soft)">' + this._aiTips.nutrition + '</span>' : ''}
      ${this._aiTips.exercise ? '<span style="font-size:11px;padding:3px 10px;border-radius:12px;background:var(--green-light);color:var(--text-soft)">' + this._aiTips.exercise + '</span>' : ''}
      ${this._aiTips.mental ? '<span style="font-size:11px;padding:3px 10px;border-radius:12px;background:var(--purple);color:white">' + this._aiTips.mental + '</span>' : ''}
    </div>` : ''}
  </div>

  ${this._renderSchedule()}

</div>`;
  },

  _renderSchedule() {
    if (this._aiSchedule && this._aiSchedule.length > 0) {
      var typeColors = {
        routine: '#8EA9C4', meal: '#C49A6C', work: '#7A9A6E',
        break: '#F0D67A', exercise: '#E88A6A', leisure: '#B8A9C4', sleep: '#B0B0B0'
      };
      var typeIcons = {
        routine: '☀', meal: '🍽', work: '💼',
        break: '☕', exercise: '🏃', leisure: '🎵', sleep: '🌙'
      };
      var html = '<div style="margin:12px 0 8px;display:flex;align-items:center;gap:6px">' +
        '<span style="font-size:12px;font-weight:600;color:var(--text-hint)">AI 作息规划</span>' +
        (this._taskNote ? '<span style="font-size:11px;color:var(--text-soft)">· ' + this._taskNote + '</span>' : '') +
      '</div>';
      for (var si = 0; si < this._aiSchedule.length; si++) {
        var s = this._aiSchedule[si];
        var co = typeColors[s.type] || '#B0B0B0';
        var ic = typeIcons[s.type] || '·';
        html += '<div onclick="TimelineView._showScheduleDetail(' + si + ')" style="display:flex;align-items:center;gap:6px;padding:5px 10px;margin-bottom:2px;background:var(--card);border-radius:10px;border:1px solid var(--line-light);cursor:pointer;border-left:3px solid ' + co + '">' +
          '<span style="flex-shrink:0;width:34px;text-align:center;font-size:14px;font-weight:500;color:var(--brand)">' + s.time + '</span>' +
          '<span style="flex-shrink:0;width:20px;text-align:center;font-size:14px">' + ic + '</span>' +
          '<span style="flex:1;font-size:13px;font-weight:500">' + s.label + '</span>' +
          (s.duration ? '<span style="font-size:11px;color:var(--text-hint);flex-shrink:0">' + s.duration + 'min</span>' : '') +
          (s.desc ? '<span style="font-size:11px;color:var(--text-soft);flex-shrink:0;max-width:80px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + s.desc + '</span>' : '') +
        '</div>';
      }
      return html;
    }
    if (Store.getApiKey()) {
      return '<div style="text-align:center;padding:30px 20px"><button class="btn btn-primary btn-sm" onclick="TimelineView._genSchedule()">生成今日安排</button></div>';
    }
    return '<div style="text-align:center;padding:20px;color:var(--text-soft);font-size:13px">在更多页设置API密钥后可生成每日作息安排</div>';
  },

  _genSchedule() {
    const p = this._profile;
    if (!p || !Store.getApiKey()) return Helpers.toast('请先设置API密钥');
    const el = document.getElementById('main-content');
    Helpers.showLoading(el, '正在生成今日安排...', '基于你的档案定制每日作息', 'plan');
    Helpers.setProgress('分析时型和作息习惯...');
    setTimeout(() => Helpers.setProgress('规划时间块...'), 600);
    AIHealth.generate('plan', p).then(result => {
      if (!result) { this._render(); Helpers.toast('生成失败，请重试'); return; }
      this._aiSchedule = result.schedule || [];
      var nutTips = result.nutritionTips || (result.nutritionTip ? [result.nutritionTip] : []);
      this._aiTips = {
        nutrition: nutTips.join(' · '),
        exercise: result.exerciseTip || '',
        mental: result.mentalTip || '',
        reminders: result.postureReminders || [],
      };
      this._taskNote = result.summary || '';
      this._saveTasks();
      this._render();
    });
  },

  _showScheduleDetail(idx) {
    var s = this._aiSchedule && this._aiSchedule[idx];
    if (!s) return;
    var typeLabels = { routine:'日常', meal:'饮食', work:'工作', break:'休息', exercise:'运动', leisure:'休闲', sleep:'睡眠' };
    var tips = {
      routine: '固定的日常流程，养成习惯后不需要意志力',
      meal: '规律进餐有助于稳定血糖和新陈代谢',
      work: '专注时段建议使用番茄工作法：25分钟工作+5分钟休息',
      break: '短暂休息有助于恢复注意力和预防久坐疲劳',
      exercise: '运动后适量补充蛋白质和水分',
      leisure: '真正的放松是不看电子屏幕的活动',
      sleep: '固定作息比补觉更重要，睡前1小时停用电子设备',
    };
    var typeLabel = typeLabels[s.type] || '事项';
    var tipText = tips[s.type] || '';
    var durationText = s.duration ? s.duration + '分钟' : '';
    Helpers.openModal(
      '<div style="font-size:18px;font-weight:600;margin-bottom:2px">' + s.label + '</div>' +
      '<div style="font-size:12px;color:var(--text-soft);margin-bottom:10px">' + s.time + ' · ' + typeLabel + (durationText ? ' · ' + durationText : '') + '</div>' +
      (s.desc ? '<div style="font-size:13px;color:var(--text);margin-bottom:10px;line-height:1.6">' + s.desc + '</div>' : '') +
      (tipText ? '<div style="font-size:12px;color:var(--brand);padding:8px 10px;background:var(--brand-bg);border-radius:8px;line-height:1.5">' + tipText + '</div>' : '') +
      '<div style="text-align:center;margin-top:12px"><button class="btn btn-outline btn-sm" onclick="Helpers.closeModal()">关闭</button></div>'
    );
  },

  _healthAssessment() {
    var p = Store.getProfile();
    if (!p || !Store.getApiKey()) { Helpers.toast('请先设置档案和API密钥'); return; }
    var el = document.getElementById('main-content');
    Helpers.showLoading(el, 'AI 健康评估...', '综合分析你的饮食运动睡眠心理', 'plan');
    Helpers.setProgress('读取档案数据...');
    setTimeout(function() { Helpers.setProgress('多维度分析中...'); }, 800);
    setTimeout(function() { Helpers.setProgress('生成个性化建议...'); }, 1800);
    AIHealth.generate('assessment', p).then(function(result) {
      if (!result || !result.dimensions) {
        el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-soft)">AI评估失败，请重试</div>';
        return;
      }
      var html = '<div style="padding:0 4px">' +
        '<div style="font-size:22px;font-weight:700;margin-bottom:4px">AI 健康评估</div>' +
        (result.summary ? '<div style="font-size:13px;color:var(--text-soft);margin-bottom:12px">' + result.summary + '</div>' : '') +
        (result.overallScore !== undefined ? '<div style="text-align:center;margin-bottom:16px">' +
          '<div style="font-size:40px;font-weight:700;color:' + (result.overallScore >= 70 ? 'var(--green)' : result.overallScore >= 50 ? 'var(--brand)' : 'var(--warn)') + '">' + result.overallScore + '</div>' +
          '<div style="font-size:13px;color:var(--text-hint)">综合健康评分</div>' +
        '</div>' : '') +
        '<div style="font-size:14px;font-weight:600;margin-bottom:8px">各维度分析</div>';
      // Dimensions
      for (var di = 0; di < result.dimensions.length; di++) {
        var d = result.dimensions[di];
        var c = d.score >= 70 ? 'var(--green)' : d.score >= 50 ? 'var(--brand)' : 'var(--warn)';
        html += '<div style="background:var(--card);border-radius:14px;padding:14px;margin-bottom:8px;border:1px solid var(--line-light)">' +
          '<div style="display:flex;justify-content:space-between;margin-bottom:6px">' +
          '<span style="font-weight:600;font-size:14px">' + d.name + '</span>' +
          '<span style="font-weight:600;color:' + c + '">' + d.score + '/' + (d.status || '') + '</span></div>' +
          '<div style="height:4px;background:var(--line);border-radius:2px;overflow:hidden;margin-bottom:6px">' +
          '<div style="height:100%;width:' + d.score + '%;background:' + c + ';border-radius:2px"></div></div>' +
          (d.advice ? '<div style="font-size:12px;color:var(--text-soft);line-height:1.5">' + d.advice + '</div>' : '') +
        '</div>';
      }
      // Priorities
      if (result.priorities && result.priorities.length) {
        html += '<div style="background:var(--brand-bg);border-radius:14px;padding:14px;margin-bottom:8px">' +
          '<div style="font-size:14px;font-weight:600;margin-bottom:6px">优先改进</div>';
        for (var pi = 0; pi < result.priorities.length; pi++) {
          html += '<div style="display:flex;gap:6px;padding:3px 0;font-size:13px"><span style="color:var(--brand);font-weight:600">' + (pi+1) + '</span><span>' + result.priorities[pi] + '</span></div>';
        }
        html += '</div>';
      }
      if (result.quickWins && result.quickWins.length) {
        html += '<div style="background:var(--green-light);border-radius:14px;padding:14px;margin-bottom:8px">' +
          '<div style="font-size:14px;font-weight:600;margin-bottom:6px">快速改善</div>' +
          result.quickWins.map(function(q) { return '<div style="padding:2px 0;font-size:13px">· ' + q + '</div>'; }).join('') +
        '</div>';
      }
      // 保存到档案
      var pp = Store.getProfile();
      if (pp) {
        if (!pp.healthAssessments) pp.healthAssessments = [];
        // 保存最近10次
        pp.healthAssessments.unshift({
          date: Helpers.formatDate(new Date(), 'YYYY-MM-DD HH:mm'),
          overallScore: result.overallScore,
          summary: result.summary || '',
          dimensions: result.dimensions,
          priorities: result.priorities || [],
          quickWins: result.quickWins || [],
        });
        if (pp.healthAssessments.length > 10) pp.healthAssessments.length = 10;
        Store.setProfile(pp);
      }

      html += '<div style="text-align:center;margin-top:8px"><button class="btn btn-outline btn-sm" onclick="TimelineView.show()">返回首页</button></div>' +
      '</div>';
      el.innerHTML = html;
    });
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
    // 五大健康维度科学计算
    var score = 0, total = 0;

    // 1. 睡眠 (20%)
    const sleepLog = Store.get('sleepLog', {});
    const s = sleepLog[today] || {};
    total += 20;
    if (s.bedTime && s.wakeTime) {
      var bh = parseInt(s.bedTime.split(':')[0]), bm = parseInt(s.bedTime.split(':')[1]);
      var wh = parseInt(s.wakeTime.split(':')[0]), wm = parseInt(s.wakeTime.split(':')[1]);
      var dur = (wh * 60 + wm) - (bh * 60 + bm);
      if (dur < 0) dur += 1440;
      var hours = dur / 60;
      // 7-9小时满分，每少1小时扣5分
      score += hours >= 7 && hours <= 9 ? 20 : hours >= 6 ? 15 : hours >= 5 ? 10 : 5;
      if (s.quality) score += Math.min(4, s.quality) - 2; // 质量加减
    } else if (s.bedTime || s.wakeTime) {
      score += 8; // 部分记录
    }

    // 2. 运动 (20%)
    total += 20;
    const checkins = Store.get('fitnessCheckins', {});
    if (checkins[today]) score += 20;
    // 昨晚运动会影响今日恢复
    var yesterday = Helpers.formatDate(new Date(Date.now() - 86400000), 'YYYY-MM-DD');
    if (!checkins[today] && checkins[yesterday]) score += 10;

    // 3. 饮食 (20%)
    total += 20;
    const eaten = Store.get('eatenMeals', {});
    var em = eaten[today] || {};
    var mealCount = Object.keys(em).length;
    // 三餐每餐6分，超过3餐多1分
    score += Math.min(mealCount, 3) * 6;
    if (mealCount >= 3) score += 2; // 三餐齐全奖励

    // 4. 心理健康 (20%)
    total += 20;
    // 呼吸练习记录
    const mental = Store.get('mentalDaily', {});
    if (mental[today] && mental[today].intention) score += 10;
    // 心理测评记录（近7天）
    const p = Store.getProfile();
    var psyAssessments = p && p.psyAssessments || {};
    var weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7); var weekAgoStr = Helpers.formatDate(weekAgo, "YYYY-MM-DD"); var recentPsy = 0; for(var pk in psyAssessments) { var r = psyAssessments[pk]; if(r.date && r.date >= weekAgoStr) recentPsy++; }
    if (recentPsy.length > 0) score += 10;
    // 健康问卷
    if (p && p.healthSurvey && p.healthSurvey.date === today) score += 5;

    // 5. 身体监测 (20%)
    total += 20;
    const weights = Store.get('weightLog', {});
    if (weights[today]) score += 15;
    // 有体脂记录额外加分
    const bf = Store.get('bodyFatLog', {});
    if (bf[today]) score += 5;

    function tonight(daysOffset) {
      var d = new Date();
      d.setDate(d.getDate() + (daysOffset || 0));
      return Helpers.formatDate(d, 'YYYY-MM-DD');
    }

    var realProgress = total > 0 ? Math.round(Math.min(score, total) / total * 100) : 0;
    progress = Math.max(progress, realProgress);

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
      [0,'还未开始'],[20,'开始记录'],[40,'加油'],[50,'完成一半'],[60,'继续前进'],
      [75,'做得不错'],[85,'接近完美'],[100,'今日满分']
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
    if (module === 'diet' && type === 'meal') return App.navigate('plan');
    if (module === 'exercise' && id === 'exercise') return App.navigate('fitness');
    if (id === 'stretch') {
      Helpers.openModal(
        '<div style="font-size:18px;font-weight:600;margin-bottom:6px">晨间拉伸</div>' +
        '<div style="font-size:13px;line-height:1.8;margin-bottom:12px">1. 肩部环绕 x1轮<br>2. 猫牛式 x3次<br>3. 颈部左右拉伸 x每侧15s</div>' +
        '<button class="btn btn-outline btn-sm btn-block" onclick="Helpers.closeModal()">完成</button>'
      ); return;
    }
    if (id === 'review' || id === 'plan_review') {
      Helpers.openModal(
        '<div style="font-size:18px;font-weight:600;margin-bottom:6px">今日回顾</div>' +
        '<div style="font-size:13px;color:var(--text-soft);margin-bottom:14px">今天过得怎么样？在心里过一遍</div>' +
        '<button class="btn btn-outline btn-sm btn-block" onclick="Helpers.closeModal()">好了</button>'
      ); return;
    }
    if (id === 'gratitude') {
      Helpers.openModal(
        '<div style="font-size:18px;font-weight:600;margin-bottom:6px">感恩三秒</div>' +
        '<div style="font-size:14px;color:var(--text-soft);margin-bottom:12px">在心里想一件今天值得感恩的事</div>' +
        '<div style="font-size:12px;color:var(--text-hint);text-align:center;margin-bottom:12px">可以很小——一杯好咖啡、一个微笑</div>' +
        '<button class="btn btn-outline btn-sm btn-block" onclick="Helpers.closeModal()">想好了</button>'
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
