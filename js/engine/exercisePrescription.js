// ===== 运动处方引擎 =====
// 参考：ACSM Guidelines 12th Ed 2025、北京体育大学运动处方课程
// FITT-VP原则：频率(Frequency)、强度(Intensity)、时间(Time)、类型(Type)、总量(Volume)、进阶(Progression)

const ExerciseRx = {
  // ---- 1. 心率分区计算（Karvonen法+最大心率法）----
  heartRateZones(age, restingHR = 70) {
    const maxHR = 208 - 0.7 * age; // Tanaka公式（较Fox公式更准确）
    const hrr = maxHR - restingHR; // 心率储备

    return {
      maxHR: Math.round(maxHR),
      restingHR,
      zones: {
        warmup:   { low: Math.round(restingHR + hrr * 0.5),  high: Math.round(restingHR + hrr * 0.6),  label: '热身区', rpe: '9-11', feel: '很轻松' },
        fatBurn:  { low: Math.round(restingHR + hrr * 0.6),  high: Math.round(restingHR + hrr * 0.7),  label: '燃脂区', rpe: '11-13', feel: '稍轻松' },
        aerobic:  { low: Math.round(restingHR + hrr * 0.7),  high: Math.round(restingHR + hrr * 0.8),  label: '有氧区', rpe: '13-15', feel: '有些吃力' },
        anaerobic:{ low: Math.round(restingHR + hrr * 0.8),  high: Math.round(restingHR + hrr * 0.9),  label: '无氧区', rpe: '15-17', feel: '吃力' },
        vo2max:   { low: Math.round(restingHR + hrr * 0.9),  high: Math.round(maxHR),                   label: '极限区', rpe: '17-20', feel: '非常吃力' },
      }
    };
  },

  // ---- 2. 强度分级标准 ----
  intensityLevels: [
    { level: '静坐', met: '<1.6', hrPercent: '<50%', rpe: '<9',  feel: '几乎不动', example: '坐着' },
    { level: '低',   met: '1.6-2.9', hrPercent: '50-63%', rpe: '9-11',  feel: '轻松', example: '慢走、洗碗' },
    { level: '中',   met: '3.0-5.9', hrPercent: '64-76%', rpe: '12-14', feel: '微喘可说话', example: '快走、骑车' },
    { level: '高',   met: '6.0-8.5', hrPercent: '77-93%', rpe: '15-17', feel: '喘说不出完整句子', example: '跑步、跳绳' },
    { level: '极高', met: '>8.5',    hrPercent: '>94%',   rpe: '18-20', feel: '极限', example: '冲刺跑' },
  ],

  // ---- 3. FITT-VP 默认方案 ----
  defaultPrescription: {
    aerobic: {
      freq: '每周3-5天',
      intensity: '中高强度（40-60% HRR 或 RPE 12-16）',
      time: '每次20-60分钟（或每周累计≥150分钟中等强度）',
      type: '大肌群参与的节律性有氧运动',
      volume: '每周500-1000 MET-min（≈150分钟中等强度）',
      progression: '每1-2周增加5-10%运动量',
    },
    resistance: {
      freq: '每周2-3天，间隔至少48小时',
      intensity: '初学者40-60% 1RM，中级60-70% 1RM',
      time: '每次20-40分钟',
      type: '多关节参与的复合动作（8-10个动作）',
      volume: '每组8-12RM，2-4组',
      progression: '先增加组数，再增加负荷',
    },
    flexibility: {
      freq: '每周2-3天以上，最好每天',
      intensity: '拉伸至有牵拉感但不痛',
      time: '每个拉伸保持15-30秒，重复2-4次',
      type: '静态拉伸、动态拉伸、PNF拉伸',
      volume: '累计10-20分钟',
    },
  },

  // ---- 4. 生成个性化运动处方 ----
  generatePrescription(profile) {
    const { age, gender, activityLevel, healthConditions, goals } = profile;
    const hr = this.heartRateZones(age);
    const rx = { hr, plans: {}, precautions: [] };

    // 基础有氧处方
    rx.plans.aerobic = {
      ...this.defaultPrescription.aerobic,
      targetHR: `${hr.zones.fatBurn.low}-${hr.zones.aerobic.high} 次/分`,
      targetRPE: '12-15（有些吃力但能说话）',
    };

    // 根据活动水平调整
    if (activityLevel <= 1) {
      rx.plans.aerobic.time = '每次15-30分钟起步，隔天进行';
      rx.plans.aerobic.intensity = '低中强度（RPE 9-12），先建立习惯';
      rx.precautions.push('从低强度开始，前2周以建立运动习惯为目标');
    } else if (activityLevel >= 3) {
      rx.plans.aerobic.time = '每次40-60分钟';
      rx.plans.aerobic.intensity = '中高强度（RPE 13-16）';
    }

    // 根据健康目标调整
    if (goals?.includes('weight_loss')) {
      rx.plans.aerobic.time = '每次40-60分钟';
      rx.plans.aerobic.volume = '每周≥300分钟中等强度';
      rx.plans.resistance = this.defaultPrescription.resistance;
      rx.plans.resistance.sets = '3-4组';
      rx.plans.resistance.reps = '12-15RM（偏耐力）';
      rx.note = '减脂期：有氧+力量结合效果最佳，注意运动后营养补充';
    }

    if (goals?.includes('muscle')) {
      rx.plans.resistance = this.defaultPrescription.resistance;
      rx.plans.resistance.reps = '8-12RM';
      rx.plans.resistance.sets = '3-5组';
      rx.note = '增肌期：力量训练为主，有氧为辅助，确保充足蛋白质摄入';
    }

    // 根据健康状况调整
    if (healthConditions?.includes('hypertension')) {
      rx.precautions.push('避免高强度等长收缩运动（如重训时憋气）');
      rx.precautions.push('运动前充分热身5-10分钟');
      rx.plans.aerobic.intensity = '中等强度（RPE 11-13），血压控制后逐步提高';
    }
    if (healthConditions?.includes('diabetes')) {
      rx.precautions.push('运动前后监测血糖，随身携带糖');
      rx.precautions.push('不要在胰岛素作用高峰期运动');
    }
    if (healthConditions?.includes('fatty_liver')) {
      rx.plans.aerobic.time = '每次40-60分钟';
      rx.note = '脂肪肝：每周≥250分钟中等强度有氧最有效';
    }

    // 力量处方
    rx.plans.resistance = rx.plans.resistance || this.defaultPrescription.resistance;

    // 柔韧性处方
    rx.plans.flexibility = this.defaultPrescription.flexibility;

    return rx;
  },

  // ---- 5. RPE主观疲劳度分级（Borg CR10）----
  rpeScale: [
    { score: 0, label: '完全休息', desc: '不动' },
    { score: 1, label: '非常非常轻松', desc: '几乎不费力' },
    { score: 2, label: '很轻松', desc: '稍息' },
    { score: 3, label: '轻松', desc: '感觉舒适' },
    { score: 4, label: '稍吃力', desc: '微出汗' },
    { score: 5, label: '有些吃力', desc: '可以说话' },
    { score: 6, label: '吃力', desc: '说话困难' },
    { score: 7, label: '很吃力', desc: '断断续续说话' },
    { score: 8, label: '非常吃力', desc: '无法说话' },
    { score: 9, label: '极困难', desc: '接近极限' },
    { score: 10, label: '极限', desc: '完全透支' },
  ],

  // ---- 6. 评估运动量是否达标 ----
  assessVolume(weeklyActivities) {
    let totalMin = 0;
    let vigorousMin = 0;
    let strengthDays = 0;

    weeklyActivities.forEach(day => {
      (day.activities || []).forEach(a => {
        if (a.intensity === 'moderate') totalMin += a.duration;
        if (a.intensity === 'vigorous') vigorousMin += a.duration;
        if (a.type === 'strength') strengthDays++;
      });
    });

    // 高强度时间加倍（WHO标准）
    const adjustedMin = totalMin + vigorousMin * 2;
    const metMinimal = adjustedMin >= 150;
    const metOptimal = adjustedMin >= 300;
    const metStrength = strengthDays >= 2;

    return {
      totalMin, vigorousMin, adjustedMin, strengthDays,
      passed: metMinimal && metStrength,
      level: metOptimal ? 'optimal' : metMinimal ? 'minimal' : 'insufficient',
      advice: !metMinimal ? '需要增加有氧运动量，每周至少150分钟中等强度' :
              !metStrength ? '记得每周加2次力量训练' :
              metOptimal ? '运动量充足，继续保持！' : '已达最低标准，继续增加到300分钟更佳',
    };
  },

  // ---- 7. 运动禁忌与注意事项 ----
  contraindications: {
    absolute: [
      '近期心电图改变或心肌梗死',
      '不稳定心绞痛',
      '未控制的心律失常',
      '严重主动脉狭窄',
      '急性心肌炎或心包炎',
      '未控制的严重高血压（>180/110）',
    ],
    relative: [
      '左主干冠状动脉狭窄',
      '中度瓣膜性心脏病',
      '电解质异常',
      '严重高血压（>160/100）',
      '心动过速（>100次/分）',
      '未经评估的心律失常',
    ],
  },
};
