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
    if (module === 'plan' && (result.tasks || result.schedule)) return true;
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

    // 健康问卷结果
    if (p.healthSurvey) {
      sections.push('## 健康评估（问卷结果）');
      sections.push(`评估日期：${p.healthSurvey.date} · 总分：${p.healthSurvey.score}% · 评级：${p.healthSurvey.level}`);
      (p.healthSurvey.details || []).forEach(d => {
        const pct = d.max > 0 ? Math.round(d.score / d.max * 100) : 0;
        sections.push(`${d.title}：${pct}%`);
      });
    }

    return sections.join('\n');
  },

  // ===== 运动 =====
  _genExercise(profile) {
    const db = ExerciseDB;
    const kb = db.getKnowledgeBase();
    const pool = db;
    const allExercises = [...pool.cardio, ...pool.upperBody, ...pool.lowerBody, ...pool.core, ...pool.stretch, ...pool.micro];
    const upper = pool.upperBody.map(e => e.name + '(' + e.sets + '组x' + e.reps + e.unit + '，目标' + e.target.join('/') + '，' + e.desc + ')').join('\n  - ');
    const lower = pool.lowerBody.map(e => e.name + '(' + e.sets + '组x' + e.reps + e.unit + '，目标' + e.target.join('/') + '，' + e.desc + ')').join('\n  - ');
    const core = pool.core.map(e => e.name + '(' + e.sets + '组x' + e.reps + e.unit + '，目标' + e.target.join('/') + '，' + e.desc + ')').join('\n  - ');
    const cardio = pool.cardio.map(e => e.name + '(MET' + e.met + '，' + e.desc + ')').join('\n  - ');
    const stretch = pool.stretch.map(e => e.name + e.duration + e.unit + '，' + e.benefits.join('/') + '，' + e.desc).join('\n  - ');
    const micro = pool.micro.map(e => e.name + '(' + e.reps + e.unit + '，' + e.desc + ')').join('\n  - ');

    return {
      system: `你是一位NASM认证运动教练。为用户生成一周训练计划，必须参照全球公认训练体系。

## 全球公认训练体系（选一个最匹配用户的）
1. **推/拉/腿(PPL)** — 周一推+有氧、周三拉+有氧、周五腿+有氧。适合健身房，中高级。
2. **上下肢分化** — 周一上肢+有氧、周三下肢+有氧、周五上肢+有氧。适合3-4天/周。
3. **全身训练** — 每次全身主要肌群各1-2个动作，每周3次。适合新手/时间少。
4. **上下/全身混合(UL+FB)** — 周一上肢、周三下肢、周五全身。适合规律运动。
5. **徒手分化** — 周一推力+核心、周三拉力+下肢、周五全身徒手。适合无器械。
6. **最低有效量(WHO)** — 每周150min有氧+2次力量，分散到每天20min。适合最低投入。
7. **体态纠正** — 针对圆肩驼背/骨盆前倾/久坐不适。适合有体态问题者。

选择逻辑：按用户意愿、频率、装备、体态问题选最合适的体系。在planName中标明。

## 运动科学（所有标准必须遵守）

### 国际标准（WHO/ACSM）
- ${kb.who}
- 强度分级：${kb.intensity}
- 心率公式：${kb.hrFormula}
- RPE：${kb.rpe}
- FITT原则：${kb.fitt}
- 热身整理：${kb.warmup}
- ACSM有氧：频率每周3-5天，强度60-85%HRmax，时间20-60分钟/次
- ACSM力量：每个大肌群每周2-3天，初学者60-70%1RM，8-12次/组，2-4组
- ACSM HIIT：正式纳入有氧处方选项

### 中国《全民健身指南》官方标准（国家体育总局2017）
- 强度三档：小强度≤100次/分 → 中等强度100-140次/分（健步走/慢跑/骑车12-16km/h）→ 大强度≥140次/分（跑步8km/h+）
- 每周推荐：运动3-7天，每天30-90分钟，中等强度累计150-300分钟/周，最优300分钟
- 力量：每周2-3次力量练习，不少于5次牵拉练习
- 分期方案：初期（前8周）60-65%HRmax → 中期（8周后）70-80%HRmax → 长期稳定期5-7天/周
- 完整流程：准备活动5-10分钟 → 基本活动 → 放松活动5-10分钟
- 日常活动：每天6000步，减少久坐每小时起身活动

## 运动数据库（必须从中选动作）
有氧运动：\n  - ${cardio}
上肢力量：\n  - ${upper}
下肢力量：\n  - ${lower}
核心训练：\n  - ${core}
拉伸：\n  - ${stretch}
微运动：\n  - ${micro}

## 输出JSON（严格遵循）
{
  "planName":"所选体系名称",
  "planReason":"一句话说明为什么选这个体系",
  "weekPlan":[
    {"day":"周一","focus":"训练重点","items":[
      {"name":"动作名","sets":3,"reps":10,"unit":"次","rest":30,"type":"strength/cardio/stretch","rpe":7,"note":"要点"}
    ]}
  ]
}
只输出JSON，不要解释`,

      user: `## 用户档案
${this._profileDesc(profile)}
运动意愿：${profile.exerciseWillingness === 'minimal' ? '最低有效量' : profile.exerciseWillingness === 'regular' ? '规律运动每周3-4次' : '有灵感就动'}
可用装备：${(profile.exerciseEquip || []).join('、') || '无（只推荐徒手动作）'}
每周运动现状：${profile.exerciseDays || 0}天/周
${profile.exerciseTrackPeriod ? '记录经期：经期前几天降低强度' : ''}
${profile.postureIssues?.length ? '体态问题：' + profile.postureIssues.join('、') : ''}

请按以下步骤思考再输出：
1. 判断用户适合哪个训练体系
2. 从数据库选具体动作
3. 标注组数次数RPE，尊重用户装备条件`,
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
    const kb = MentalHealthDB.getKnowledgeBase();

    return {
      system: `你是一位积极心理学教练。生成今日心理微练习JSON。

## 心理学系统观（参考框架）
- 核心：${kb.coreView}
- 循环因果：${kb.circularCausality}
- 重构：${kb.reframing}
- 外化：${kb.externalization}
- 分化：${kb.differentiation}
- 日常应用：${kb.dailyTip}

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
4. 用系统观理解问题：关注互动模式而非个体缺陷
5. 重构积极视角：为困扰赋予新意义

## 输出JSON格式
{"practices":[{"name":"练习名","duration":"3分钟","type":"呼吸/感恩/意图/反思"}]}
只输出JSON`,

      user: `## 用户档案
${this._profileDesc(profile)}

请生成适合的今日心理练习。`,
    };
  },

  // ===== 计划（完整每日安排）=====
  _genPlan(profile) {
    const ctMap = { morning: '早间型', intermediate: '中间型', evening: '晚间型' };
    const chronotype = ctMap[profile.chronotype] || '中间型';

    return {
      system: `你是一位生活规划教练。根据用户档案生成今日完整日程安排JSON。

## 输出结构
{
  "date": "今日日期",
  "chronotype": "用户时型",
  "summary": "今日整体建议（一句话）",
  "tasks": [
    {"text":"任务名","category":"work/personal/health/study","duration":60,"note":"备注"}
  ],
  "schedule": [
    {"time":"07:00","label":"起床","type":"routine","duration":10,"desc":"动作描述"},
    {"time":"07:30","label":"早餐","type":"meal","duration":30,"desc":""},
    {"time":"09:00","label":"工作时段","type":"work","duration":120,"desc":""},
    {"time":"12:00","label":"午餐","type":"meal","duration":40,"desc":""},
    {"time":"12:40","label":"午休","type":"break","duration":20,"desc":""},
    {"time":"14:00","label":"工作时段","type":"work","duration":120,"desc":""},
    {"time":"17:00","label":"运动","type":"exercise","duration":30,"desc":""},
    {"time":"19:00","label":"晚餐","type":"meal","duration":40,"desc":""},
    {"time":"21:00","label":"放松","type":"leisure","duration":60,"desc":""},
    {"time":"22:00","label":"睡前准备","type":"sleep","duration":30,"desc":""},
    {"time":"22:30","label":"睡觉","type":"sleep","duration":0,"desc":"晚安"}
  ],
  "nutritionTip": "一句话饮食建议",
  "exerciseTip": "一句话运动建议",
  "mentalTip": "一句话心理建议"
}

## 原则
1. 日程要符合用户时型（${chronotype}）
2. 任务3件，每件不超过10字，具体可执行
3. 工作时间段参考用户久坐习惯安排活动提醒
4. 运动时间参考用户的运动意愿和装备条件
5. 三餐时间规律，符合用户做饭条件
6. 睡前流程符合睡眠科学
7. 鼓励为主，不说教
8. 日程块之间留缓冲时间

只输出JSON，不要其他文字`,

      user: `## 用户档案
${this._profileDesc(profile)}

请生成今日完整安排。`,
    };
  },
};
