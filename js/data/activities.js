// ===== 活动数据库（AI作息规划用）=====
// 按时段/类型/季节分类，供AI生成多样化日程参考

const ActivityDB = {
  // ---- 晨间活动 ----
  morning: {
    wakeup: [
      { label: '起床饮水', desc: '喝一杯温水，唤醒肠胃', duration: 3 },
      { label: '拉开窗帘', desc: '接触自然光，抑制褪黑素，重置生物钟', duration: 1 },
      { label: '伸懒腰', desc: '在床上做全身伸展，激活肌肉', duration: 2 },
      { label: '开窗通风', desc: '让新鲜空气进入，提高血氧', duration: 2 },
    ],
    stretch: [
      { label: '猫牛式', desc: '四足跪姿，吸气抬头塌腰，呼气低头弓背，活动脊柱', duration: 3 },
      { label: '肩部环绕', desc: '双肩同时向前/向后做大环绕，放松肩颈', duration: 2 },
      { label: '颈部拉伸', desc: '左右侧屈各15秒，缓解睡眠后的颈部僵硬', duration: 2 },
      { label: '体侧伸展', desc: '站姿双手交叉向上，向左右侧弯，拉伸侧腰', duration: 2 },
      { label: '髋部拉伸', desc: '弓步跪姿拉伸髋屈肌，改善久坐髋部紧张', duration: 3 },
    ],
    meditation: [
      { label: '深呼吸', desc: '腹式呼吸5次，吸气4秒呼气6秒，激活副交感神经', duration: 2 },
      { label: '今日意图', desc: '花30秒想今天想成为一个怎样的人', duration: 1 },
      { label: '感恩三秒', desc: '想一件值得感恩的事，提升积极情绪', duration: 0.5 },
      { label: '身体扫描', desc: '从头到脚快速扫描身体，注意紧张部位', duration: 3 },
    ],
  },

  // ---- 工作时段活动 ----
  work: {
    focus: [
      { label: '番茄工作', desc: '25分钟专注+5分钟休息，保持高效', duration: 30 },
      { label: '深工作', desc: '90分钟无干扰专注，关闭通知', duration: 90 },
      { label: '批处理', desc: '同类任务集中处理，减少切换损耗', duration: 60 },
      { label: '写作时段', desc: '专注写作/报告，先完成再完善', duration: 45 },
    ],
    break: [
      { label: '起身走走', desc: '离开座位走动3分钟，改善循环', duration: 3 },
      { label: '眼部放松', desc: '看6米外远处20秒+闭眼20秒', duration: 1 },
      { label: '肩颈放松', desc: '耸肩10次+头部左右旋转各5次', duration: 2 },
      { label: '喝水提醒', desc: '喝一杯水，保持水分充足', duration: 1 },
      { label: '窗外远眺', desc: '看远处绿色植物，调节睫状肌', duration: 2 },
      { label: '坐姿调整', desc: '检查耳肩髋是否在一条直线', duration: 1 },
    ],
    snack: [
      { label: '坚果加餐', desc: '一小把坚果（约10g），优质脂肪酸', duration: 5 },
      { label: '水果补充', desc: '一个当季水果，维生素+膳食纤维', duration: 5 },
      { label: '酸奶', desc: '一杯无糖酸奶，补充蛋白质和益生菌', duration: 5 },
      { label: '黑巧克力', desc: '1-2小块黑巧克力（≥70%可可），提神', duration: 3 },
    ],
  },

  // ---- 运动活动 ----
  exercise: {
    cardio: [
      { label: '快走', desc: '摆臂大步走，心率110-130，微喘能说话', duration: 20 },
      { label: '慢跑', desc: '轻松跑速，能说短句，注意落地轻缓', duration: 20 },
      { label: '跳绳', desc: '手腕发力摇绳，双脚轻跳，每组1分钟', duration: 10 },
      { label: '爬楼梯', desc: '一次跨一阶，保持节奏，电梯下楼', duration: 10 },
      { label: '原地踏步', desc: '抬腿至腰部高度，配合摆臂，室内可做', duration: 10 },
    ],
    strength: [
      { label: '徒手深蹲', desc: '双脚与肩同宽，臀部后坐下蹲至大腿平行', duration: 5 },
      { label: '俯卧撑', desc: '双手略宽于肩，身体成直线，下降至胸部贴近地面', duration: 5 },
      { label: '平板支撑', desc: '前臂支撑，身体成直线，收紧核心', duration: 3 },
      { label: '臀桥', desc: '仰卧屈膝，臀部发力向上顶起至身体成直线', duration: 5 },
      { label: '弓步蹲', desc: '单腿向前跨出屈膝至90度，交替进行', duration: 5 },
    ],
    flexibility: [
      { label: '全身拉伸', desc: '从上到下拉伸主要肌群，每个动作15秒', duration: 10 },
      { label: '瑜伽流动', desc: '猫牛式→下犬式→战士式→婴儿式串联', duration: 15 },
      { label: '泡沫轴放松', desc: '用泡沫轴滚动大腿/背部/臀部，放松筋膜', duration: 10 },
    ],
  },

  // ---- 晚间活动 ----
  evening: {
    leisure: [
      { label: '阅读纸质书', desc: '读一本轻松的书，减少屏幕时间', duration: 30 },
      { label: '听音乐', desc: '听舒缓的纯音乐或自然白噪音', duration: 20 },
      { label: '写日记', desc: '记录今天的三件好事和感受', duration: 10 },
      { label: '与家人聊天', desc: '和家人朋友聊聊天，分享今天的事', duration: 15 },
      { label: '整理房间', desc: '简单整理桌面/卧室，环境整洁有助放松', duration: 15 },
      { label: '培养爱好', desc: '做一件自己感兴趣的事（乐器/画画/手工）', duration: 30 },
    ],
    sleep_prep: [
      { label: '调暗灯光', desc: '将室内灯光调至暖黄光，降低色温', duration: 1 },
      { label: '放下手机', desc: '将手机放在卧室外充电，减少蓝光暴露', duration: 0.5 },
      { label: '温水泡脚', desc: '40°C温水泡脚10分钟，促进血液循环', duration: 10 },
      { label: '腹式呼吸', desc: '4-7-8呼吸法：吸气4秒→屏息7秒→呼气8秒', duration: 5 },
      { label: '身体扫描', desc: '从脚到头扫描身体，放松每一部位', duration: 5 },
      { label: '感恩回顾', desc: '回想今天三件值得感恩的事', duration: 3 },
      { label: '阅读', desc: '读几页轻松的纸质书，避免刺激内容', duration: 10 },
    ],
  },

  // ---- 季节性推荐 ----
  seasonal: {
    spring: {
      produce: ['春笋','荠菜','香椿','菠菜','草莓','芦笋'],
      activities: ['踏青','骑行','放风筝','户外慢跑'],
      tips: '春季阳气升发，适合增加户外活动。多吃应季绿叶菜，补充维生素。',
    },
    summer: {
      produce: ['西瓜','黄瓜','番茄','苦瓜','绿豆','莲子'],
      activities: ['游泳','晨跑（清晨）','室内健身','傍晚散步'],
      tips: '夏季注意避暑，运动避开中午高温时段。多补水，适量吃瓜类解暑。',
    },
    autumn: {
      produce: ['梨','莲藕','山药','南瓜','柿子','银耳'],
      activities: ['登山','长跑','骑行','秋季徒步'],
      tips: '秋季气候宜人，适合增加户外耐力运动。注意润肺防燥。',
    },
    winter: {
      produce: ['萝卜','白菜','羊肉','红薯','橙子','猕猴桃'],
      activities: ['室内力量','瑜伽','游泳（室内）','快走'],
      tips: '冬季注意保暖，运动前充分热身。多吃根茎类蔬菜补充能量。',
    },
  },

  // ---- 一日三餐参考 ----
  meals: {
    breakfast: [
      { label: '全麦三明治+牛奶', desc: '全麦面包+鸡蛋+生菜+番茄+一杯牛奶' },
      { label: '燕麦粥+鸡蛋', desc: '燕麦片煮粥+一个水煮蛋+几颗坚果' },
      { label: '小米粥+包子', desc: '小米粥+素菜包子+一小碟凉拌黄瓜' },
      { label: '豆浆+全麦馒头', desc: '无糖豆浆+全麦馒头+一个水煮蛋' },
      { label: '酸奶+麦片+水果', desc: '无糖酸奶+燕麦片+蓝莓/香蕉+坚果碎' },
    ],
    lunch: [
      { label: '米饭+清蒸鱼+炒青菜', desc: '一拳头米饭+巴掌大鱼+一大份绿叶菜' },
      { label: '杂粮饭+鸡胸肉+凉拌菜', desc: '杂粮饭+煎鸡胸肉+凉拌木耳黄瓜' },
      { label: '荞麦面+虾仁+蔬菜', desc: '荞麦凉面+白灼虾+焯水西兰花' },
      { label: '糙米饭+牛肉+炒时蔬', desc: '糙米饭+炒牛肉丝+蒜蓉炒时蔬' },
    ],
    dinner: [
      { label: '杂粮粥+豆腐+凉拌菜', desc: '小米杂粮粥+香煎豆腐+凉拌菠菜' },
      { label: '蒸南瓜+白灼虾+汤', desc: '蒸南瓜+白灼基围虾+紫菜蛋花汤' },
      { label: '蔬菜沙拉+鸡胸肉', desc: '大份蔬菜沙拉+煎鸡胸肉+少量碳水' },
      { label: '清汤面+蔬菜+蛋', desc: '清汤蔬菜面+一个荷包蛋+烫青菜' },
    ],
  },
};
