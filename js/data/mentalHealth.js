// ===== 心理健康数据库 =====
// 来源：哈佛大学积极心理学（Tal Ben-Shahar）、UC Berkeley GGIA、
//       CBT认知行为疗法、4-7-8呼吸法研究（SFU 2023）
// 核心理念：日常心理卫生 = 像刷牙一样每天几分钟的小动作

const MentalHealthDB = {
  // ---- 今日意图（Morning Intention）----
  // 来源：哈佛幸福课 - 目标设定与自我认同
  intentionPool: [
    { text: '有耐心', category: '情绪', icon: 'calm' },
    { text: '专注', category: '工作', icon: 'focus' },
    { text: '温柔', category: '关系', icon: 'gentle' },
    { text: '勇敢', category: '行动', icon: 'brave' },
    { text: '放松', category: '情绪', icon: 'relax' },
    { text: '感恩', category: '关系', icon: 'grateful' },
    { text: '幽默', category: '情绪', icon: 'fun' },
    { text: '自信', category: '行动', icon: 'confident' },
    { text: '开放', category: '成长', icon: 'open' },
    { text: '接纳', category: '情绪', icon: 'accept' },
    { text: '坚持', category: '行动', icon: 'persist' },
    { text: '真诚', category: '关系', icon: 'honest' },
    { text: '从容', category: '情绪', icon: 'calm' },
    { text: '好奇心', category: '成长', icon: 'curious' },
    { text: '慷慨', category: '关系', icon: 'generous' },
  ],

  // ---- 呼吸法数据库 ----
  // 来源：4-7-8呼吸法研究（SFU 2023）、盒式呼吸（US Navy SEAL）
  breathingExercises: [
    {
      id: 'B01', name: '4-7-8呼吸法', rounds: 2, unit: '轮',
      desc: '吸气4秒→屏息7秒→呼气8秒',
      steps: [
        '用鼻子吸气，心中默数4秒',
        '屏住呼吸，默数7秒',
        '用嘴巴缓缓呼气，默数8秒',
        '以上为一轮，重复2-4轮',
      ],
      totalTime: 38, // 秒
      science: '2023年SFU实证研究：每周4次以上，8周后特质焦虑显著降低（STICTA量表平均降10分）',
      caution: '屏息时不要过度勉强，有高血压者慎用',
      tags: ['放松','焦虑','睡前'],
    },
    {
      id: 'B02', name: '盒式呼吸（Box Breathing）', rounds: 3, unit: '轮',
      desc: '吸气4秒→屏息4秒→呼气4秒→屏息4秒',
      steps: [
        '吸气4秒',
        '屏息4秒',
        '呼气4秒',
        '屏息4秒',
        '以上为一轮，重复3-5轮',
      ],
      totalTime: 48,
      science: 'US Navy SEALs使用，激活副交感神经系统，快速平静',
      caution: '保持节奏平稳',
      tags: ['专注','冷静','压力'],
    },
    {
      id: 'B03', name: '4-4-6呼吸法', rounds: 3, unit: '轮',
      desc: '吸气4秒→屏息4秒→呼气6秒',
      steps: [
        '吸气4秒',
        '屏息4秒',
        '呼气6秒（比吸气长，激活副交感神经）',
        '以上为一轮，重复3轮（约42秒）',
      ],
      totalTime: 42,
      science: '延长呼气激活迷走神经，降低心率',
      caution: '无需屏息过度',
      tags: ['快速','工作间隙','通用'],
    },
  ],

  // ---- 感恩练习 ----
  // 来源：Emmons & McCullough 2003、Seligman 2005、哈佛幸福课
  gratitudePractices: {
    threeGoodThings: {
      name: '三件好事',
      desc: '每天在心里想三件值得感恩的事',
      steps: ['停下来','在心里想今天的一件好事（可以很小）','感受一下这个感觉','如果想，可以想想为什么这件事会发生'],
      duration: 30,
      science: 'Emmons & McCullough 2003：持续10周后正向情绪显著提升、睡眠质量改善、乐观度提高',
      variants: [
        { name: '感恩三秒', duration: 3, desc: '最简单版——花3秒想一件好事，在心里过一下就行', science: '高频低阻，更容易坚持' },
        { name: '三件好事日记', duration: 120, desc: '完整版——写下来并附上原因', science: 'Seligman 2005：持续2周效果可持续3-6个月' },
      ],
    },
    gratitudeVisit: {
      name: '感恩拜访',
      desc: '给一个你想感谢的人写一封信或当面表达',
      science: 'Seligman 2005：即使只做一次，幸福感可维持一个月',
    },
  },

  // ---- 认知重构（CBT基础）----
  // 来源：CBT认知行为疗法基础课程
  cbtBasics: {
    thoughtRecord: {
      name: '思维记录表',
      steps: [
        '发生了什么？（客观描述）',
        '我当时在想什么？',
        '这个想法是真的吗？有什么证据？',
        '有没有其他可能性？',
        '换个角度想，现在感觉如何？',
      ],
      science: 'CBT核心工具：持续2周可改变自动思维模式，焦虑水平降低30-40%',
    },
    cognitiveDistortions: [
      { name: '非黑即白', desc: '事情只有"完美"和"失败"，没有中间地带', antidote: '找灰色地带：这件事有哪些部分是好的？' },
      { name: '灾难化', desc: '把小事想成最坏的结果', antidote: '问自己：最坏的概率有多大？最好的可能是什么？' },
      { name: '过度概括', desc: '一件事做不好就觉得自己做什么都不行', antidote: '找反例：有没有成功的时候？' },
      { name: '读心术', desc: '觉得自己知道别人在想什么（而且肯定是负面的）', antidote: '有证据吗？还有别的可能吗？' },
      { name: '情绪推理', desc: '"我感觉不好，所以肯定出了什么问题"', antidote: '感觉不等于事实：我的情绪在说什么？事实是什么？' },
      { name: '应该陈述', desc: '"我应该...""我必须..."', antidote: '换成"可以"和"选择"：把"应该"换成"可以"试试' },
    ],
  },

  // ---- 情绪词汇表（情绪速写用）----
  emotions: [
    { icon: '😊', label: '开心', category: 'positive' },
    { icon: '😌', label: '平静', category: 'positive' },
    { icon: '😐', label: '一般', category: 'neutral' },
    { icon: '😔', label: '低落', category: 'negative' },
    { icon: '😤', label: '烦躁', category: 'negative' },
    { icon: '😰', label: '焦虑', category: 'negative' },
    { icon: '😵', label: '疲惫', category: 'negative' },
    { icon: '😃', label: '兴奋', category: 'positive' },
    { icon: '🥱', label: '困倦', category: 'neutral' },
    { icon: '🤗', label: '感激', category: 'positive' },
  ],
  emotionCategories: {
    positive: ['开心','平静','兴奋','感激'],
    neutral: ['一般','困倦'],
    negative: ['低落','烦躁','焦虑','疲惫'],
  },

  // ---- 心理模块嵌入时间线的规则 ----
  timelineSchedule: {
    morning: { type: 'intention', time: '07:15', label: '今日意图', duration: 30, trigger: 'after_breakfast' },
    work_break: { type: 'breathing', time: '10:00', label: '呼吸暂停', duration: 30, trigger: 'after_sitting_45min' },
    noon: { type: 'gratitude', time: '12:30', label: '感恩三秒', duration: 3, trigger: 'after_lunch' },
    afternoon_break: { type: 'breathing', time: '15:00', label: '呼吸暂停', duration: 30, trigger: 'after_sitting_45min' },
    evening: { type: 'review', time: '21:30', label: '今日回顾', duration: 60, trigger: 'before_bedtime' },
  },

  // ---- 联动规则 ----
  linkages: {
    moodToExercise: {
      sad: { type: 'outdoor_walk', label: '解压散步', duration: 20, note: '户外快走改善情绪效果优于室内运动' },
      anxious: { type: 'yoga_stretch', label: '平静拉伸', duration: 15, note: '瑜伽/拉伸降低皮质醇水平' },
      angry: { type: 'boxing_hiit', label: '释放训练', duration: 15, note: '高强度运动释放压力' },
    },
    moodToDiet: {
      sad: { tip: '香蕉/黑巧克力/坚果含色氨酸和多酚，有助于提升情绪' },
      anxious: { tip: '避免咖啡因，镁含量高的食物（坚果/绿叶菜）有助放松' },
      tired: { tip: '补充B族维生素（全谷物/蛋/瘦肉）' },
    },
  },
};
