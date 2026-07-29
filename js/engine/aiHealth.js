// ===== AI 健康规划引擎 =====
// 各模块使用 getKnowledgeBase() 中的科学数据 + 完整用户画像

const AIHealth = {
  async generate(module, profile) {
    const apiKey = Store.getApiKey();
    if (!apiKey) return null;

    const generators = {
      exercise: () => this._genExercise(profile),
      sleep: () => this._genSleep(profile),
      mental: () => this._genMental(profile),
      plan: () => this._genPlan(profile),
    };
    const gen = generators[module];
    if (!gen) return null;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const prompt = gen();
        const result = await Helpers.callLLM(prompt.system, prompt.user, apiKey);
        if (result && this._isValid(result, module)) return result;
      } catch (e) {
        console.warn('AI ' + module + ' attempt ' + (attempt + 1) + '/3 failed:', e.message);
      }
    }
    return null;
  },

  _isValid(result, module) {
    if (!result || typeof result !== 'object') return false;
    if (module === 'exercise' && result.weekPlan) return true;
    if (module === 'sleep' && result.schedule) return true;
    if (module === 'mental' && result.practices) return true;
    if (module === 'plan' && result.tasks) return true;
    return false;
  },

  // ---- 用户画像描述（六大模块全部字段）----
  _profileDesc(p) {
    const sections = [];

    // 基础
    sections.push('## 基础信息');
    sections.push(`年龄${p.age}岁 · ${p.gender === 'male' ? '男' : '女'} · 身高${p.height}cm · 体重${p.weight}kg`);
    sections.push(`活动量：${['久坐', '轻度', '中度', '高度'][(p.activityLevel || 1) - 1]}`);
    sections.push(`压力：${['很低', '一般', '中等', '较大', '很大'][(p.stressLevel || 2) - 1]} · 睡眠：${p.sleepHours || 7}h`);
    sections.push(`运动：${p.exerciseDays || 0}天/周 · 外食：${p.eatOutFreq || 0}次/周`);

    // 饮食
    sections.push('## 饮食');
    sections.push(`目标：${(p.healthGoals || []).join('、') || '均衡'} · 忌口：${(p.dietaryRestrictions || []).join('、') || '无'}`);
    sections.push(`菜系：${Array.isArray(p.cuisinePreference) ? p.cuisinePreference.join('、') : (p.cuisinePreference || '家常')}`);
    sections.push(`餐次：${(p.mealsToPlan || []).join('、')} · 烹饪时间：${p.cookTimeBudget || 30}min/餐`);
    sections.push(`厨具：${(p.availableTools || []).join('、') || '基本'} · 预算：${p.perMealBudget || 20}元/餐`);
    sections.push(`口味：辣${p.tasteProfile?.spicy || 0}酸${p.tasteProfile?.sour || 0}甜${p.tasteProfile?.sweet || 0}咸${p.tasteProfile?.salty || 0}油${p.tasteProfile?.oily || 0}`);
    sections.push(`过敏：${(p.allergies || []).join('、') || '无'} · 消化：${(p.digestiveIssues || []).filter(i => i !== 'none').join('、') || '正常'}`);
    sections.push(`健康状况：${(p.healthConditions || []).join('、') || '无'}`);
    sections.push(`额外需求：${p.aiRequirements || '无'}`);

    // 运动
    sections.push('## 运动');
    const willMap = { minimal: '最低有效量', regular: '规律运动', casual: '随兴而动' };
    sections.push(`意愿：${willMap[p.exerciseWillingness] || p.exerciseWillingness || '未设置'}`);
    sections.push(`装备：${(p.exerciseEquip || []).join('、') || '无（徒手）'}`);
    sections.push(`经期记录：${p.exerciseTrackPeriod ? '是' : '否'}`);

    // 体态
    sections.push('## 体态');
    sections.push(`工作：${p.jobType === 'desk' ? '久坐办公' : p.jobType === 'standing' ? '久站' : p.jobType === 'mobile' ? '走动' : '混合'}`);
    sections.push(`日均久坐：${p.sittingHours || 8}小时 · 现有不适：${(p.postureIssues || []).join('、') || '无'}`);

    // 睡眠
    sections.push('## 睡眠');
    const ctMap = { morning: '早间型（百灵鸟）', intermediate: '中间型', evening: '晚间型（猫头鹰）' };
    sections.push(`时型：${ctMap[p.chronotype] || p.chronotype || '中间型'}`);
    sections.push(`睡眠问题：${(p.sleepIssues || []).join('、') || '无'}`);
    sections.push(`作息：${p.preferBedTime || '23:00'}~${p.preferWakeTime || '07:00'}`);

    // 心理
    sections.push('## 心理');
    const mtMap = { minimal: '1-2分钟', moderate: '3-5分钟', dedicated: '5-10分钟' };
    sections.push(`可投入时间：${mtMap[p.mentalTime] || p.mentalTime || '未设置'}`);
    sections.push(`当前状态：${(p.mentalState || []).join('、') || '一般'}`);
    sections.push(`期望方向：${(p.mentalGoals || []).join('、') || '日常练习'}`);

    // 计划
    sections.push('## 计划');
    sections.push(`风格：${p.planStyle === 'relaxed' ? '宽松型' : '标准型'} · 每日计划量：${p.planCount || 3}件`);

    return sections.join('\n');
  },

  // ===== 运动 =====
  _genExercise(profile) {
    const db = ExerciseDB;
    const kb = db.getKnowledgeBase();
    const pool = db;
    const upper = pool.upperBody.slice(0, 5).map(e => e.name + '(' + e.sets + '组x' + e.reps + e.unit + '，' + e.target.join('/') + ')').join('、');
    const lower = pool.lowerBody.slice(0, 5).map(e => e.name + '(' + e.sets + '组x' + e.reps + e.unit + '，' + e.target.join('/') + ')').join('、');
    const cardio = pool.cardio.map(e => e.name + '(MET' + e.met + '，' + e.desc + ')').join('、');
    const stretch = pool.stretch.map(e => e.name + e.duration + e.unit + '，' + e.benefits.join('/')).join('、');
    const micro = pool.micro.map(e => e.name + '(' + e.reps + e.unit + '，' + e.desc + ')').join('、');

    return {
      system: `你是一位专业运动教练。根据下面的运动数据库和科学知识，为用户生成一周运动计划JSON。

## 运动科学
- ${kb.who}
- 强度分级：${kb.intensity}
- 心率公式：${kb.hrFormula}
- RPE：${kb.rpe}
- FITT原则：${kb.fitt}
- 热身整理：${kb.warmup}

## 运动数据库（必须从中选动作）
有氧运动（MET值标注）：${cardio}
上肢力量（含目标肌群）：${upper}
下肢力量（含目标肌群）：${lower}
拉伸（含益处）：${stretch}
微运动（办公室可做）：${micro}

## 输出JSON格式（严格遵循）
{"weekPlan":[{"day":"周一","items":[{"name":"动作名","duration":30,"type":"cardio/stretch/strength"}]}]}
只输出JSON，不要其他文字`,

      user: `## 用户档案
${this._profileDesc(profile)}
运动意愿：${profile.exerciseWillingness === 'minimal' ? '最低有效量，怎么省事怎么来' : profile.exerciseWillingness === 'regular' ? '规律运动，每周3-4次' : '有灵感就动'}
可用装备：${(profile.exerciseEquip || []).join('、') || '无（只推荐徒手动作）'}
每周运动现状：${profile.exerciseDays || 0}天/周
${profile.exerciseTrackPeriod ? '记录经期' : ''}

请生成一周运动计划，所有动作从数据库中选取，尊重用户装备条件。`,
    };
  },

  // ===== 睡眠 =====
  _genSleep(profile) {
    return {
      system: `你是一位睡眠医学专家。根据睡眠科学和用户档案，生成个性化睡眠方案JSON。

## 睡眠科学（必须遵守）
- 时长：成人推荐7-9小时
- 温度：卧室最佳17-22°C，湿度30-50%，CO₂<600ppm
- 光照：睡前1小时停用电子设备，480nm蓝光暴露2小时抑制褪黑素53%
- 咖啡因：半衰期约5小时，下午3点后避免
- 生物钟：固定作息比补觉更有效，周末补觉无法弥补工作日缺失
- 时型差异：早间型约25%/中间型55%/晚间型20%，晚间型容易睡前拖延
- 噪音：低于45dB，突发噪音触发K-复合波使睡眠变浅
- 睡前流程：理想睡前30分钟开始放松

## 输出JSON格式
{"schedule":{"bedTime":"23:00","wakeTime":"07:00"},"tips":["具体建议1","具体建议2","具体建议3"]}
只输出JSON`,

      user: `## 用户档案
${this._profileDesc(profile)}

请生成睡眠优化方案，必须符合上述睡眠科学。`,
    };
  },

  // ===== 心理 =====
  _genMental(profile) {
    const intentions = MentalHealthDB.intentionPool.map(i => '\n  - ' + i.text + '(' + i.category + ')').join('');

    return {
      system: `你是一位积极心理学教练。生成今日心理微练习JSON。

## 心理练习库（可选）
今日意图词：${intentions}
呼吸法：
  - 4-7-8呼吸：吸气4秒→屏息7秒→呼气8秒（激活副交感神经）
  - 盒式呼吸：吸气4→屏息4→呼气4→屏息4（US Navy SEALs使用）
  - 4-4-6呼吸：吸气4→屏息4→呼气6（快速平静）
感恩练习：三件好事（Emmons & McCullough 2003实证10周后正向情绪提升）
CBT工具：想法记录→寻找证据→换角度思考

## 核心原则
1. 简短可执行，不超过5分钟
2. 不分析、不给标签、不治疗
3. 以"日常心理卫生"为理念

## 输出JSON格式
{"practices":[{"name":"练习名","duration":"3分钟","type":"呼吸/感恩/意图/反思"}]}
只输出JSON`,

      user: `## 用户档案
${this._profileDesc(profile)}

请生成适合的今日心理练习。`,
    };
  },

  // ===== 计划 =====
  _genPlan(profile) {
    return {
      system: `你是一位效率教练。根据用户档案生成今日3件最重要任务JSON。

## 原则
1. 每件事不超过10个字
2. 结合用户的职业、运动、健康、睡眠、心理状况
3. 鼓励为主，不说教
4. 任务要具体可执行
5. 参考MIT 3 Tasks Method（每天3件最重要的事）

## 输出JSON格式
{"tasks":["任务1","任务2","任务3"],"note":"一句鼓励的话"}
只输出JSON`,

      user: `## 用户档案
${this._profileDesc(profile)}

请生成今日3件任务。`,
    };
  },
};
