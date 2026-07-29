// ===== 每日计划数据库 =====
// 来源：MIT 3 Tasks Method（Josh Kaufman, The Personal MBA）、
//       Parkinson's Law（1957/2013实证）、
//       哈佛成人发展研究、时间管理心理学
// 核心理念：计划是为你服务的，不是让你有负罪感的

const PlanDB = {
  // ---- 计划风格 ----
  styles: [
    {
      id: 'relaxed',
      name: '宽松型',
      desc: '"完成了1件也是胜利"',
      defaultCount: 3,
      allowOvertime: true,
      autoClear: true,
      feedback: {
        done3: '今天大丰收！给自己一个肯定 🎉',
        done2: '完成了2/3，已经很好了 👏',
        done1: '今天做了1件事，比什么都不做好 💪',
        done0: '今天可能不太顺，没关系，明天是新的 🌱',
      },
      philosophy: '帕金森定律：工作会自动膨胀到占满所有可用时间。限制任务数量就是限制时间膨胀。',
    },
    {
      id: 'standard',
      name: '标准型',
      desc: '"尽量完成全部"',
      defaultCount: 3,
      allowOvertime: false,
      autoClear: true,
      feedback: {
        done3: '全部完成，今天效率满满！🎉',
        done2: '完成了2件，继续加油 💪',
        done1: '今天可能不太顺利，明天继续',
        done0: '没关系，明天重新开始',
      },
    },
  ],

  // ---- 默认任务数量选项 ----
  taskCountOptions: [3, 5, 0], // 0 = 不限制

  // ---- 提醒时间选项 ----
  reminderOptions: [
    { value: 'morning', label: '每天早上8:00', time: '08:00' },
    { value: 'evening', label: '前一天晚上', time: '21:00' },
    { value: 'none', label: '不要提醒', time: null },
  ],

  // ---- 任务分类标签（可选）----
  taskCategories: [
    { id: 'work', label: '工作', icon: '💼' },
    { id: 'personal', label: '个人', icon: '🏠' },
    { id: 'health', label: '健康', icon: '🏃' },
    { id: 'social', label: '社交', icon: '👥' },
    { id: 'study', label: '学习', icon: '📚' },
  ],

  // ---- 每日复盘提示 ----
  reviewPrompts: [
    '今天你做得最棒的一件事是什么？',
    '今天有什么值得记住的瞬间？',
    '如果今天重来，你会怎么做？',
    '今天学到了什么？',
    '今天要感谢谁？',
    '今天最让你意外的是什么？',
    '今天你克服了什么困难？',
    '今天有什么让你笑了？',
  ],

  // ---- 计划与各模块联动 ----
  linkages: {
    hasImportantMeeting: {
      condition: '任务包含会议/汇报/演讲',
      dietTip: '午餐推荐低碳水高蛋白（不犯困），避免高碳水和高糖',
      postureTip: '久坐提醒频率增加，表情提醒保持坐姿',
      mentalTip: '早晨意图推荐"自信"或"从容"',
    },
    hasWorkout: {
      condition: '任务包含运动',
      integration: '自动在时间线中安排运动时段，不重复录入',
    },
    hasLongWork: {
      condition: '任务包含长时间伏案工作',
      postureAlert: '久坐提醒每30分钟一次（默认45分钟）',
      eyeBreak: '每20分钟增加眼部放松提醒',
    },
  },

  // ---- 每日计划哲学（展示用）----
  philosophy: {
    title: '为什么是3件？',
    points: [
      '帕金森定律：工作会膨胀到填满可用时间。只放3件，剩下的时间自然会有，但不会被无谓填满。',
      'MIT法（Most Important Task）：识别真正重要的事，比列10件半途而废更有价值。',
      '认知负荷：人每天的意志力有限，3件是大多数人能完成的上限，5件以上就开始产生负罪感。',
      '反GTD：GTD追求"清空大脑"，但清空不等于完成。3件是"完成导向"，不是"记录导向"。',
      '完成了比完美重要：完成1件得到正面反馈，比列了10件只完成2件感觉好得多。',
    ],
  },

  // ---- 生涯规划知识库（框框 / 取景框看世界）----
  careerPlanning: {
    whyNoGoal: "对未来没想法，是因为对社会和各行业认识不够。信息差是迷茫的根本原因。",
    infoChannels: [
      { method: "咨询校友/业内人", rank: 1, desc: "找入行的学长学姐、业内大佬进行信息访谈，性价比最高" },
      { method: "实习", rank: 2, desc: "尽快开始实习，观察行业真实运作状态" },
      { method: "网络搜寻", rank: 3, desc: "在各大平台搜索与自己背景相似的人分享的经验" },
    ],
    principle: "从工作需求出发倒推规划。选定一个不反感且前景不错的领域，以目标岗位JD为基准去努力。出发点要高，即使未成功也能向下兼容。",
    campusActivities: [
      { name: "实习", importance: "最重要", note: "与目标工作的关联度决定价值" },
      { name: "比赛/项目", importance: "次重要", note: "看重与求职项目的关联度和含金量" },
      { name: "科研", importance: "除非学术/深造", note: "对多数岗位性价比低" },
      { name: "考证", importance: "相对不重要", note: "可作为倒逼自己学习实用技能的过程" },
      { name: "学生工作", importance: "初期有用", note: "加分有限，除非求职体制内" },
    ],
    mindset: [
      "学历是起点不是终点，不要给自己设限",
      "大学课程可能落后市场需求，这反而是机遇",
      "集中一点，登峰造极——围绕优势打造核心竞争力",
      "最重要的是入行并学到东西，小平台积累经验再跳槽",
    ],
  },

  // ---- 目标管理知识库（OKR + WBS + 系统思维）----
  goalManagement: {
    okr: "OKR：设定1-3个核心目标，每个目标对应2-3个可量化关键结果。目标要有挑战性，关键结果要可衡量。",
    wbs: "WBS工作分解结构：将大目标逐级分解为可执行的任务包。最末端任务要完成一个具体的可交付成果。没有WBS就没有项目管理。",
    goalOriented: "从任务导向到目标导向：以业务结果驱动计划与执行，每个任务都应可追溯到其价值。",
    decomposition: "目标分解法：大目标→里程碑→任务→子任务。每层分解下层之和必须完整覆盖上层（100%原则）。",
    criticalPath: "关键路径法：识别对整体进度影响最大的任务链。关键路径上的延迟直接导致整体延迟。",
    feedbackLoop: "计划-执行-检查-调整闭环：设定基线→执行→对比偏差→调整。定期复盘比制定计划更重要。",
  },
};
