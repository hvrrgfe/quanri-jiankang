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

  // ---- 感官接地练习（Grounding）----
  // 来源：焦虑急性发作时的循证技术（5-4-3-2-1法，广泛用于CBT与创伤治疗）
  groundingExercises: [
    {
      id: 'G01', name: '5-4-3-2-1 感官接地', duration: 60,
      desc: '焦虑来袭时的"紧急刹车"——用五种感官把自己拉回当下',
      steps: [
        '环顾四周，找出 5 件你能看到的东西（描述它们）',
        '感受 4 种你能触摸到的感觉（衣物质地、椅面、皮肤触感）',
        '注意 3 种你能听到的声音（远处车声、空调声、自己的呼吸）',
        '寻找 2 种你能闻到的气味（或想两种喜欢的味道）',
        '说出 1 种你能尝到的味道（或喝一口水感受它）',
      ],
      science: '研究显示：感官接地可快速降低急性焦虑的生理唤醒水平，是CBT/DBT中焦虑管理的基础工具',
      caution: '数不出来也没关系，接近即可，重点是"描述"而非"完成"',
      tags: ['焦虑','急性','紧急'],
    },
  ],

  // ---- 正念练习（Mindfulness）----
  // 来源：MBSR（Kabat-Zinn 1990）、MBCT（Teasdale et al. 2000）
  mindfulnessPractices: [
    {
      id: 'M01', name: '正念一分钟', duration: 60,
      desc: '最简单的正念——把注意力锚定在呼吸上',
      steps: [
        '坐直，双手放在腿上，闭上眼睛（或低垂目光）',
        '把注意力放在鼻尖或腹部的呼吸感受上',
        '思绪飘走？没关系——注意到它，轻轻把它带回来',
        '继续一分钟，结束时感受一下整个身体',
      ],
      science: 'MBCT研究（Teasdale 2000）：正念认知疗法使抑郁复发率降低约50%；短时正念练习即可降低焦虑',
      caution: '"分心"不是失败，觉察到分心并带回注意力才是练习本身',
      tags: ['正念','焦虑','压力'],
    },
    {
      id: 'M02', name: '身体扫描（3分钟版）', duration: 180,
      desc: '从脚到头快速扫描身体紧张点',
      steps: [
        '闭上眼睛，从脚趾开始',
        '逐个部位觉察感受：脚→小腿→大腿→腹部→胸口→肩膀→脖子→脸',
        '每个部位停留约10秒，不评判，只是觉察',
        '结束时深吸一口气，睁开眼睛',
      ],
      science: '身体扫描是MBSR核心练习之一（Kabat-Zinn 1990），提升身体觉察、降低躯体化焦虑',
      caution: '觉察到紧张不用"解决"它，觉察本身就有效',
      tags: ['放松','睡前','身体'],
    },
  ],

  // ---- 行为激活（Behavioral Activation）----
  // 来源：BA疗法（Jacobson 1996；Richards 2016 荟萃分析）
  behavioralActivation: {
    name: '行为激活：先行动，再感受',
    desc: '情绪低落时，行动力会下降，但不行动会让情绪更低落——这是循环。打破它的方式是：先动起来，情绪会跟上',
    steps: [
      '选一件很小、几乎不可能失败的事（散步5分钟、洗碗、给朋友发条消息）',
      '不要求自己"有感觉才做"——先做，感受会在行动后到来',
      '完成后在情绪上打个勾：记录"行动后感觉如何"(可能比预想好)',
      '每天安排1-2个这样的微小行动，尤其在你"最不想动"的时刻',
    ],
    science: 'Richards 2016（Lancet）荟萃分析：行为激活对中重度抑郁的效果与CBT相当，且更简单易行；"行动先于情绪"是核心机制',
    caution: '从"容易到不可能失败"的开始，避免一开始就定宏大目标',
  },

  // ---- 自我慈悲（Self-Compassion）----
  // 来源：Neff 2003/2011（自我慈悲三分法）
  selfCompassion: {
    name: '自我慈悲三句话',
    desc: '对待自己像对待好朋友一样（Neff：对抗自我批评最有效的练习之一）',
    steps: [
      '觉察：现在我心里有个批评的声音（"我真差劲"）',
      '共通人性：每个人都会犯错，我不是唯一一个',
      '善意向自己：对自己说一句温柔的话（"你已经尽力了"）',
    ],
    science: 'Neff 研究：自我慈悲与更低焦虑抑郁相关（r≈-0.5），与心理弹性正相关；对自我批评者效果尤为显著',
    caution: '不是"放过自己"，而是用更真实友善的方式看待自己',
  },

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
      { name: '贴标签', desc: '用极端标签定义自己或别人（"我就是个失败者"）', antidote: '把标签换成具体行为："这次搞砸了"而不是"我很失败"' },
      { name: '最大化/最小化', desc: '夸大坏事、贬低好事（"这次成功只是运气"）', antidote: '像对待朋友一样把好事记下来：你的努力也是原因' },
      { name: '个人化', desc: '把所有问题都归到自己头上（"同事不高兴一定是因为我"）', antidote: '列出其他可能原因：还有哪些因素在起作用？' },
      { name: '算命式思维', desc: '预言坏结果并当成事实（"这次肯定失败"）', antidote: '把预言当假设检验：等结果出来再下结论' },
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

  // ---- 全球公认心理测评量表 ----
  assessments: {
    phq9: {
      name: 'PHQ-9 抑郁筛查量表',
      ref: 'Kroenke et al., 2001, JAMA',
      timeFrame: '过去两周',
      items: [
        { text: '做事时提不起劲或没有兴趣', options: ['没有','有几天','一半以上天数','几乎每天'] },
        { text: '感到心情低落、沮丧或绝望', options: ['没有','有几天','一半以上天数','几乎每天'] },
        { text: '入睡困难、睡不安稳或睡眠过多', options: ['没有','有几天','一半以上天数','几乎每天'] },
        { text: '感觉疲倦或没有活力', options: ['没有','有几天','一半以上天数','几乎每天'] },
        { text: '食欲不振或吃太多', options: ['没有','有几天','一半以上天数','几乎每天'] },
        { text: '觉得自己很糟或觉得自己很失败', options: ['没有','有几天','一半以上天数','几乎每天'] },
        { text: '对事物专注有困难', options: ['没有','有几天','一半以上天数','几乎每天'] },
        { text: '动作或说话速度缓慢或异常烦躁', options: ['没有','有几天','一半以上天数','几乎每天'] },
        { text: '有不如死掉或用某种方式伤害自己的念头', options: ['没有','有几天','一半以上天数','几乎每天'], caution: true },
      ],
      scoring: '0-3分/题，总分0-27。5-9轻微/10-14中度/15-19中重度/20-27重度',
      note: '筛查工具，不能替代专业诊断。第9题阳性需立即寻求专业帮助',
    },
    gad7: {
      name: 'GAD-7 广泛性焦虑量表',
      ref: 'Spitzer et al., 2006, Arch Intern Med',
      timeFrame: '过去两周',
      items: [
        { text: '感到紧张、焦虑或烦躁', options: ['没有','有几天','一半以上天数','几乎每天'] },
        { text: '无法停止或控制担忧', options: ['没有','有几天','一半以上天数','几乎每天'] },
        { text: '对各种各样的事情担忧过多', options: ['没有','有几天','一半以上天数','几乎每天'] },
        { text: '很难放松下来', options: ['没有','有几天','一半以上天数','几乎每天'] },
        { text: '坐立不安，以至于很难安静坐着', options: ['没有','有几天','一半以上天数','几乎每天'] },
        { text: '容易烦躁或易怒', options: ['没有','有几天','一半以上天数','几乎每天'] },
        { text: '感到害怕，好像有可怕的事情发生', options: ['没有','有几天','一半以上天数','几乎每天'] },
      ],
      scoring: '0-3分/题，总分0-21。5-9轻度/10-14中度/15-21重度',
      note: '对广泛性焦虑、社交焦虑、惊恐障碍均有良好筛查效果',
    },
    rses: {
      name: 'Rosenberg 自尊量表 (RSES)',
      ref: 'Rosenberg, 1965',
      timeFrame: '现在',
      items: [
        { text: '我觉得自己是一个有价值的人', options: ['非常不同意','不同意','同意','非常同意'], reverse: false },
        { text: '我觉得自己有许多好的品质', options: ['非常不同意','不同意','同意','非常同意'], reverse: false },
        { text: '总的来说，我倾向于觉得自己是一个失败者', options: ['非常不同意','不同意','同意','非常同意'], reverse: true },
        { text: '我能把事情做得和别人一样好', options: ['非常不同意','不同意','同意','非常同意'], reverse: false },
        { text: '我觉得自己没什么值得自豪的', options: ['非常不同意','不同意','同意','非常同意'], reverse: true },
        { text: '我对自己持肯定态度', options: ['非常不同意','不同意','同意','非常同意'], reverse: false },
        { text: '总的来说我对自己很满意', options: ['非常不同意','不同意','同意','非常同意'], reverse: false },
        { text: '我希望能为自己赢得更多尊重', options: ['非常不同意','不同意','同意','非常同意'], reverse: true },
        { text: '我确实时常感到自己毫无用处', options: ['非常不同意','不同意','同意','非常同意'], reverse: true },
        { text: '我时常认为自己一无是处', options: ['非常不同意','不同意','同意','非常同意'], reverse: true },
      ],
      scoring: '1-4分/题（反向题反向计分），总分10-40，越高自尊水平越高',
    },
    cdrisc10: {
      name: '心理弹性量表 (CD-RISC-10)',
      ref: 'Campbell-Sills & Stein, 2007',
      timeFrame: '过去一个月',
      items: [
        { text: '我能够适应变化', options: ['从不','很少','有时','经常','总是'] },
        { text: '我能应对任何困难', options: ['从不','很少','有时','经常','总是'] },
        { text: '我能看到事情有趣的一面', options: ['从不','很少','有时','经常','总是'] },
        { text: '应对压力让我变得更坚强', options: ['从不','很少','有时','经常','总是'] },
        { text: '生病或困难后我能很快恢复', options: ['从不','很少','有时','经常','总是'] },
        { text: '即使有障碍我仍能达成目标', options: ['从不','很少','有时','经常','总是'] },
        { text: '压力下我能保持专注清晰思考', options: ['从不','很少','有时','经常','总是'] },
        { text: '我不会因失败而气馁', options: ['从不','很少','有时','经常','总是'] },
        { text: '我认为自己是一个坚强的人', options: ['从不','很少','有时','经常','总是'] },
        { text: '我能处理不愉快的感受', options: ['从不','很少','有时','经常','总是'] },
      ],
      scoring: '0-4分/题，总分0-40，越高心理弹性越好',
    },
  },

  // ---- 心理学系统观知识库 ----
  // 来源：系统式心理治疗理论、家庭治疗、生物-心理-社会模型
  getKnowledgeBase() {
    return {
      // 核心观点
      coreView: "系统观认为个体心理问题不能脱离其人际关系系统来理解。传统疗法聚焦个体内部（认知/情绪/行为），系统观则关注人与人之间的相互影响和互动模式。",
      vsTraditional: "传统疗法：线性因果、决定论、个体内部视角。系统疗法：循环因果、互动模式、外部（关系）视角。系统观不是抛弃传统疗法，而是博采众长综合运用。",

      // 关键概念
      homeostasis: "稳态/动态平衡：系统有维持平衡的内在驱动力。问题行为可能是系统维持稳态的「解决方案」。",
      feedback: "反馈回路：正反馈放大变化，负反馈维持稳定。治疗师通过干预打破僵化的互动模式，触发系统的自我组织变化。",
      circularCausality: "循环因果而非线性因果：A导致B→B又影响A。心理问题不是单一原因导致的直线结果，而是系统中多方互动的循环过程。",
      triangulation: "三角化：二人关系出现困难时引入第三方（人或物）以减轻焦虑。例如夫妻关系紧张时，孩子成为「替罪羊」。",
      differentiation: "分化与融合：健康的人既有独立自主精神又能与人结成亲密关系。分化良好的人情绪稳定，不轻易被他人的情绪裹挟。",
      boundaries: "边界：系统间的界限。刚性边界导致疏离，模糊边界导致纠缠。健康系统有清晰而可渗透的边界。",
      equifinality: "等终局性：不同路径可导致相同结果。同一行为在不同系统中可能有不同意义。",
      reframing: "重构/重新定义：为问题行为赋予积极意义。例如「把对亲人生气理解为对亲人特别关心」，改变视角从而改变应对方式。",

      // 主要流派
      structural: "结构治疗（Minuchin）：帮助家庭建立灵活、有清晰分界线的组织结构。调整子系统间的权力层级和边界。使用家庭雕塑技术外化沟通模式。",
      strategic: "策略治疗（Haley/Madanes）：通过改变反复发生的行为序列来解决问题。采用悖论干预、保持症状策略等技术。",
      intergenerational: "代间治疗（Bowen）：重视原生家庭的影响，通过家谱图分析代际传递模式，提高分化水平。",
      narrative: "叙事治疗（White & Epston）：将问题与人分离的外化技术，重构个人故事。问题本身是问题，人不是问题。",

      // 核心进阶概念
      firstOrderChange: "第一序改变：在系统内部改变行为，不改变系统结构本身。例如父母更严格地管教孩子，仍维持原有权力关系。",
      secondOrderChange: "第二序改变：改变系统本身的结构和规则。例如父母停止管教，转而反思亲子互动模式。心理治疗的目标是第二序改变。",
      identifiedPatient: "索引病人/被认定的病人：家庭中承担症状的人，往往是系统问题的承受者和表达者。孩子出现问题有时是父母婚姻问题的「症状」。",
      familySculpture: "家庭雕塑（Satir）：通过身体姿态和空间位置外化家庭关系。让成员摆出姿势代表彼此的沟通模式（指责型/讨好型/超理智型/打岔型），直观感受系统动力。",
      constructivist: "建构主义视角：治疗师不判断「真相」，而是与来访者共同建构症状的意义。改变对问题的解释框架比改变问题本身更重要。",
      familyLifeCycle: "家庭生命周期：家庭在不同阶段面临不同发展任务。青年独立→伴侣结合→育儿→子女离巢→晚年。每个阶段的过渡期最容易出现心理问题。",

      // 应用工具
      genogram: "家谱图：家庭治疗中用于绘制关系和代际模式的可视化工具，至少三代，包含情感关系线（亲密/冲突/疏远）和代际重复模式。",
      externalization: "外化技术（White）：将问题与人分开——「问题本身是问题，人不是问题」。让当事人客观看待问题，减少自责和羞耻感。",
      circularQuestioning: "循环提问：不问「为什么」，而问「当A做X的时候，B会怎么做？」。通过问题揭示互动模式而非寻找线性归因。",
      paradoxicalIntervention: "悖论干预/保持症状：要求来访者继续或加重症状，打破「试图控制→失败→更焦虑」的恶性循环。症状被重新定义为可主动控制的行为。",
      biopsychosocial: "生物-心理-社会模型（Engel 1977）：健康与疾病是生物、心理、社会三方面因素相互作用的结果。心理评估和治疗必须同时考虑三个层面。",

      // 日常应用
      dailyTip: "系统观的日常应用：1) 跳出自我看关系模式，从旁观看自己如何与他人互动；2) 问「这件事在什么情境下发生」而非「他/她为什么这样」；3) 意识到每个行为都在系统中产生反馈；4) 改变互动方式比改变人更容易；5) 第一序改变无效时，尝试第二序改变——改变规则本身。",
    };
  },
};
