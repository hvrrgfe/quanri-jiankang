// ===== 健康小贴士数据库（按时间/场景）=====
// 来源：WHO、NSF、ACSM、中国居民膳食指南
// 更新：2026年7月

const HealthTips = {
  // ---- 按时间段 ----
  byTime: {
    morning: [
      '早晨起床后喝一杯温水促进代谢',
      '拉开窗帘接触自然光帮助校准生物钟',
      '早餐建议在起床后1小时内吃',
      '早晨拉伸5分钟可改善全天姿态',
      '早餐包含蛋白质有助于维持上午精力',
    ],
    morningWork: [
      '每坐45分钟站起来活动一下',
      '上午10点左右是工作效率最高的时段',
      '如果上午喝咖啡，最好在10-11点',
      '保持正确坐姿：双脚平放，腰部有支撑',
      '每20分钟让眼睛休息20秒看远处',
    ],
    lunch: [
      '午餐建议蔬菜占一半',
      '饭后散步10分钟有助消化和控制血糖',
      '午睡不超过30分钟以免影响夜间睡眠',
      '午餐的蛋白质有助于防止下午犯困',
      '如果下午需要集中精力，午餐别吃太饱',
    ],
    afternoon: [
      '下午2-3点是天然的困倦期，可以安排简单工作',
      '下午3点后避免咖啡因',
      '下午的微运动可以改善剩余半天的工作效率',
      '多喝水，缺水会导致疲劳和头痛',
      '如果感觉疲劳，站起来活动5分钟比喝咖啡有效',
    ],
    evening: [
      '晚餐应在睡前2-3小时完成',
      '晚餐宜清淡，避免油腻和辛辣',
      '晚上9点后不再进食',
      '睡前1小时关闭电子屏幕',
      '用温水泡脚可以促进睡眠',
      '固定的睡前流程（30分钟）是良好睡眠的关键',
    ],
    weekend: [
      '周末也不要改变起床时间超过1小时',
      '适合做一些工作日没时间做的运动',
      '提前规划下周的饮食和运动',
      '备菜：周末准备好下周的食材',
      '户外活动补充维生素D',
    ],
  },

  // ---- 按健康维度 ----
  byDimension: {
    diet: [
      '每天吃够12种食物，每周25种',
      '深色蔬菜应占蔬菜总量的一半以上',
      '红肉每周不超过500g',
      '每天奶制品300ml以上',
      '每天饮水1.5-1.7L',
      '每天一小把坚果约10g',
      '全谷物占主食的1/3以上',
    ],
    exercise: [
      '每周至少150分钟中等强度有氧运动',
      '每周2次力量训练覆盖全身主要肌群',
      '减少久坐，每小时起来动一动',
      '运动后30分钟内补充蛋白质效果最佳',
      '每天6000步是最低健康目标',
    ],
    posture: [
      '保持正确坐姿：耳肩髋在一条线',
      '每坐45分钟必须起身活动',
      '屏幕调整到视线水平或略低',
      '双肩自然下沉不耸肩',
      '双脚平放地面不交叉',
    ],
    sleep: [
      '成人每晚需要7-9小时睡眠',
      '固定作息时间是改善睡眠最有效的方法',
      '卧室温度保持在18-22°C',
      '睡前1小时不接触电子屏幕',
      '咖啡因的半衰期约5小时，下午少喝',
      '睡不好时不要在床上玩手机',
    ],
    mental: [
      '每周至少150分钟运动显著改善情绪',
      '每天10分钟冥想可降低焦虑水平',
      '社交连接是心理健康的重要保护因素',
      '接触自然环境（公园/绿地）改善情绪',
      '充足睡眠是情绪稳定的基础',
    ],
  },

  // ---- 根据实时数据生成上下文提示 ----
  getContextualTip(state) {
    const { hour, hasEaten, sittingMinutes, exerciseToday, sleepHours, waterIntake } = state;

    // 早晨
    if (hour >= 5 && hour < 8) return this.byTime.morning[Math.floor(Math.random() * this.byTime.morning.length)];
    // 上午工作
    if (hour >= 8 && hour < 12) {
      if (sittingMinutes > 45) return '你已经连续坐了这么久，该站起来活动一下了';
      if (hour === 10) return '现在是喝咖啡的最佳时间（10-11点），不影响晚间睡眠';
      return this.byTime.morningWork[Math.floor(Math.random() * this.byTime.morningWork.length)];
    }
    // 午餐
    if (hour >= 12 && hour < 13) return this.byTime.lunch[Math.floor(Math.random() * this.byTime.lunch.length)];
    // 下午
    if (hour >= 13 && hour < 18) {
      if (hour >= 15) return '下午3点后尽量避免咖啡因，会影响今晚睡眠';
      if (sittingMinutes > 60) return '站起来活动5分钟比喝咖啡更能恢复精力';
      return this.byTime.afternoon[Math.floor(Math.random() * this.byTime.afternoon.length)];
    }
    // 晚间
    if (hour >= 18 && hour < 22) {
      if (hour >= 20) return '晚上8点后尽量不进食，给消化系统休息时间';
      if (hour >= 21) return '是时候开始睡前流程了，关掉电子设备吧';
      return this.byTime.evening[Math.floor(Math.random() * this.byTime.evening.length)];
    }
    // 深夜
    if (hour >= 22 || hour < 5) return '夜已深，好好休息。明天又是新的一天。';

    return this.byDimension.diet[Math.floor(Math.random() * this.byDimension.diet.length)];
  },
};
