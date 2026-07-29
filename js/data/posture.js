// ===== 体态与办公室健康数据库 =====
// 来源：OSHA办公人体工学指南、美国脊骨神经医学会、物理治疗循证实践
// 更新：2026年7月

const PostureDB = {
  // ---- 正确坐姿检查清单 ----
  sittingChecklist: [
    { item: '双脚平放地面，膝盖约90度', icon: 'feet', detail: '双脚不交叉，踩实地面，膝弯处有2-3指空隙' },
    { item: '腰部有支撑，下背不悬空', icon: 'back', detail: '腰靠椅背或放腰垫，骨盆保持中立' },
    { item: '肩部放松，不耸肩', icon: 'shoulders', detail: '双肩自然下沉，耳垂与肩峰在一条垂线' },
    { item: '屏幕与眼睛水平或略低', icon: 'screen', detail: '屏幕上缘与视线齐平，距离一臂长（50-70cm）' },
    { item: '前臂与地面平行，手腕伸直', icon: 'arms', detail: '肘关节约90度，手腕不向上/下弯折' },
    { item: '头部不前伸，收下巴', icon: 'head', detail: '耳垂与肩峰垂直，下巴微收如双下巴姿势' },
  ],

  // ---- 常见体态问题与改善 ----
  postureIssues: [
    { id: 'P01', name: '上交叉综合症（圆肩驼背）',
      cause: '长时间伏案、胸部过紧、背部力量不足',
      symptoms: ['圆肩','头部前伸','上背部酸痛'],
      correctives: ['S04胸肌拉伸','U07弹力带划船','A03鸟狗式','靠墙站每天5分钟'] },
    { id: 'P02', name: '下交叉综合症（骨盆前倾）',
      cause: '久坐导致髋屈肌过紧、臀部和腹部力量不足',
      symptoms: ['腰部酸痛','小腹突出','站姿时腰椎过度前凸'],
      correctives: ['S07髋屈肌拉伸','L03臀桥','A01卷腹','靠墙深蹲'] },
    { id: 'P03', name: '办公族肩颈劳损',
      cause: '长时间低头看屏幕、耸肩打字',
      symptoms: ['肩颈僵硬','头痛','转头受限'],
      correctives: ['S01颈部拉伸','M02头部旋转','S02肩部环绕','调整屏幕高度'] },
  ],

  // ---- 20-20-20 护眼法则 ----
  eyeCare: {
    rule: '20-20-20法则',
    desc: '每20分钟看20英尺（6米）外20秒',
    tips: [
      '设置定时器每20分钟响一次',
      '看窗外远处物体，放松睫状肌',
      '刻意多眨眼，避免屏幕干眼症',
      '屏幕亮度与周围环境一致',
      '使用人工泪液（不含防腐剂）',
    ],
    exercises: [
      { name: '远近聚焦', duration: 30, desc: '看近处手指（10cm）→看远处（6m+），交替10次' },
      { name: '眼球运动', duration: 30, desc: '上下→左右→顺时针→逆时针，每个方向5次' },
      { name: '手掌热敷', duration: 60, desc: '搓热双手掌心轻盖眼部，深呼吸' },
    ],
  },

  // ---- 每日久坐提醒策略（基于2025-2026前沿研究）----
  // 研究显示：肌肉疲劳约40分钟出现，站立拉伸5分钟可恢复30-45分钟
  // 最佳坐站比例：30坐/15站（有下背痛者），一般人每20-30分钟起身
  sedentaryAlerts: [
    { afterMin: 20, action: '微休息：调整坐姿+眨眼20次', type: 'check', duration: 0.5 },
    { afterMin: 40, action: '站起来30秒+简单拉伸手臂', type: 'stand', duration: 0.5, ref: 'M03' },
    { afterMin: 60, action: '5分钟站立+肩颈拉伸（缓解肌肉疲劳）', type: 'stretch', duration: 5, ref: 'M02', research: '站立拉伸5分钟可保持肌肉恢复约30-45分钟' },
    { afterMin: 90, action: '起身走动+接杯水+看远处20秒', type: 'walk', duration: 3 },
    { afterMin: 120, action: '综合微运动：肩颈+腰部+手腕', type: 'micro', ref: 'M04', duration: 3 },
    { afterMin: 150, action: '眼部放松（20-20-20法则）+闭眼休息', type: 'eye', ref: 'eyeCare' },
    { afterMin: 180, action: '必要长休息：10分钟走动+综合拉伸', type: 'stretch', duration: 10, ref: 'S06', research: '一次性久坐不应超过2小时' },
  ],
  // 最佳坐站比例推荐
  sitStandRatio: {
    withBackPain: { sit: 30, stand: 15, cycle: 45, note: '2026 Applied Ergonomics研究证实此比例对下背痛最有效' },
    general: { sit: 45, stand: 10, walk: 5, cycle: 60, note: 'EU-OSHA推荐工作日内坐:站:走≈60%:30%:10%' },
    microBreak: { every: 20, duration: 1, note: 'Stanford EHS推荐每20分钟做30-60秒微休息' },
  },

  // ---- 办公桌微环境建议 ----
  workspace: {
    monitor: [
      '屏幕与眼睛距离50-70cm',
      '屏幕上缘与视线齐平或略低',
      '外接键盘鼠标避免笔记本自带的压迫姿势',
    ],
    desk: [
      '桌面高度：站立时与肘部齐平',
      '常用物品放在手臂可及范围内',
      '键盘前预留10cm空间支撑前臂',
    ],
    chair: [
      '座椅高度：双脚能平放地面',
      '座深：膝弯到座椅边缘2-3指',
      '有腰部支撑或加腰垫',
      '扶手高度：与肘部齐平',
    ],
    lighting: [
      '避免屏幕反光（窗户在侧面）',
      '环境光柔和，不直射眼睛',
      '屏幕亮度与环境光一致',
      '可使用防蓝光模式（睡前）',
    ],
  },

  // ---- 哪里不舒服->推荐动作 ----
  symptomRemedy: {
    '脖子': { moves: ['M02','S01'], caution: '不要360度绕颈', time: '2分钟' },
    '肩膀': { moves: ['S02','M01'], caution: '不要过度后伸', time: '2分钟' },
    '上背部': { moves: ['S03','S05'], caution: '动作放慢', time: '3分钟' },
    '腰部': { moves: ['S06','S08','M04'], caution: '有腰椎问题要谨慎', time: '3分钟' },
    '手腕': { moves: ['S07','M03'], caution: '不要过度屈伸', time: '1分钟' },
    '眼睛': { moves: ['eyeCare'], caution: '配合眨眼', time: '1分钟' },
    '臀部': { moves: ['S08'], caution: '保持骨盆中立', time: '2分钟每侧' },
    '膝盖': { moves: ['S04'], caution: '不过度拉伸', time: '2分钟每侧' },
  },

  getKnowledgeBase() {
    return {
      sitStand: "最佳坐站比例：有下背痛者30坐/15站；一般人群45坐/10站/5走。久坐每20-30分钟起身活动。",
      ergonomics: "屏幕与眼距离50-70cm，屏幕上缘与视线齐平。腰部有支撑，双脚平放。前臂与地面平行。",
      movement: "肌肉疲劳约40分钟出现，站立拉伸5分钟可恢复状态30-45分钟。",
      eyeCare: "20-20-20法则：每20分钟看20英尺外20秒。",
      totalSit: "工作日内总坐姿不超过5小时，坐约60%、站约30%、走约10%。",
    };
  },
};
