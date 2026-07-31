// ============================================
// 全日健康 · 科学依据数据库(studies)
// 知程规划模块的全部功能均基于以下研究;
// 字段:id / tag / title / year / journal / claim / source / evidence / applied
// ============================================

const STUDIES = [
  {
    id: 'if-then',
    tag: '计划执行',
    title: 'if-then 实施意图(642 项测试荟萃分析)',
    year: 2024,
    journal: 'European Review of Social Psychology',
    claim: '把"我打算做X"写成"如果[情境],那么[行动]",目标达成率显著提升——环境线索自动触发行动,绕过意志力消耗。',
    source: 'Gollwitzer et al. (2024). European Review of Social Psychology. 642 项测试的元分析。',
    evidence: '★★★★★ 大规模元分析',
    applied: '知程「计划」模块:每个任务自动生成 if-then 触发规则',
  },
  {
    id: 'woop',
    tag: '目标设定',
    title: 'WOOP 心理对照(MCII 荟萃分析)',
    year: 2021,
    journal: 'Frontiers in Psychology',
    claim: '只幻想美好未来反而降低行动力;先想象愿望、再正视最大障碍、最后制定"如果障碍出现就…"计划,效果显著(g=0.336)。',
    source: 'Wang, Wang & Gai. Frontiers in Psychology. 21 项研究 / 15,907 名被试。',
    evidence: '★★★★☆ 荟萃分析',
    applied: '知程「目标」模块:WOOP 四步引导表单',
  },
  {
    id: 'goal-setting',
    tag: '目标设定',
    title: '目标设置理论:具体 + 有难度 + 反馈',
    year: 2002,
    journal: 'American Psychologist',
    claim: '具体且有挑战的目标显著优于"尽力而为";目标必须配反馈,没有反馈的目标效果大打折扣。',
    source: 'Locke & Latham (2002). American Psychologist. 35 年研究综述。',
    evidence: '★★★★★ 理论体系(35 年实证)',
    applied: '知程「数据」模块:完成率/偏差周报反馈',
  },
  {
    id: 'planning-fallacy',
    tag: '时间校准',
    title: '规划谬误与参照类别预测',
    year: 2008,
    journal: 'Planning Theory & Practice',
    claim: '人类系统性低估任务耗时(90% 以上项目超支);解药:不看"我觉得要多久",而查"这类任务通常要多久",再留 1.5~2 倍缓冲。',
    source: 'Kahneman & Tversky; Flyvbjerg (2008). Planning Theory & Practice; 《How Big Things Get Done》(2023)。',
    evidence: '★★★★★ 大型项目数据库实证',
    applied: '知程「计划」模块:参照类别时间校准提示(预估×1.5~2)',
  },
  {
    id: 'neuroscience',
    tag: '大脑机制',
    title: '计划 = 前额叶模拟 + 海马认知地图',
    year: 2024,
    journal: 'Nature Neuroscience',
    claim: '前额叶皮层像"模拟器"在脑内预演行动序列,海马体提供记忆场景;做计划前先回顾同类经历/数据,计划更可靠。',
    source: 'Jensen, Hennequin & Mattar (2024). Nature Neuroscience. DOI: 10.1038/s41593-024-01675-7。',
    evidence: '★★★★★ 顶刊 + 计算模型 + 双物种验证',
    applied: '知程「计划」模块:个人历史均值提示(同类任务实际耗时)',
  },
  {
    id: 'time-mgmt',
    tag: '时间管理',
    title: '时间管理到底有没有用?(荟萃分析)',
    year: 2021,
    journal: 'PLOS ONE',
    claim: '具体技巧(待办清单、日程表)效果有限;真正起作用的是"方向性":目标感、注意力控制、时间-目标一致性。',
    source: 'Aeon, Faber & Panaccio (2021). PLOS ONE 荟萃分析。',
    evidence: '★★★★☆ 荟萃分析',
    applied: '知程「专注」模块:番茄钟 + 方向性数据统计',
  },
];

// 参照类别数据库:常见任务类型的参考耗时(小时)
// 用于对抗规划谬误——预估时间时优先参考"这类任务通常要多久"
const REFERENCE_CLASSES = [
  { keyword: '论文', avgHours: 6, note: '含查资料、写作、修改' },
  { keyword: '报告', avgHours: 4, note: '含数据整理与排版' },
  { keyword: '读书', avgHours: 3, note: '每 100 页精读' },
  { keyword: '运动', avgHours: 1, note: '单次训练' },
  { keyword: '复习', avgHours: 2, note: '单科单元复习' },
  { keyword: '编程', avgHours: 3, note: '单个功能模块' },
  { keyword: '作业', avgHours: 1.5, note: '单科作业' },
  { keyword: '会议', avgHours: 1, note: '含准备' },
];
