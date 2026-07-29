// ===== AI 健康规划引擎（完整版）=====
// 参考膳食AI的详细提示词模式，每个模块都带上完整数据库知识+用户画像

const AIHealth = {
  async generate(module, profile) {
    const apiKey = Store.getApiKey();
    if (!apiKey) return null;

    const gens = { exercise: this._genExercise, sleep: this._genSleep, mental: this._genMental, plan: this._genPlan };
    const gen = gens[module];
    if (!gen) return null;

    for (let a = 0; a < 3; a++) {
      try {
        const p = gen(profile, a);
        const r = await Helpers.callLLM(p.system, p.user, apiKey);
        if (r && this._valid(r, module)) return r;
      } catch (e) { console.warn('AI ' + module + ' failed:', e.message); }
    }
    return null;
  },

  _valid(r, m) {
    if (!r || typeof r !== 'object') return false;
    if (m === 'exercise' && r.weekPlan) return true;
    if (m === 'sleep' && r.schedule) return true;
    if (m === 'mental' && r.practices) return true;
    if (m === 'plan' && r.tasks) return true;
    return false;
  },

  // ===== 运动 =====
  _genExercise(profile, attempt) {
    const pool = ExerciseDB;
    const upper = pool.upperBody.slice(0,5).map(e => e.name + '(' + e.sets + '组x' + e.reps + e.unit + ')').join('、');
    const lower = pool.lowerBody.slice(0,5).map(e => e.name + '(' + e.sets + '组x' + e.reps + e.unit + ')').join('、');
    const cardio = pool.cardio.map(e => e.name + e.duration + e.unit).join('、');
    const stretch = pool.stretch.map(e => e.name + e.duration + e.unit).join('、');
    const micro = pool.micro.map(e => e.name).join('、');

    return {
      system: `你是一位专业运动教练。根据用户档案和以下运动数据库，生成一周运动计划JSON。

## 运动数据库
有氧运动：${cardio}
上肢力量：${upper}
下肢力量：${lower}
拉伸动作：${stretch}
微运动（办公室可做）：${micro}

## 输出要求
- weekPlan：7天，每天3-5个项目
- 每个项目包含 name/duration/type
- 动作必须从数据库中选择
- 返回纯JSON，不要其他文字`,

      user: `## 用户档案
- 年龄：${profile.age}岁 · 性别：${profile.gender === 'male' ? '男' : '女'}
- 身高：${profile.height}cm · 体重：${profile.weight}kg
- 运动意愿：${profile.exerciseWillingness === 'minimal' ? '最低有效量（省事为主）' : profile.exerciseWillingness === 'regular' ? '规律运动（每周3-4次）' : '有灵感就动'}
- 可用装备：${(profile.exerciseEquip || []).join('、') || '无（徒手）'}
- ${profile.exerciseTrackPeriod ? '记录经期' : ''}
- 健康问题：${(profile.healthConditions || []).join('、') || '无'}
- 每日活动量：${['久坐','轻度','中度','高度'][(profile.activityLevel||1)-1]}
- ${profile.aiRequirements || ''}

请生成一周运动计划JSON：{"weekPlan":[{"day":"周一","items":[{"name":"动作名","duration":30,"type":"cardio"}]}]}`,
    };
  },

  // ===== 睡眠 =====
  _genSleep(profile, attempt) {
    return {
      system: `你是一位睡眠医学专家。基于以下睡眠科学知识和用户档案，生成个性化睡眠优化方案JSON。

## 睡眠科学知识
- 成人推荐睡眠时长：7-9小时
- 最佳卧室温度：17-22°C
- 睡前褪黑素分泌受蓝光抑制，睡前1小时应避免屏幕
- 咖啡因半衰期约5小时，下午3点后避免
- 核心体温下降0.5°C触发入睡
- 固定作息时间比"补觉"更有效
- 晚间型人群更容易睡前拖延，需要更严格的睡前流程
- 卧室CO₂浓度应<600ppm

## 输出要求
- schedule：建议的作息时间
- tips：3-5条具体建议
- 返回纯JSON`,

      user: `## 用户档案
- 年龄：${profile.age}岁 · 性别：${profile.gender === 'male' ? '男' : '女'}
- 睡眠时型：${profile.chronotype === 'morning' ? '早间型（百灵鸟）' : profile.chronotype === 'evening' ? '晚间型（猫头鹰）' : '中间型'}
- 睡眠问题：${(profile.sleepIssues || []).join('、') || '无'}
- 平均睡眠：${profile.sleepHours || 7}小时/晚
- 压力水平：${['很低','一般','中等','较大','很大'][(profile.stressLevel||2)-1]}
- 健康状况：${(profile.healthConditions || []).join('、') || '无'}
- 每日运动：${profile.exerciseDays || 0}天/周
- 期望起床：${profile.preferWakeTime || '07:00'} · 期望就寝：${profile.preferBedTime || '23:00'}

请生成睡眠方案JSON：{"schedule":{"bedTime":"23:00","wakeTime":"07:00"},"tips":["建议1","建议2"]}`,
    };
  },

  // ===== 心理 =====
  _genMental(profile, attempt) {
    const pool = MentalHealthDB;
    const intentions = pool.intentionPool.map(i => i.text).join('、');
    const breaths = pool.breathingExercises.map(e => e.name + '(' + e.desc + ')').join('、');

    return {
      system: `你是一位积极心理学教练。基于以下数据库和用户档案，生成今日心理微练习方案JSON。

## 心理练习数据库
今日意图词库：${intentions}
呼吸法：${breaths}
感恩练习：三件好事（在心里想3件好事）/ 感恩三秒（花3秒想1件好事）
CBT认知重构：当出现负面想法时，用"这个想法是真的吗？有证据吗？"来反问

## 输出要求
- practices：2-3个心理练习，每个包含 name/duration/type
- type可取：呼吸/感恩/意图/反思/认知
- 返回纯JSON`,

      user: `## 用户档案
- 年龄：${profile.age}岁 · 性别：${profile.gender === 'male' ? '男' : '女'}
- 当前状态：${(profile.mentalState || []).join('、') || '一般'}
- 每日可投入：${profile.mentalTime === 'minimal' ? '1-2分钟' : profile.mentalTime === 'moderate' ? '3-5分钟' : '5-10分钟'}
- 期望方向：${(profile.mentalGoals || []).join('、') || '日常练习'}
- 压力水平：${['很低','一般','中等','较大','很大'][(profile.stressLevel||2)-1]}
- 睡眠质量：${profile.sleepHours || 7}小时/晚
- 健康状况：${(profile.healthConditions || []).join('、') || '无'}

请生成心理练习JSON：{"practices":[{"name":"练习名","duration":"3分钟","type":"呼吸"}]}`,
    };
  },

  // ===== 计划 =====
  _genPlan(profile, attempt) {
    return {
      system: `你是一位效率教练。基于用户档案生成今日3件最重要的任务。

原则：
- 每件事不超过10个字
- 结合用户的工作类型和生活方式
- 鼓励为主，不说教
- 返回纯JSON`,

      user: `## 用户档案
- 年龄：${profile.age}岁 · 性别：${profile.gender === 'male' ? '男' : '女'}
- 工作类型：${profile.jobType === 'desk' ? '久坐办公' : profile.jobType === 'standing' ? '久站' : profile.jobType === 'mobile' ? '经常走动' : '混合'}
- 每日运动：${profile.exerciseDays || 0}天/周
- 健康状况：${(profile.healthConditions || []).join('、') || '无'}
- 饮食目标：${(profile.healthGoals || []).join('、') || '均衡'}
- 睡眠：${profile.sleepHours || 7}小时/晚
- 心理状态：${(profile.mentalState || []).join('、') || '一般'}
- 额外需求：${profile.aiRequirements || '无'}

请生成今日计划JSON：{"tasks":["任务1","任务2","任务3"],"note":"一句鼓励的话"}`,
    };
  },
};
