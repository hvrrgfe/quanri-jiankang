// ===== 活动数据库（科学作息参考）=====
// 来源：全球公认最佳作息表、斯坦福神经科学、全民健身指南
// 按时间段/类型/季节分类

const ActivityDB = {
  // ---- 晨间 (6:00-8:00) ----
  morning: {
    wakeup: [
      { id:'M01', label:'空腹温水', desc:'喝200ml温水（可加柠檬/少量海盐），补充水分唤醒肠道', duration:2, cat:'hydration' },
      { id:'M02', label:'拉开窗帘', desc:'接触自然光，抑制褪黑素，重置生物钟', duration:1, cat:'light' },
      { id:'M03', label:'开窗通风', desc:'让新鲜空气进入房间，提高血氧浓度', duration:2, cat:'air' },
      { id:'M04', label:'伸懒腰', desc:'全身伸展，激活肌肉和关节', duration:1, cat:'stretch' },
      { id:'M05', label:'测量体重', desc:'清晨空腹称重，反映真实体重变化', duration:1, cat:'track' },
    ],
    stretch: [
      { id:'S01', label:'猫牛式', desc:'四足跪姿，吸气抬头塌腰→呼气低头弓背，活动脊柱', duration:3, cat:'spine' },
      { id:'S02', label:'肩部环绕', desc:'双肩向前/向后做大环绕，放松肩颈', duration:2, cat:'shoulder' },
      { id:'S03', label:'颈部拉伸', desc:'左右侧屈各15秒，缓解睡眠后颈部僵硬', duration:2, cat:'neck' },
      { id:'S04', label:'体侧伸展', desc:'站姿双手向上交握，向左右侧弯', duration:2, cat:'side' },
      { id:'S05', label:'髋部拉伸', desc:'弓步跪姿拉伸髋屈肌，改善久坐紧张', duration:3, cat:'hip' },
      { id:'S06', label:'手腕绕环', desc:'手腕正反各绕10圈，激活腕关节', duration:1, cat:'wrist' },
      { id:'S07', label:'踝泵运动', desc:'脚尖前后交替勾压，促进下肢循环', duration:1, cat:'ankle' },
      { id:'S08', label:'深呼吸', desc:'腹式呼吸5次：吸气4秒→呼气6秒，激活副交感神经', duration:2, cat:'breath' },
    ],
    meditation: [
      { id:'MD01', label:'今日意图', desc:'想今天想成为一个怎样的人，选一个关键词', duration:1, cat:'intention' },
      { id:'MD02', label:'感恩三秒', desc:'想一件值得感恩的事，提升积极情绪', duration:1, cat:'gratitude' },
      { id:'MD03', label:'身体扫描', desc:'从头到脚快速扫描身体，注意紧张部位', duration:3, cat:'scan' },
      { id:'MD04', label:'积极肯定', desc:'对自己说三句积极的话，建立自信', duration:1, cat:'affirmation' },
    ],
    exercise: [
      { id:'ME01', label:'晨间快走', desc:'户外快走15-20分钟，晨光激活血清素', duration:15, cat:'walk' },
      { id:'ME02', label:'瑜伽拜日', desc:'3-5轮拜日式，温和唤醒全身', duration:10, cat:'yoga' },
      { id:'ME03', label:'原地踏步', desc:'抬腿至腰高配合摆臂，循序加速', duration:5, cat:'cardio' },
      { id:'ME04', label:'太极拳', desc:'24式简化太极拳一套，动静结合', duration:15, cat:'taichi' },
    ],
  },

  // ---- 上午工作 (8:00-12:00) ----
  work_am: {
    focus: [
      { id:'W01', label:'深度工作', desc:'90分钟无干扰专注，关闭手机通知', duration:90, cat:'deep' },
      { id:'W02', label:'番茄工作', desc:'25分钟专注+5分钟休息，循环4轮', duration:30, cat:'pomodoro' },
      { id:'W03', label:'任务批处理', desc:'同类任务集中处理，减少切换损耗', duration:60, cat:'batch' },
      { id:'W04', label:'写作/报告', desc:'专注写作，先完成再完善，不追求一次完美', duration:45, cat:'write' },
      { id:'W05', label:'学习新技能', desc:'利用上午最高效时段学新知识/技能', duration:45, cat:'learn' },
    ],
    break: [
      { id:'B01', label:'远眺窗外', desc:'看6米外远处20秒，放松睫状肌，防近视', duration:1, cat:'eye' },
      { id:'B02', label:'起身走动', desc:'离开座位走3分钟，改善下肢循环', duration:3, cat:'walk' },
      { id:'B03', label:'肩颈放松', desc:'耸肩10次+头部左右旋转各5次+肩部环绕', duration:2, cat:'neck' },
      { id:'B04', label:'坐姿调整', desc:'检查耳肩髋是否在一条直线，调整坐姿', duration:1, cat:'posture' },
      { id:'B05', label:'喝水', desc:'喝一杯水（约200ml），全天少量多次', duration:1, cat:'hydration' },
      { id:'B06', label:'踮脚尖', desc:'站姿踮脚尖20次，促进下肢血液回流', duration:1, cat:'calf' },
      { id:'B07', label:'深呼吸1分钟', desc:'闭眼腹式呼吸，降低交感神经兴奋', duration:1, cat:'breath' },
    ],
    snack: [
      { id:'SN01', label:'坚果加餐', desc:'一小把杏仁/核桃（约10g），优质脂肪酸', duration:5, cat:'nut' },
      { id:'SN02', label:'水果补充', desc:'一个当季水果，维生素+膳食纤维', duration:5, cat:'fruit' },
      { id:'SN03', label:'无糖酸奶', desc:'一杯无糖酸奶，补充蛋白质和益生菌', duration:5, cat:'dairy' },
      { id:'SN04', label:'黑巧克力', desc:'1-2小块黑巧克力（≥70%可可），提神抗氧', duration:3, cat:'snack' },
      { id:'SN05', label:'花茶/绿茶', desc:'一杯淡茶，舒缓压力，提神醒脑', duration:3, cat:'tea' },
    ],
  },

  // ---- 午间 (12:00-14:00) ----
  noon: {
    lunch: [
      { id:'L01', label:'均衡午餐', desc:'蔬菜+蛋白+碳水搭配，先吃菜再吃肉最后吃饭', duration:25, cat:'meal' },
      { id:'L02', label:'轻食午餐', desc:'沙拉+鸡胸肉+杂粮饭，低脂高蛋白', duration:20, cat:'light' },
      { id:'L03', label:'汤面午餐', desc:'清汤蔬菜面+蛋+青菜，温热适量', duration:20, cat:'noodle' },
    ],
    after: [
      { id:'N01', label:'饭后散步', desc:'慢走10分钟，有助控血糖促消化', duration:10, cat:'walk' },
      { id:'N02', label:'午睡', desc:'20-25分钟小睡，设闹钟不超过30分钟', duration:25, cat:'nap' },
      { id:'N03', label:'站立办公', desc:'使用站立办公10-15分钟，减少久坐', duration:10, cat:'stand' },
      { id:'N04', label:'听音乐放松', desc:'听5分钟舒缓音乐，放松大脑', duration:5, cat:'music' },
    ],
  },

  // ---- 下午 (14:00-18:00) ----
  work_pm: {
    focus: [
      { id:'PW01', label:'创意工作', desc:'利用下午活跃思维做创意/策划/头脑风暴', duration:60, cat:'creative' },
      { id:'PW02', label:'沟通协作', desc:'开会/讨论/回复消息，适合下午的协作型工作', duration:45, cat:'comm' },
      { id:'PW03', label:'阅读整理', desc:'阅读资料/整理文档/归纳总结', duration:45, cat:'read' },
      { id:'PW04', label:'复盘规划', desc:'回顾今日进度，调整明日计划', duration:30, cat:'plan' },
    ],
    break: [
      { id:'PB01', label:'下午茶', desc:'无糖酸奶/水果/坚果，补充下午能量', duration:10, cat:'snack' },
      { id:'PB02', label:'拉伸放松', desc:'站姿体前屈+肩部拉伸，缓解久坐僵硬', duration:3, cat:'stretch' },
      { id:'PB03', label:'爬楼梯', desc:'上下楼梯3-5层，激活心肺', duration:3, cat:'cardio' },
      { id:'PB04', label:'冷水洗脸', desc:'冷水洗把脸，提神醒脑', duration:2, cat:'refresh' },
    ],
  },

  // ---- 运动时段 (最佳16:00-18:00) ----
  exercise: {
    cardio: [
      { id:'E01', label:'快走', desc:'摆臂大步走，心率110-130，微喘能说话', duration:30, equip:'none' },
      { id:'E02', label:'慢跑', desc:'轻松跑速，能说短句，全脚掌着地', duration:25, equip:'跑鞋' },
      { id:'E03', label:'跳绳', desc:'手腕发力摇绳，双脚轻跳，每组1分钟间歇', duration:12, equip:'跳绳' },
      { id:'E04', label:'游泳', desc:'自由泳/蛙泳交替，低冲击全身运动', duration:30, equip:'泳装' },
      { id:'E05', label:'骑行', desc:'保持60-80转/分钟，中等强度', duration:30, equip:'自行车' },
      { id:'E06', label:'HIIT', desc:'高强度间歇20秒work+10秒rest，8轮', duration:12, equip:'none' },
    ],
    strength: [
      { id:'S01', label:'徒手深蹲', desc:'双脚与肩同宽，臀部后坐至大腿平行地面', sets:3, reps:15, equip:'none' },
      { id:'S02', label:'俯卧撑', desc:'双手略宽于肩，下降至胸部贴近地面', sets:3, reps:10, equip:'none' },
      { id:'S03', label:'平板支撑', desc:'前臂支撑身体成直线，收紧核心', sets:3, reps:30, unit:'秒', equip:'none' },
      { id:'S04', label:'臀桥', desc:'仰卧屈膝，臀部顶起至身体成直线', sets:3, reps:15, equip:'垫子' },
      { id:'S05', label:'弓步蹲', desc:'单腿跨出屈膝至90度，交替进行', sets:3, reps:10, equip:'none' },
      { id:'S06', label:'弹力带划船', desc:'坐姿弹力带后拉至腹部，收紧背部', sets:3, reps:12, equip:'弹力带' },
      { id:'S07', label:'哑铃推举', desc:'坐姿哑铃从肩部推至头顶', sets:3, reps:12, equip:'哑铃' },
    ],
    flexibility: [
      { id:'F01', label:'全身拉伸', desc:'从上到下拉伸主要肌群，每个动作保持15秒', duration:10, cat:'stretch' },
      { id:'F02', label:'瑜伽串联', desc:'下犬式→战士式→树式→婴儿式串联', duration:15, cat:'yoga' },
      { id:'F03', label:'泡沫轴放松', desc:'滚压大腿/背部/臀部，放松筋膜', duration:10, equip:'泡沫轴' },
      { id:'F04', label:'拉伸操', desc:'针对当天训练部位的专项拉伸', duration:8, cat:'stretch' },
    ],
  },

  // ---- 晚间 (18:00-22:30) ----
  evening: {
    dinner: [
      { id:'D01', label:'清淡晚餐', desc:'少量蛋白+蔬菜+少许碳水，晚餐宜少', duration:25, cat:'meal' },
      { id:'D02', label:'暖胃晚餐', desc:'杂粮粥/汤面/蒸菜，温热易消化', duration:25, cat:'warm' },
      { id:'D03', label:'轻食晚餐', desc:'蔬菜沙拉+豆腐/虾仁+少量南瓜', duration:20, cat:'light' },
    ],
    leisure: [
      { id:'L01', label:'阅读纸质书', desc:'读一本轻松的书，减少屏幕时间', duration:30, cat:'read' },
      { id:'L02', label:'写日记', desc:'记录今天的三件好事+感受+明天计划', duration:10, cat:'journal' },
      { id:'L03', label:'与家人聊天', desc:'和家人朋友聊聊天，分享今天的事', duration:15, cat:'social' },
      { id:'L04', label:'整理房间', desc:'简单整理桌面/卧室，环境整洁有助放松', duration:15, cat:'clean' },
      { id:'L05', label:'培养爱好', desc:'乐器/绘画/手工/园艺等，做感兴趣的事', duration:30, cat:'hobby' },
      { id:'L06', label:'听播客', desc:'听一集知识/故事类播客', duration:20, cat:'audio' },
      { id:'L07', label:'散步遛弯', desc:'晚饭后散步15分钟，放松身心', duration:15, cat:'walk' },
    ],
    sleep_prep: [
      { id:'SP01', label:'调暗灯光', desc:'将灯光调至暖黄光（CCT≤2700K），促褪黑素', duration:1, cat:'light' },
      { id:'SP02', label:'放下手机', desc:'手机放卧室外，避免蓝光抑制褪黑素', duration:1, cat:'phone' },
      { id:'SP03', label:'温水泡脚', desc:'40°C温水泡脚10分钟，促进循环助眠', duration:10, cat:'bath' },
      { id:'SP04', label:'4-7-8呼吸', desc:'吸气4秒→屏息7秒→呼气8秒，重复5轮', duration:5, cat:'breath' },
      { id:'SP05', label:'身体扫描', desc:'从脚到头逐步放松全身各部位', duration:5, cat:'scan' },
      { id:'SP06', label:'感恩回顾', desc:'回想今天三件值得感恩的事', duration:3, cat:'gratitude' },
      { id:'SP07', label:'明日计划', desc:'列出明天最重要的3件事，清空大脑', duration:3, cat:'plan' },
      { id:'SP08', label:'阅读助眠', desc:'读几页轻松的纸质书，避免刺激内容', duration:10, cat:'read' },
    ],
  },

  // ---- 季节性 ----
  seasonal: {
    spring: {
      produce: ['春笋','荠菜','香椿','菠菜','草莓','芦笋','韭菜'],
      exercise: ['踏青','骑行','放风筝','户外慢跑','徒步'],
      tips: '春季阳气升发，适合增加户外活动。多吃应季绿叶菜补充维生素。',
    },
    summer: {
      produce: ['西瓜','黄瓜','番茄','苦瓜','绿豆','莲子','冬瓜'],
      exercise: ['游泳','晨跑','室内健身','傍晚散步','瑜伽'],
      tips: '夏季注意避暑，运动避开中午高温时段（10-16点）。多补水，适量吃瓜类解暑。',
    },
    autumn: {
      produce: ['梨','莲藕','山药','南瓜','柿子','银耳','百合'],
      exercise: ['登山','长跑','骑行','徒步','太极拳'],
      tips: '秋季气候宜人，适合增加户外耐力运动。注意润肺防燥，多喝温水。',
    },
    winter: {
      produce: ['萝卜','白菜','羊肉','红薯','橙子','猕猴桃','核桃'],
      exercise: ['室内力量','瑜伽','游泳(室内)','快走','跳绳'],
      tips: '冬季注意保暖，运动前充分热身（10分钟）。多吃根茎类蔬菜补充能量。',
    },
  },

  // ---- 三餐参考 ----
  meals: {
    breakfast: [
      { id:'BF01', label:'全麦三明治+牛奶', desc:'全麦面包+煎蛋+生菜+番茄+一杯牛奶' },
      { id:'BF02', label:'燕麦粥+鸡蛋+坚果', desc:'燕麦片煮粥+水煮蛋+几颗核桃/杏仁' },
      { id:'BF03', label:'小米粥+包子+凉菜', desc:'小米粥+素菜包子+凉拌黄瓜' },
      { id:'BF04', label:'豆浆+全麦馒头+蛋', desc:'无糖豆浆+全麦馒头+水煮蛋+小番茄' },
      { id:'BF05', label:'酸奶+麦片+水果', desc:'无糖酸奶+燕麦片+蓝莓/香蕉+坚果碎' },
      { id:'BF06', label:'红薯+鸡蛋+蔬菜', desc:'蒸红薯+水煮蛋+焯水西兰花' },
    ],
    lunch: [
      { id:'LU01', label:'杂粮饭+清蒸鱼+青菜', desc:'一拳头杂粮饭+巴掌大蒸鱼+一大份绿叶菜' },
      { id:'LU02', label:'糙米饭+鸡胸肉+凉拌菜', desc:'糙米饭+煎鸡胸肉+凉拌木耳黄瓜' },
      { id:'LU03', label:'荞麦面+虾仁+蔬菜', desc:'荞麦凉面+白灼虾+焯水西兰花+小番茄' },
      { id:'LU04', label:'杂粮饭+牛肉+炒时蔬', desc:'杂粮饭+炒牛肉丝+蒜蓉炒时蔬' },
      { id:'LU05', label:'南瓜饭+豆腐+蔬菜汤', desc:'南瓜藜麦饭+香煎豆腐+蔬菜汤' },
    ],
    dinner: [
      { id:'DI01', label:'小米粥+豆腐+凉拌菜', desc:'小米杂粮粥+香煎豆腐+凉拌菠菜' },
      { id:'DI02', label:'蒸南瓜+白灼虾+汤', desc:'蒸南瓜+白灼基围虾+紫菜蛋花汤' },
      { id:'DI03', label:'蔬菜沙拉+煎鸡胸', desc:'大份蔬菜沙拉+煎鸡胸肉+少量杂粮' },
      { id:'DI04', label:'清汤面+蔬菜+蛋', desc:'清汤蔬菜面+荷包蛋+烫青菜' },
      { id:'DI05', label:'杂粮粥+蒸鱼+焯菜', desc:'杂粮粥+清蒸鱼+焯水西兰花' },
    ],
  },

  // ---- 按装备筛选 ----
  getByEquip(equipList) {
    if (!equipList || !equipList.length || equipList.includes('none')) {
      return this.exercise;
    }
    var result = {};
    for (var cat in this.exercise) {
      result[cat] = this.exercise[cat].filter(function(a) {
        return !a.equip || equipList.includes(a.equip) || a.equip === 'none' || a.equip === '垫子';
      });
    }
    return result;
  },

  // ---- 按季节获取推荐 ----
  getSeasonal() {
    var m = new Date().getMonth() + 1;
    if (m >= 3 && m <= 5) return this.seasonal.spring;
    if (m >= 6 && m <= 8) return this.seasonal.summer;
    if (m >= 9 && m <= 11) return this.seasonal.autumn;
    return this.seasonal.winter;
  },
};
