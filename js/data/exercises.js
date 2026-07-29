// ===== 运动数据库 =====
// 来源：WHO身体活动指南、ACSM运动指南、ExerciseDB
// 更新：2026年7月
// 分类：按身体部位+器材需求+强度

const ExerciseDB = {
  // ---- 有氧运动 ----
  cardio: [
    { id: 'C01', name: '快走', duration: 5, unit: '分钟', intensity: 'moderate', met: 3.5,
      desc: '自然摆臂，步伐比散步稍快，感觉微喘但能说话', equip: 'none', space: 'any',
      benefits: ['心肺','下肢','燃脂'], calories: { perMin: 4 }, tags: ['入门','日常'],
      howTo: ['抬头挺胸，肩膀后沉，自然摆臂','步伐比散步稍快，保持稳定节奏','感觉微喘但能完整说话','持续至少10分钟为一次有效运动'] },
    { id: 'C02', name: '慢跑', duration: 5, unit: '分钟', intensity: 'vigorous', met: 7.0,
      desc: '轻松跑速，能说短句但无法完整对话', equip: '跑鞋', space: 'outdoor',
      benefits: ['心肺','下肢','燃脂'], calories: { perMin: 8 }, tags: ['有基础','燃脂'] },
    { id: 'C03', name: '原地踏步', duration: 3, unit: '分钟', intensity: 'moderate', met: 3.0,
      desc: '像行军一样抬腿摆臂，膝盖抬高到腰部高度', equip: 'none', space: 'indoor',
      benefits: ['心肺','下肢'], calories: { perMin: 3.5 }, tags: ['入门','办公室'] },
    { id: 'C04', name: '开合跳', duration: 1, unit: '分钟', intensity: 'vigorous', met: 8.0,
      desc: '双脚开合配合双手过头拍手，保持节奏', equip: 'none', space: 'indoor',
      benefits: ['心肺','全身','燃脂'], calories: { perMin: 10 }, tags: ['燃脂','HIIT'] },
    { id: 'C05', name: '高抬腿', duration: 1, unit: '分钟', intensity: 'vigorous', met: 8.5,
      desc: '原地快速抬腿至大腿与地面平行，配合摆臂', equip: 'none', space: 'indoor',
      benefits: ['心肺','下肢','核心'], calories: { perMin: 11 }, tags: ['HIIT','燃脂'] },
    { id: 'C06', name: '爬楼梯', duration: 5, unit: '分钟', intensity: 'vigorous', met: 6.0,
      desc: '一次跨一阶，保持节奏，可乘电梯下楼', equip: '楼梯', space: 'building',
      benefits: ['心肺','下肢','臀部'], calories: { perMin: 7 }, tags: ['日常','燃脂'] },
    { id: 'C07', name: '跳绳', duration: 3, unit: '分钟', intensity: 'vigorous', met: 10.0,
      desc: '双脚同时跳起，手腕发力摇绳，落地轻缓', equip: '跳绳', space: 'indoor',
      benefits: ['心肺','全身','协调'], calories: { perMin: 12 }, tags: ['高效','燃脂'] },
    { id: 'C08', name: '骑车（通勤）', duration: 10, unit: '分钟', intensity: 'moderate', met: 5.0,
      desc: '平地骑行，保持60-80转/分钟', equip: '自行车', space: 'outdoor',
      benefits: ['心肺','下肢'], calories: { perMin: 6 }, tags: ['通勤','日常'] },
  ],

  // ---- 力量训练：上肢 ----
  upperBody: [
    { id: 'U01', name: '标准俯卧撑', sets: 3, reps: 10, rest: 30,
      desc: '双手略宽于肩，身体成直线，下降至胸部贴近地面', equip: 'none', space: 'indoor',
      difficulty: 3, target: ['胸大肌','肱三头肌','三角肌前束'], benefits: ['上肢推力','核心'],
      tags: ['经典','上肢'], modifier: '可做跪姿俯卧撑降低难度' , howTo: ['双手撑地略宽于肩，手指向前', '身体从头到脚跟成一条直线', '下降时胸部贴近地面，肘部45度', '推起时呼气，下降时吸气']},
    { id: 'U02', name: '跪姿俯卧撑', sets: 3, reps: 12, rest: 30,
      desc: '双膝跪地，身体从膝盖到肩成直线，下降至胸部贴近地面', equip: 'none', space: 'indoor',
      difficulty: 1, target: ['胸大肌','肱三头肌'], benefits: ['上肢推力'],
      tags: ['入门','上肢'], modifier: '膝盖下垫软垫' },
    { id: 'U03', name: '哑铃推举', sets: 3, reps: 12, rest: 30,
      desc: '坐姿或站姿，哑铃从肩部推至头顶上方', equip: '哑铃', space: 'indoor',
      difficulty: 2, target: ['三角肌','肱三头肌'], benefits: ['上肢推力','肩部'],
      tags: ['力量','上肢'], modifier: '可用装满水的矿泉水瓶代替哑铃' },
    { id: 'U04', name: '哑铃弯举', sets: 3, reps: 12, rest: 30,
      desc: '站姿，大臂贴身体不动，前臂弯举哑铃至肩前', equip: '哑铃', space: 'indoor',
      difficulty: 1, target: ['肱二头肌'], benefits: ['上肢拉力'],
      tags: ['力量','上肢','入门'], modifier: '可用弹力带或水瓶代替' },
    { id: 'U05', name: '椅子臂屈伸', sets: 3, reps: 10, rest: 30,
      desc: '双手撑在椅子边缘，身体前移，屈肘下降后撑起', equip: '椅子', space: 'office',
      difficulty: 2, target: ['肱三头肌','胸肌下沿'], benefits: ['上肢推力'],
      tags: ['办公室','上肢'], modifier: '椅子必须稳固' },
    { id: 'U06', name: '平板支撑', sets: 3, reps: 30, rest: 20, unit: '秒',
      desc: '前臂和脚尖支撑，身体成直线，收紧核心', equip: 'none', space: 'indoor',
      difficulty: 2, target: ['腹横肌','核心'], benefits: ['核心稳定'],
      tags: ['核心','经典'], modifier: '可做跪姿平板降低难度' },
    { id: 'U07', name: '弹力带划船', sets: 3, reps: 12, rest: 30,
      desc: '坐姿，弹力带固定于脚底，双手后拉至腹部两侧', equip: '弹力带', space: 'indoor',
      difficulty: 2, target: ['背阔肌','肱二头肌'], benefits: ['上肢拉力','背部'],
      tags: ['力量','背部'], modifier: '可用毛巾代替做模拟划船' },
  ],

  // ---- 力量训练：下肢 ----
  lowerBody: [
    { id: 'L01', name: '徒手深蹲', sets: 3, reps: 15, rest: 30,
      desc: '双脚与肩同宽，臀部后坐下蹲至大腿与地面平行', equip: 'none', space: 'indoor',
      difficulty: 1, target: ['股四头肌','臀部','腘绳肌'], benefits: ['下肢推力'],
      tags: ['经典','下肢','入门'], modifier: '初始可做半蹲' , howTo: ['双脚与肩同宽，脚尖微微向外', '臀部后坐，像要坐在椅子上', '下蹲至大腿与地面平行', '膝盖不超过脚尖，胸部挺起', '起身时收紧臀部']},
    { id: 'L02', name: '弓步蹲', sets: 3, reps: 10, rest: 30, unit: '每侧',
      desc: '单腿向前跨出屈膝至双膝均约90度，交替进行', equip: 'none', space: 'indoor',
      difficulty: 2, target: ['股四头肌','臀部','核心稳定'], benefits: ['下肢推力','平衡'],
      tags: ['下肢','平衡'], modifier: '可扶墙保持平衡' },
    { id: 'L03', name: '臀桥', sets: 3, reps: 15, rest: 30,
      desc: '仰卧屈膝，臀部发力向上顶起至身体成直线', equip: '垫子', space: 'indoor',
      difficulty: 1, target: ['臀部','腘绳肌','核心'], benefits: ['下肢推力','核心'],
      tags: ['臀部','入门'], modifier: '可单腿增加难度' },
    { id: 'L04', name: '提踵（踮脚尖）', sets: 3, reps: 20, rest: 20,
      desc: '站姿，双脚踮起脚尖至最高点后缓慢放下', equip: 'none', space: 'any',
      difficulty: 1, target: ['小腿'], benefits: ['下肢','脚踝稳定'],
      tags: ['入门','办公室','日常'], modifier: '可在台阶上做增加幅度' },
    { id: 'L05', name: '靠墙静蹲', sets: 3, reps: 30, rest: 20, unit: '秒',
      desc: '背靠墙滑下至大腿与地面平行，保持姿势', equip: '墙', space: 'office',
      difficulty: 2, target: ['股四头肌','臀部'], benefits: ['下肢静力'],
      tags: ['办公室','下肢'], modifier: '不用蹲太低' },
    { id: 'L06', name: '侧弓步', sets: 3, reps: 8, rest: 30, unit: '每侧',
      desc: '单脚向侧跨出屈膝，另一腿伸直，交替进行', equip: 'none', space: 'indoor',
      difficulty: 2, target: ['内收肌','臀部'], benefits: ['下肢','灵活性'],
      tags: ['下肢','灵活性'], modifier: '幅度循序渐进' },
  ],

  // ---- 核心训练 ----
  core: [
    { id: 'A01', name: '卷腹', sets: 3, reps: 15, rest: 20,
      desc: '仰卧屈膝，双手放胸前或耳侧，上背部抬起', equip: '垫子', space: 'indoor',
      difficulty: 1, target: ['腹直肌'], benefits: ['核心屈曲'],
      tags: ['核心','入门'], modifier: '下背部始终贴地' },
    { id: 'A02', name: '仰卧抬腿', sets: 3, reps: 10, rest: 20,
      desc: '仰卧，双腿伸直抬起至与地面垂直后缓慢放下', equip: '垫子', space: 'indoor',
      difficulty: 3, target: ['腹直肌下部','髋屈肌'], benefits: ['核心屈曲'],
      tags: ['核心','进阶'], modifier: '可屈膝降低难度' },
    { id: 'A03', name: '鸟狗式', sets: 3, reps: 8, rest: 20, unit: '每侧',
      desc: '四足跪姿，同时伸展对侧手臂和腿，保持身体稳定', equip: '垫子', space: 'indoor',
      difficulty: 1, target: ['核心稳定','背部','臀部'], benefits: ['核心稳定','平衡'],
      tags: ['核心','入门','康复'], modifier: '动作放慢注重控制' },
    { id: 'A04', name: '侧支撑', sets: 3, reps: 20, rest: 20, unit: '秒',
      desc: '侧卧前臂支撑，身体成直线，臀部不塌陷', equip: '垫子', space: 'indoor',
      difficulty: 2, target: ['腹斜肌','核心'], benefits: ['核心侧向稳定'],
      tags: ['核心','进阶'], modifier: '可屈膝降低难度' },
    { id: 'A05', name: '死虫式', sets: 3, reps: 8, rest: 20, unit: '每侧',
      desc: '仰卧四肢朝天，对侧手脚同步缓慢放下再收回', equip: '垫子', space: 'indoor',
      difficulty: 1, target: ['腹横肌','核心稳定'], benefits: ['核心控制'],
      tags: ['核心','康复','入门'], modifier: '动作放慢注重呼吸' },
    { id: 'A06', name: '俄罗斯转体', sets: 3, reps: 12, rest: 20, unit: '每侧',
      desc: '坐姿屈膝半躺，双手合十左右旋转躯干', equip: 'none', space: 'indoor',
      difficulty: 2, target: ['腹斜肌','核心'], benefits: ['核心旋转'],
      tags: ['核心','燃脂'], modifier: '可手持水瓶增加负重' },
  ],

  // ---- 拉伸/柔韧性 ----
  stretch: [
    { id: 'S01', name: '颈部侧屈拉伸', duration: 15, unit: '秒', side: '每侧',
      desc: '坐姿，一手放头侧轻轻拉向同侧肩膀，另一手向下沉', equip: 'none', space: 'office',
      difficulty: 1, target: ['胸锁乳突肌','斜方肌上部'], benefits: ['颈部放松'],
      tags: ['办公室','拉伸','肩颈'], caution: '不要用猛力拉' },
    { id: 'S02', name: '肩部环绕', duration: 30, unit: '秒',
      desc: '双肩同时向前/向后做最大幅度环绕', equip: 'none', space: 'office',
      difficulty: 1, target: ['肩关节','肩袖'], benefits: ['肩部活动度'],
      tags: ['办公室','拉伸','热身'], caution: '幅度循序渐进' },
    { id: 'S03', name: '猫牛式', duration: 45, unit: '秒',
      desc: '四足跪姿，吸气抬头塌腰（牛式），呼气低头弓背（猫式）', equip: '垫子', space: 'indoor',
      difficulty: 1, target: ['脊柱','核心'], benefits: ['脊柱灵活','背部放松'],
      tags: ['拉伸','脊柱','康复'], caution: '配合呼吸' , howTo: ['四足跪姿，双手在肩正下方', '吸气时抬头塌腰（牛式）', '呼气时低头弓背（猫式）', '动作配合呼吸，重复5-8次']},
    { id: 'S04', name: '腘绳肌拉伸', duration: 20, unit: '秒', side: '每侧',
      desc: '坐姿一腿伸直一腿屈，向前弯腰手碰脚尖', equip: 'none', space: 'indoor',
      difficulty: 1, target: ['腘绳肌','小腿'], benefits: ['下肢柔韧'],
      tags: ['拉伸','下肢','入门'], caution: '不要弹震' },
    { id: 'S05', name: '胸部拉伸（门框）', duration: 20, unit: '秒', side: '每侧',
      desc: '站姿前臂扶门框，身体向前转打开胸肌', equip: '门框', space: 'office',
      difficulty: 1, target: ['胸大肌','三角肌前束'], benefits: ['胸部放松','改善圆肩'],
      tags: ['办公室','拉伸','体态'], caution: '感受拉伸感即可' },
    { id: 'S06', name: '下背部扭转', duration: 20, unit: '秒', side: '每侧',
      desc: '仰卧屈膝，双膝倒向一侧，头转向另一侧', equip: '垫子', space: 'indoor',
      difficulty: 1, target: ['竖脊肌','腰部'], benefits: ['腰部放松','脊柱灵活'],
      tags: ['拉伸','腰部','康复'], caution: '双肩不离开地面' },
    { id: 'S07', name: '手腕拉伸', duration: 15, unit: '秒', side: '每侧',
      desc: '一手前伸手掌朝前，另一手轻拉手指向身体方向', equip: 'none', space: 'office',
      difficulty: 1, target: ['腕屈肌','腕伸肌'], benefits: ['手腕放松'],
      tags: ['办公室','拉伸'], caution: '有手腕伤谨慎' },
    { id: 'S08', name: '髋屈肌拉伸', duration: 20, unit: '秒', side: '每侧',
      desc: '弓步跪姿，后侧腿膝盖着地，身体前移拉伸髋前部', equip: '垫子', space: 'indoor',
      difficulty: 2, target: ['髂腰肌','髋屈肌'], benefits: ['髋部灵活','久坐改善'],
      tags: ['拉伸','下肢','久坐'], caution: '保持骨盆中立' },
  ],

  // ---- 微运动（办公室/随时） ----
  micro: [
    { id: 'M01', name: '耸肩运动', reps: 10, unit: '次',
      desc: '双肩用力上耸至耳部高度，保持2秒后放松', equip: 'none', space: 'office',
      difficulty: 1, target: ['斜方肌'], benefits: ['肩部放松'],
      tags: ['办公','微运动','随时'] },
    { id: 'M02', name: '头部左右旋转', reps: 10, unit: '次',
      desc: '缓慢将头转向左侧至最大幅度，再转向右侧', equip: 'none', space: 'office',
      difficulty: 1, target: ['胸锁乳突肌'], benefits: ['颈部活动度'],
      tags: ['办公','微运动','随时'] },
    { id: 'M03', name: '手腕绕环', reps: 10, unit: '每侧',
      desc: '手臂前伸，手腕做最大幅度环绕', equip: 'none', space: 'office',
      difficulty: 1, target: ['腕关节'], benefits: ['手腕灵活'],
      tags: ['办公','微运动'] },
    { id: 'M04', name: '坐姿脊柱扭转', reps: 5, unit: '每侧',
      desc: '坐姿，一手扶对侧膝盖，身体向该侧扭转看后方', equip: '椅子', space: 'office',
      difficulty: 1, target: ['脊柱','腰部'], benefits: ['腰部放松'],
      tags: ['办公','微运动'] },
    { id: 'M05', name: '提膝运动', reps: 10, unit: '每侧',
      desc: '坐姿，交替抬起膝盖至胸部方向', equip: '椅子', space: 'office',
      difficulty: 1, target: ['髋屈肌','核心'], benefits: ['下肢活动'],
      tags: ['办公','微运动'] },
    { id: 'M06', name: '踝泵运动', reps: 20, unit: '次',
      desc: '坐姿或躺姿，脚尖尽力向前压再向后勾', equip: 'none', space: 'any',
      difficulty: 1, target: ['小腿','踝关节'], benefits: ['促进循环','预防血栓'],
      tags: ['办公','康复','长途旅行'] },
  ],

  // ---- 组合计划 ----
  plans: {
    minimal: {
      name: '最低有效量',
      desc: 'WHO推荐最低标准：每周150分钟有氧+2次力量',
      weekly: [
        { day: '周一', items: [{ type: 'cardio', id: 'C01', duration: 25 }, { type: 'micro', id: 'M02' }] },
        { day: '周二', items: [{ type: 'strength', category: 'upperBody', ids: ['U02','U06','U03'], duration: 12 }] },
        { day: '周三', items: [{ type: 'cardio', id: 'C08', duration: 25 }] },
        { day: '周四', items: [{ type: 'strength', category: 'lowerBody', ids: ['L01','L03','L06'], duration: 12 }] },
        { day: '周五', items: [{ type: 'cardio', id: 'C01', duration: 25 }] },
        { day: '周六', items: [{ type: 'cardio', id: 'C02', duration: 30 }, { type: 'stretch', ids: ['S03','S04','S08'] }] },
        { day: '周日', items: [{ type: 'stretch', ids: ['S03','S06','S08'], duration: 10 }] },
      ],
      howTo: ['抬头挺胸，肩膀后沉，自然摆臂', '步伐比散步稍快，保持稳定节奏', '感觉微喘但能完整说话', '持续至少10分钟为一次有效运动']
    },
    regular: {
      name: '规律运动',
      desc: '每周3-4次系统训练+日常有氧',
      weekly: [
        { day: '周一', items: [{ type: 'strength', category: 'upperBody', ids: ['U01','U03','U04','U07'], duration: 20 }] },
        { day: '周二', items: [{ type: 'cardio', id: 'C02', duration: 25 }] },
        { day: '周三', items: [{ type: 'strength', category: 'lowerBody', ids: ['L01','L02','L05','L04'], duration: 20 }] },
        { day: '周四', items: [{ type: 'cardio', id: 'C07', duration: 15 }, { type: 'strength', category: 'core', ids: ['A01','A04','A06'], duration: 10 }] },
        { day: '周五', items: [{ type: 'cardio', id: 'C01', duration: 30 }] },
        { day: '周六', items: [{ type: 'strength', category: 'full', ids: ['U02','L01','A03','U05'], duration: 25 }] },
        { day: '周日', items: [{ type: 'stretch', ids: ['S01','S03','S05','S06','S08'], duration: 15 }] },
      ]
    },
    casual: {
      name: '有灵感就动',
      desc: '没有固定计划，根据时间和状态推荐',
    }
  },

  // ---- 按条件推荐运动 ----
  recommend(opts = {}) {
    const { time, equip, intensity, target, mood } = opts;
    let pool = [];
    // 短时间推荐微运动
    if (time && time <= 3) pool = this.micro;
    else if (time && time <= 8) pool = [...this.stretch, ...this.micro];
    else if (time && time <= 15) pool = [...this.cardio.filter(c => c.duration <= 15), ...this.stretch];
    else pool = [...this.cardio, ...this.upperBody, ...this.lowerBody, ...this.core, ...this.stretch];
    return pool;
  },

  // ---- 根据身体状况推荐 ----
  getByCondition(condition) {
    const map = {
      neck_pain: ['S01','M02','S02','S07'],
      shoulder_pain: ['S02','S05','U05','M01'],
      back_pain: ['S03','S06','A03','S08'],
      knee_pain: ['L03','L04','S04'],
      wrist_pain: ['S07','M03'],
    
    };
    return (map[condition] || []).map(id =>
      [...this.stretch, ...this.micro, ...this.upperBody, ...this.lowerBody, ...this.core]
        .flat().find(e => e.id === id)
    ).filter(Boolean);
  },

  // 获取运动科学知识库（供AI使用）
  getKnowledgeBase() {
    return {
      who: "WHO建议：成年人每周至少150分钟中等强度有氧运动，或75分钟高强度有氧运动，加2次力量训练",
      intensity: "中等强度MET 3.0-5.9（快走、骑车），高强度MET≥6.0（跑步、跳绳）",
      hrFormula: "最大心率=208-0.7×年龄（Tanaka公式），靶心率=静息心率+(最大心率-静息心率)×(40-85%)",
      rpe: "Borg RPE量表：0=休息，5-6=中等，7-8=高强度，10=极限",
      fitt: "FITT-VP原则：频率(Frequency)、强度(Intensity)、时间(Time)、类型(Type)、总量(Volume)、进阶(Progression)",
      warmup: "每次运动前热身5-10分钟，运动后整理拉伸5-10分钟",

      // 中国《全民健身指南》官方标准（2017年国家体育总局发布）
      china_intensity: "中国标准：小强度≤100次/分（散步）；中等强度100-140次/分（健步走/慢跑/骑车12-16km/h）；大强度≥140次/分（跑步8km/h+/快骑16km/h+）",
      china_weekly: "中国《全民健身指南》：每周运动3-7天，每天有效运动30-90分钟（每次≥10分钟）；中等强度每周累计150-300分钟；大强度每周累计75分钟以上；最优效果每周300分钟中等或150分钟大强度",
      china_strength: "中国指南：每周2-3次力量练习，不少于5次牵拉练习",
      china_phased: "中国指南分期方案：初期（前8周）有氧强度60-65%最大心率；中期（8周后）逐步增至70-80%最大心率；长期稳定期5-7天/周，大强度每周不超过3次",
      china_structure: "完整健身流程：准备活动5-10分钟 → 基本活动（有氧/力量/球类/传统运动）→ 放松活动5-10分钟",
      china_daily: "日常活动：每天主动身体活动6000步，减少久坐每小时起身活动",
    };
  },
};
