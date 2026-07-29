// ===== 睡眠健康数据库 =====
// 来源：National Sleep Foundation 2025、美国睡眠医学会、WHO
// 更新：2026年7月

const SleepDB = {
  // ---- 推荐睡眠时长（按年龄） ----
  durationByAge: [
    { minAge: 0, maxAge: 3, label: '新生儿', hours: '14-17', note: '含小睡' },
    { minAge: 4, maxAge: 11, label: '婴儿', hours: '12-15', note: '含小睡' },
    { minAge: 1, maxAge: 2, label: '幼儿', hours: '11-14', note: '含小睡' },
    { minAge: 3, maxAge: 5, label: '学龄前', hours: '10-13', note: '含小睡' },
    { minAge: 6, maxAge: 13, label: '学龄', hours: '9-11', note: '' },
    { minAge: 14, maxAge: 17, label: '青少年', hours: '8-10', note: '' },
    { minAge: 18, maxAge: 64, label: '成人', hours: '7-9', note: '核心人群' },
    { minAge: 65, maxAge: 120, label: '老年人', hours: '7-8', note: '' },
  ],

  // ---- 睡眠卫生检查清单 ----
  hygieneChecklist: {
    daytime: [
      { item: '早晨接触自然光30分钟以上', why: '帮助校准生物钟', emoji: '☀️' },
      { item: '每天有30分钟以上身体活动', why: '改善睡眠深度', emoji: '🏃' },
      { item: '午睡不超过30分钟', why: '过长影响夜间睡眠', emoji: '😴' },
      { item: '下午3点后不喝咖啡/浓茶', why: '咖啡因半衰期约5小时', emoji: '☕' },
      { item: '三餐时间规律', why: '稳定代谢节律', emoji: '🍽️' },
    ],
    evening: [
      { item: '睡前1小时停止使用电子屏幕', why: '蓝光抑制褪黑素分泌', emoji: '📱' },
      { item: '睡前2小时不进食大量食物', why: '消化影响睡眠质量', emoji: '🍜' },
      { item: '睡前1小时不饮酒', why: '酒精破坏深度睡眠结构', emoji: '🍷' },
      { item: '建立固定睡前流程（20-30分钟）', why: '形成条件反射', emoji: '🛁' },
      { item: '睡前做轻度拉伸或冥想', why: '降低交感神经兴奋', emoji: '🧘' },
    ],
    environment: [
      { item: '卧室温度保持17-22°C', why: '核心体温下降0.5°C触发入睡；22°C最适宜睡前状态', emoji: '🌡️' },
      { item: '湿度30-50%', why: '与温度协同影响散热和睡眠质量', emoji: '💧' },
      { item: '保持卧室完全黑暗（≤1 lux）', why: '480nm蓝光暴露2h抑制褪黑素53%；黑色窗帘+眼罩', emoji: '👁️' },
      { item: '睡前1h用暖色光（CCT≤2700K）', why: '暖黄光最助眠；冷色墙面会反射褪黑素干扰光', emoji: '💡' },
      { item: '噪音≤45dB，避免突发噪声', why: '突发噪声触发K-复合波使睡眠变浅；粉红噪声可能有助', emoji: '🔇' },
      { item: 'CO₂浓度<600ppm', why: '通风不良导致CO₂升高→深度睡眠减少', emoji: '🌬️' },
      { item: '床仅用于睡眠和亲密行为', why: '强化床=睡的条件反射', emoji: '🛏️' },
      { item: '卧室不放电子设备', why: '减少蓝光暴露和通知干扰', emoji: '📵' },
    ],
  },

  // ---- 睡前放松流程 ----
  bedtimeRoutine: {
    duration: 30,
    steps: [
      { name: '关掉电子设备', duration: 0, desc: '把手机放在卧室外充电', icon: 'phone' },
      { name: '温水泡脚或淋浴', duration: 10, desc: '水温40°C左右，体温先升后降促进困意', icon: 'bath' },
      { name: '轻柔拉伸', duration: 5, desc: '猫牛式、颈部拉伸、肩部环绕', icon: 'stretch' },
      { name: '腹式呼吸', duration: 5, desc: '4-7-8呼吸法：吸气4秒→屏息7秒→呼气8秒，重复5次', icon: 'breath' },
      { name: '感恩或放松冥想', duration: 5, desc: '回想今天3件好事，或做身体扫描冥想', icon: 'meditate' },
      { name: '读纸质书', duration: 5, desc: '选择轻松的读物，不看刺激/悬疑内容', icon: 'book' },
    ],
  },

  // ---- 常见睡眠问题与建议 ----
  sleepIssues: [
    { id: 'SI01', name: '入睡困难（>30分钟才能睡着）',
      cause: '睡前太兴奋/焦虑/环境干扰/咖啡因',
      suggestions: [
        '提前1小时进入"关机模式"',
        '不要在床上玩手机或工作',
        '尝试4-7-8呼吸法',
        '如果20分钟没睡着，起来换个房间做安静活动直到有困意',
      ],
    },
    { id: 'SI02', name: '睡眠维持困难（半夜醒来难再入睡）',
      cause: '压力/酒精/夜间低血糖/睡眠呼吸暂停',
      suggestions: [
        '避免睡前饮酒',
        '醒来不看时间，不看手机',
        '做腹式呼吸5-10分钟',
        '如果持续，记录睡眠日志就医',
      ],
    },
    { id: 'SI03', name: '早醒（凌晨醒来无法再睡）',
      cause: '抑郁/焦虑/年龄相关/生物钟紊乱',
      suggestions: [
        '保持固定起床时间（包括周末）',
        '早晨立即接触强光',
        '下午后不摄入咖啡因',
        '如果持续2周以上建议就医',
      ],
    },
    { id: 'SI04', name: '白天嗜睡/精力不足',
      cause: '睡眠时长不足/睡眠质量差/缺乏运动',
      suggestions: [
        '核心问题通常是睡得不够或睡眠片段化',
        '午睡≤30分钟且在下午3点前',
        '增加白天活动量和光照暴露',
        '如果长期存在需排查睡眠呼吸暂停',
      ],
    },
  ],

  // ---- 睡眠时型（chronotype）分类（2025-2026前沿研究）----
  chronotypes: [
    { type: 'morning', label: '早间型（百灵鸟）', naturalBed: '21:00-22:00', naturalWake: '5:00-6:30',
      peakTime: '上午8-12点', bestWorkout: '下午3-5点（力量训练效果最佳）',
      pct: '约25%人群', note: '早间型晚睡对健康的危害最大' },
    { type: 'intermediate', label: '中间型', naturalBed: '22:00-23:30', naturalWake: '6:30-8:00',
      peakTime: '上午10-12点+下午3-5点', bestWorkout: '上午或下午均可',
      pct: '约55%人群', note: '最普遍的时型' },
    { type: 'evening', label: '晚间型（猫头鹰）', naturalBed: '23:30-1:00', naturalWake: '7:30-9:00',
      peakTime: '下午2-6点', bestWorkout: '下午4-7点（HIIT效果最佳）',
      pct: '约20%人群', note: '晚间型更容易睡前拖延，需刻意建立睡眠习惯' },
  ],

  // ---- 最佳睡眠环境参数（2025-2026研究综合）----
  environmentOptimization: {
    temperature: { optimal: '17-22°C', key: '温度对睡眠阶段影响最大；核心体温下降0.5°C触发入睡', ref: 'Building and Environment 2025' },
    humidity: { optimal: '30-50%', note: '与温度协同影响散热和睡眠质量' },
    light_preSleep: { optimal: '≤50 lux, CCT≤2700K', note: '暖黄光最佳；480nm蓝光暴露2小时抑制褪黑素53%', ref: 'Chinese Science 2025' },
    light_duringSleep: { optimal: '≤1 lux', note: '黑色窗帘+眼罩；蓝色墙纸反射褪黑素活性光应避免' },
    noise: { optimal: '30-45 dB', note: '避免突发噪声（触发K-复合波）；粉红噪声可能有助' },
    co2: { optimal: '<600 ppm', note: '通风不良→CO₂升高→睡眠质量下降' },
    comprehensive: '环境因素协同效应大于单一因素；智能集成控制最优', ref: 'Int J Dynamics Control 2026' 
  },

  // ---- 2025-2026前沿睡眠建议 ----
  advancedInsights: [
    { topic: '睡前拖延是时型与失眠的中介变量',
      finding: '2026年研究（n=671）发现睡前拖延部分中介了晚间型与失眠的关系。晚间型更容易推迟就寝→导致失眠',
      implication: '对晚间型：建立强制性睡前流程比靠意志力更有效' },
    { topic: '无论时型，早睡都是保护因素',
      finding: 'UK Biobank 73,888人数据分析：无论时型如何，晚睡都与不良健康结局显著相关。早睡不论节律偏好都是保护因素',
      implication: '固定就寝时间比"跟随身体感觉"更重要' },
    { topic: '周末补觉无法弥补工作日睡眠缺失',
      finding: '近5000人数据证实：周末即使睡更长时间，也无法真正恢复工作日的睡眠缺失',
      implication: '保持一周7天一致的作息比周末补觉更有效' },
    { topic: '晚间型需要更多的户外光照',
      finding: '日本1252人研究：社交限制放松后，晚间型睡眠质量改善与更长的户外光照暴露相关',
      implication: '对晚间型：早晨和中午多接触自然光' },
  ],

  // ---- 理想的睡前/醒后时间表 ----
  schedule: {
    wakeUp: [
      { time: '-60min', action: '自然闹钟唤醒（模拟日出或震动手环）' },
      { time: '-5min', action: '伸懒腰+在床上活动手脚' },
      { time: '0', action: '起床+拉开窗帘接触自然光' },
      { time: '+10min', action: '喝一杯温水' },
      { time: '+30min', action: '早餐（含蛋白质+复合碳水）' },
    ],
    windDown: [
      { time: '-120min', action: '停止工作和剧烈运动' },
      { time: '-90min', action: '停止进食（可喝少量温水）' },
      { time: '-60min', action: '关掉电子屏幕' },
      { time: '-30min', action: '开始睡前流程（泡脚/拉伸/阅读）' },
      { time: '-10min', action: '调暗灯光+做呼吸练习' },
      { time: '0', action: '上床关灯' },
    ],
  },

  getKnowledgeBase() {
    return {
      duration: "成人推荐睡眠7-9小时，老年4新生儿需要更多",
      temperature: "最佳卧室温度17-22°C，湿度30-50%，CO2<600ppm",
      light: "睡前1小时停用电子设备。480nm蓝光暴露2小时抑制褪黑素53%",
      caffeine: "咖啡因半衰期约5小时，下午3点后尽量避免",
      circadian: "固定作息比补觉更有效，周末补觉无法弥补工作日睡眠缺失",
      chronotype: "早间型约25%，中间型约55%，晚间型约20%。晚间型容易睡前拖延",
      noise: "噪音应低于45dB，突发噪音触发K-复合波使睡眠变浅",

      // 2025-2026最新研究
      melatonin_glucose_2025: "2025年Meta分析（8项RCT）：补充褪黑素可显著改善2型糖尿病血糖——空腹血糖降12.65mg/dL，胰岛素降2.30，HbA1C降0.79%，胰岛素抵抗降0.83",
      melatonin_mechanism: "褪黑素调节血糖机制：改善胰岛β细胞功能、减轻内质网/氧化应激、通过抗氧化抗炎改善胰岛素敏感性、保护线粒体功能",
      chronotherapy: "时间疗法（Chronotherapy）：调整睡眠时间与社会作息匹配，白天多晒太阳夜间减少蓝光以稳定褪黑素节律",
      clock_genes: "核心时钟基因（CLOCK/BMAL1/PER/CRY）单核苷酸多态性与代谢综合征和肥胖风险相关",
    };
  },
};
