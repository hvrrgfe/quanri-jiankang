// ===== 全日健康 - 时间线引擎 =====
// 根据用户画像和当前时间，生成「今天」的时间线卡片流
// 每个卡片代表一个可执行的动作

const TimelineEngine = {
  // ---- 生成今天的时间线 ----
  generate(profile) {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    const cards = [];

    if (!profile) return cards;

    // 早晨卡片
    cards.push(...this._morningCards(profile, now));
    // 上午工作卡片
    cards.push(...this._morningWorkCards(profile, now));
    // 中午卡片
    cards.push(...this._noonCards(profile, now));
    // 下午工作卡片
    cards.push(...this._afternoonWorkCards(profile, now));
    // 晚间卡片
    cards.push(...this._eveningCards(profile, now));
    // 睡前卡片
    cards.push(...this._bedtimeCards(profile, now));

    // 按时间排序
    cards.sort((a, b) => a.time.localeCompare(b.time));

    // 只保留当前时间之后的卡片（或今天的全部卡片在首页显示）
    return cards;
  },

  // ---- 早晨 ----
  _morningCards(profile, now) {
    return [
      {
        id: 'wakeup', module: 'base', time: '07:00', label: '起床',
        icon: 'sun', type: 'info', done: now.getHours() >= 7,
      },
      {
        id: 'stretch', module: 'posture', time: '07:15', label: '晨间拉伸',
        desc: '5分钟 · 唤醒身体', icon: 'stretch', type: 'action',
        action: { type: 'stretch', ids: ['S02','S03','S01'] },
        done: false,
      },
      {
        id: 'intention', module: 'mental', time: '07:25', label: '今日意图',
        desc: '今天想成为一个怎样的人？', icon: 'heart', type: 'input',
        done: false,
      },
      {
        id: 'plan', module: 'plan', time: '07:30', label: '今天的三件事',
        desc: profile.planCount === 3 ? '3件 · 做完就是胜利' : `${profile.planCount}件`,
        icon: 'list', type: 'input',
        done: false,
      },
      {
        id: 'breakfast', module: 'diet', time: '07:40', label: '早餐',
        desc: '', icon: 'breakfast', type: 'meal',
        done: false,
      },
    ];
  },

  // ---- 上午工作 ----
  _morningWorkCards(profile, now) {
    const sittingFreq = profile.jobType === 'desk' ? 45 : 60;
    return [
      {
        id: 'sit1', module: 'posture', time: `09:${sittingFreq}`, label: '该站起来一下',
        desc: '调整坐姿+简单拉伸', icon: 'posture', type: 'alert',
        duration: 1,
      },
      {
        id: 'breath1', module: 'mental', time: '10:00', label: '呼吸暂停',
        desc: '30秒 · 4-4-6呼吸法', icon: 'breath', type: 'action',
        action: { type: 'breathing', id: 'B03' },
      },
      {
        id: 'micro1', module: 'posture', time: '10:30', label: '微运动 · 肩颈放松',
        desc: '3分钟 · 办公室可做', icon: 'stretch', type: 'action',
        action: { type: 'micro', id: 'M02' },
      },
      {
        id: 'sit2', module: 'posture', time: '11:00', label: '站起来活动一下',
        desc: '已经坐了45分钟', icon: 'posture', type: 'alert',
      },
    ];
  },

  // ---- 中午 ----
  _noonCards(profile, now) {
    return [
      {
        id: 'lunch', module: 'diet', time: '12:00', label: '午餐',
        desc: '', icon: 'lunch', type: 'meal',
      },
      {
        id: 'walk', module: 'exercise', time: '12:30', label: '饭后散步',
        desc: '10分钟 · 助消化控血糖', icon: 'walk', type: 'action',
        action: { type: 'cardio', id: 'C01', duration: 10 },
      },
      {
        id: 'gratitude', module: 'mental', time: '12:45', label: '感恩三秒',
        desc: '在心里想一件值得感恩的事', icon: 'heart', type: 'reflection',
      },
    ];
  },

  // ---- 下午工作 ----
  _afternoonWorkCards(profile, now) {
    return [
      {
        id: 'posture_check', module: 'posture', time: '14:00', label: '调整坐姿',
        desc: '检查：耳肩髋在一条线', icon: 'posture', type: 'check',
      },
      {
        id: 'sit3', module: 'posture', time: '14:30', label: '站起来活动一下',
        desc: '活动身体+看远处', icon: 'posture', type: 'alert',
      },
      {
        id: 'breath2', module: 'mental', time: '15:00', label: '呼吸暂停',
        desc: '30秒 · 盒式呼吸', icon: 'breath', type: 'action',
        action: { type: 'breathing', id: 'B02' },
      },
      {
        id: 'eye_break', module: 'posture', time: '15:30', label: '眼部放松',
        desc: '20-20-20法则+热敷', icon: 'eye', type: 'action',
      },
      {
        id: 'micro2', module: 'posture', time: '16:00', label: '微运动 · 腰部放松',
        desc: '3分钟 · 缓解久坐腰部不适', icon: 'stretch', type: 'action',
        action: { type: 'micro', id: 'M04' },
      },
      {
        id: 'plan_check', module: 'plan', time: '16:30', label: '今日进度',
        desc: '看看今天的任务完成得怎么样了', icon: 'list', type: 'check',
      },
    ];
  },

  // ---- 晚间 ----
  _eveningCards(profile, now) {
    return [
      {
        id: 'dinner', module: 'diet', time: '19:00', label: '晚餐',
        desc: '', icon: 'dinner', type: 'meal',
      },
      {
        id: 'exercise', module: 'exercise', time: '20:00', label: '今日运动',
        desc: '根据你的运动计划', icon: 'exercise', type: 'action',
        action: { type: 'plan' },
      },
      {
        id: 'stretch_pm', module: 'posture', time: '20:30', label: '练后拉伸',
        desc: '5分钟 · 放松身体', icon: 'stretch', type: 'action',
        action: { type: 'stretch', ids: ['S03','S06','S08'] },
      },
    ];
  },

  // ---- 睡前 ----
  _bedtimeCards(profile, now) {
    return [
      {
        id: 'review', module: 'mental', time: '21:30', label: '今日回顾',
        desc: '今天过得怎么样？在心里过一遍', icon: 'heart', type: 'reflection',
      },
      {
        id: 'plan_review', module: 'plan', time: '21:35', label: '今日复盘',
        desc: '看看计划的完成情况', icon: 'list', type: 'check',
      },
      {
        id: 'sleep_prep', module: 'sleep', time: '21:45', label: '睡前准备',
        desc: '检查清单 · 调暗灯光 · 放下手机', icon: 'moon', type: 'checklist',
      },
      {
        id: 'sleep', module: 'sleep', time: '22:00', label: '睡觉',
        desc: '晚安', icon: 'moon', type: 'info',
      },
    ];
  },

  // ---- 计算今日完成度 ----
  calculateProgress(cards) {
    if (!cards || !cards.length) return 0;
    const actionable = cards.filter(c => c.type !== 'info');
    const done = actionable.filter(c => c.done);
    return actionable.length ? Math.round(done.length / actionable.length * 100) : 0;
  },
};
